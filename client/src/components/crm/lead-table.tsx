import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useCRM } from "@/context/crm-context";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";

export const LeadTable = () => {
  const { statusFilter, setSelectedLead, setShowInteractModal } = useCRM();
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/leads/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = leads.filter(lead => 
    statusFilter === 'All' || lead.status === statusFilter
  );

  const handleInteract = (lead: Lead) => {
    setSelectedLead(lead);
    setShowInteractModal(true);
  };

  const handleUpdateStatus = (lead: Lead) => {
    const newStatus = lead.status === 'New' ? 'Contacted' : 'New';
    updateStatusMutation.mutate({ id: lead.id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-effect rounded-3xl shadow-2xl p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-shimmer rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden border border-white/20">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Source</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{lead.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600">{lead.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600">{lead.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    lead.status === 'New' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    lead.source === 'Manual' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    <i className={`fas ${lead.source === 'Manual' ? 'fa-keyboard' : 'fa-file-alt'} mr-1`}></i>
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(lead)}
                      disabled={updateStatusMutation.isPending}
                      className="btn-success disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      <i className="fas fa-sync-alt mr-1"></i>
                      Update
                    </button>
                    <button
                      onClick={() => handleInteract(lead)}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-comments mr-1"></i>
                      Interact
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={deleteMutation.isPending}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-inbox text-slate-400 text-4xl mb-4"></i>
          <p className="text-slate-500 text-lg">No leads found matching your filter.</p>
        </div>
      )}
    </div>
  );
};
