import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
import { fetchAllWorkers } from '../store/slices/WorkerReducer'; // Redux action
import { UserPlus, Search, Loader2 } from 'lucide-react';
import AddWorkerModal from '../components/AddWorkerModals';
import WorkerList from "./WorkerList";

const Workers = () => {
  const dispatch = useDispatch();
  
  // Redux se data aur loading state nikalna
  const { workers, loading } = useSelector((state) => state.worker);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Search aur Debouncing logic
  useEffect(() => {
    // 500ms wait karega jab user typing rok dega tabhi API call jayegi
    const delayDebounceFn = setTimeout(() => {
      // Role default "All" rakha hai aur search term pass kiya hai
      dispatch(fetchAllWorkers({ role: "All", search: searchTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  // Data manually refresh karne ke liye function
  const handleRefresh = () => {
    dispatch(fetchAllWorkers({ role: "All", search: searchTerm }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. TOP SECTION: STATS & BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Worker <span className="text-indigo-600">Central</span>
          </h1>
          <p className="text-gray-500 mt-1">Yahan se aap workers add, edit aur unka data control kar sakte hain.</p>
        </div>
        
        {/* QUICK ACTIONS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Add Worker
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
           <div className="px-4 py-2 text-sm font-bold text-indigo-600 bg-white shadow-sm rounded-lg">
             Total: {workers?.length || 0}
           </div>
        </div>
      </div>

      {/* 3. WORKER LIST TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         {/* Ab loading aur workers Redux se aa rahe hain */}
         <WorkerList 
            workers={workers} 
            loading={loading} 
            searchTerm={searchTerm} 
            refreshData={handleRefresh} 
         />
      </div>

      {/* 4. ADD WORKER MODAL (POPUP) */}
      {isModalOpen && (
        <AddWorkerModal 
          closeModal={() => setIsModalOpen(false)} 
          refreshData={handleRefresh} 
        />
      )}

    </div>
  );
};

export default Workers;