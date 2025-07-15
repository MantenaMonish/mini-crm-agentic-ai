import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Action Node Component
const ActionNode = ({ data, id }: { data: { label: string; action: string; onDelete?: (id: string) => void }; id: string }) => {
  const getNodeStyle = (action: string) => {
    switch (action) {
      case 'Send Email':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'Update Status':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Create Task':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'Send SMS':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getIcon = (action: string) => {
    switch (action) {
      case 'Send Email':
        return '📧';
      case 'Update Status':
        return '✅';
      case 'Create Task':
        return '📋';
      case 'Send SMS':
        return '📱';
      default:
        return '⚡';
    }
  };

  return (
    <div className={`px-6 py-4 rounded-xl border-2 shadow-md min-w-[160px] relative ${getNodeStyle(data.action)}`}>
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors duration-200"
        title="Delete node"
      >
        ×
      </button>
      <div className="text-center font-semibold">
        <div className="text-lg mb-1">{getIcon(data.action)}</div>
        <div className="text-sm">{data.label}</div>
      </div>
      <div className="flex justify-center mt-2">
        <select 
          value={data.action} 
          onChange={(e) => {
            // Update node action - would need callback from parent
          }}
          className="text-xs bg-white border rounded px-2 py-1"
        >
          <option value="Send Email">Send Email</option>
          <option value="Update Status">Update Status</option>
          <option value="Create Task">Create Task</option>
          <option value="Send SMS">Send SMS</option>
        </select>
      </div>
    </div>
  );
};



const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'input',
    data: { label: '🚀 Lead Created' },
    position: { x: 250, y: 50 },
    style: { 
      background: '#3B82F6', 
      color: 'white', 
      borderRadius: '12px',
      padding: '10px 20px',
      border: 'none',
      fontWeight: 'bold',
      minWidth: '160px',
      textAlign: 'center'
    },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export const WorkflowDesigner = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [actionNodeCount, setActionNodeCount] = useState(0);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const nodeTypes = useMemo(() => ({
    actionNode: ActionNode,
  }), []);

  const clearAllNodes = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setActionNodeCount(0);
    
    toast({
      title: "Workflow Cleared",
      description: "All action nodes have been removed",
    });
  }, [setNodes, setEdges, toast]);

  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflow: { name: string; nodes: string; edges: string }) => {
      const response = await apiRequest('POST', '/api/workflows', workflow);
      return response.json();
    },
    onSuccess: () => {
      simulateWorkflowExecution();
      toast({
        title: "Success",
        description: "Workflow saved and executed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    },
  });

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setActionNodeCount(prev => Math.max(0, prev - 1));
    
    toast({
      title: "Node Deleted",
      description: "Action node removed from workflow",
    });
  }, [setNodes, setEdges, toast]);

  const addActionNode = (action: string) => {
    if (actionNodeCount >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only add up to 3 action nodes",
        variant: "destructive",
      });
      return;
    }
    
    const newNode: Node = {
      id: `action-${actionNodeCount + 1}`,
      type: 'actionNode',
      data: { 
        label: action, 
        action,
        onDelete: deleteNode
      },
      position: { x: 250, y: 200 + (actionNodeCount * 150) },
      deletable: true,
    };
    
    setNodes((nds) => [...nds, newNode]);
    setActionNodeCount(prev => prev + 1);
  };

  const simulateWorkflowExecution = () => {
    const actionNodes = nodes.filter(node => node.type === 'actionNode');
    
    actionNodes.forEach((node, index) => {
      setTimeout(() => {
        const action = node.data.action;
        let message = '';
        
        switch (action) {
          case 'Send Email':
            message = `📧 Email sent to lead`;
            break;
          case 'Update Status':
            message = `✅ Status updated to Contacted`;
            break;
          case 'Create Task':
            message = `📋 Task created for lead`;
            break;
          case 'Send SMS':
            message = `📱 SMS sent to lead`;
            break;
          default:
            message = `⚡ Action executed: ${action}`;
        }
        
        toast({
          title: "Workflow Action",
          description: message,
        });
        
        console.log(`Workflow Action ${index + 1}: ${message}`);
      }, (index + 1) * 1000); // Stagger the actions by 1 second each
    });
  };

  const saveAndExecuteWorkflow = () => {
    const workflowData = {
      name: `Workflow ${Date.now()}`,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges)
    };
    
    saveWorkflowMutation.mutate(workflowData);
  };

  return (
    <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 animate-pulse-slow">
            <i className="fas fa-project-diagram text-white"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            Workflow Designer
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addActionNode('Send Email')}
            disabled={actionNodeCount >= 3}
            className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            + Add Action
          </button>
          
          <button
            onClick={clearAllNodes}
            disabled={actionNodeCount === 0}
            className="bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            Clear All
          </button>
          
          <button
            onClick={saveAndExecuteWorkflow}
            disabled={saveWorkflowMutation.isPending || actionNodeCount === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            {saveWorkflowMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              'Save & Execute'
            )}
          </button>
        </div>
      </div>
      
      <div className="h-96 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
        >
          <Background variant={BackgroundVariant.Lines} gap={20} size={1} />
          <Controls />
          <MiniMap 
            className="!bg-slate-100"
            maskColor="rgb(240, 240, 240, 0.6)"
          />
        </ReactFlow>
      </div>
      
      <div className="mt-4 text-sm text-slate-600">
        <div className="flex justify-between items-center">
          <div>
            <p><strong>Instructions:</strong> Add action nodes and connect them by dragging from one node to another</p>
            <p><strong>Current nodes:</strong> {actionNodeCount}/3 action nodes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addActionNode('Send Email')}
              disabled={actionNodeCount >= 3}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs hover:bg-green-200 disabled:opacity-50"
            >
              📧 Email
            </button>
            <button
              onClick={() => addActionNode('Update Status')}
              disabled={actionNodeCount >= 3}
              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs hover:bg-yellow-200 disabled:opacity-50"
            >
              ✅ Status
            </button>
            <button
              onClick={() => addActionNode('Create Task')}
              disabled={actionNodeCount >= 3}
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-xs hover:bg-indigo-200 disabled:opacity-50"
            >
              📋 Task
            </button>
            <button
              onClick={() => addActionNode('Send SMS')}
              disabled={actionNodeCount >= 3}
              className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs hover:bg-orange-200 disabled:opacity-50"
            >
              📱 SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
