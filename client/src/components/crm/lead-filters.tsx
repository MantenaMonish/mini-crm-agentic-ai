import { useCRM } from "@/context/crm-context";

export const LeadFilters = () => {
  const { statusFilter, setStatusFilter } = useCRM();
  
  const filters = ['All', 'New', 'Contacted'];
  
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => setStatusFilter(filter)}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            statusFilter === filter
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl'
              : 'glass-effect text-slate-700 border border-white/30 hover:bg-white/70 hover:shadow-lg'
          }`}
        >
          <i className={`fas ${filter === 'All' ? 'fa-list' : filter === 'New' ? 'fa-star' : 'fa-check-circle'} mr-2`}></i>
          {filter}
        </button>
      ))}
    </div>
  );
};
