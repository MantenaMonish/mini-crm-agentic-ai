import { LeadFilters } from "@/components/crm/lead-filters";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualLeadForm } from "@/components/crm/manual-lead-form";
import { DocumentUpload } from "@/components/crm/document-upload";
import { WorkflowDesigner } from "@/components/crm/workflow-designer";
import { AIInteractionModal } from "@/components/crm/ai-interaction-modal";
import { useCRM } from "@/context/crm-context";

const Header = () => {
  return (
    <header className="gradient-bg shadow-xl border-b border-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-3 floating-animation">
            <i className="fas fa-robot text-yellow-300 mr-4 animate-pulse-slow"></i>
            Mini-CRM with AI Agent
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-3xl mx-auto">
            Built for Piazza Consulting Group – Revolutionizing enterprises with AI agents and workflows.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
            <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
            <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function CRMDashboard() {
  const { showInteractModal, selectedLead, setShowInteractModal } = useCRM();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Lead Management Dashboard */}
        <section className="space-y-8 animate-[fadeIn_0.8s_ease-out]">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 floating-animation">
                <i className="fas fa-tachometer-alt text-white"></i>
              </div>
              Lead Management Dashboard
            </h2>
          </div>
          
          <LeadFilters />
          <div className="card-hover">
            <LeadTable />
          </div>
        </section>
        
        {/* Lead Creation Section */}
        <section className="grid lg:grid-cols-2 gap-8 animate-[slideUp_0.8s_ease-out]" style={{animationDelay: '0.2s'}}>
          <div className="card-hover">
            <ManualLeadForm />
          </div>
          <div className="card-hover">
            <DocumentUpload />
          </div>
        </section>
        
        {/* Workflow Designer */}
        <section className="animate-[slideUp_0.8s_ease-out] card-hover" style={{animationDelay: '0.4s'}}>
          <WorkflowDesigner />
        </section>
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-500">
            <p>&copy; 2024 Piazza Consulting Group. All rights reserved.</p>
            <p className="text-sm mt-2">Built with React.js, Tailwind CSS, and modern web technologies.</p>
          </div>
        </div>
      </footer>

      {/* AI Interaction Modal */}
      {showInteractModal && selectedLead && (
        <AIInteractionModal 
          lead={selectedLead} 
          onClose={() => setShowInteractModal(false)} 
        />
      )}
    </div>
  );
}
