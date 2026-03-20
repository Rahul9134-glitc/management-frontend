import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { fetchAllWorkers, deleteWorker } from '../store/slices/WorkerReducer';
import { 
  IndianRupee, Edit2, Trash2, Loader2, 
  CheckCircle, XCircle, MoreVertical, Eye, Calendar, Save, UserX
} from 'lucide-react';
import AddWorkerModal from '../components/AddWorkerModals';
// import api from '../api/axios.js';
import axios from 'axios';

const WorkerList = ({ searchTerm }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workers, loading } = useSelector((state) => state.worker);

  const [activeTab, setActiveTab] = useState("All"); 
  const [attendance, setAttendance] = useState({}); 
  const [openMenu, setOpenMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: "", description: "" });
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);

  // Tab aur Search badalne par data fetch karein
  useEffect(() => {
    dispatch(fetchAllWorkers({ role: activeTab, search: searchTerm }));
  }, [dispatch, activeTab, searchTerm]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Kya aap sach mein ${name} ko delete karna chahte hain?`)) {
      dispatch(deleteWorker(id));
      setOpenMenu(null);
    }
  };

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
    setOpenMenu(null);
  };

  const handleAttendance = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const saveDailySheet = async () => {
    const workerIds = Object.keys(attendance);
    if (workerIds.length === 0) return alert("Pehle attendance mark karo!");

    setIsSaving(true);
    try {
      const attendanceRecords = workerIds.map(id => ({
        workerId: id,
        status: attendance[id] === 'P' ? 'Present' : attendance[id] === 'H' ? 'Half-Day' : 'Absent'
      }));
      await axios.post("https://management-backend-a3je.onrender.com/api/v1/attendence/mark", { date: selectedDate, attendanceRecords });
      alert("Daily Sheet save ho gayi!");
      setAttendance({});
      dispatch(fetchAllWorkers({ role: activeTab, search: searchTerm }));
    } catch (error) {
      alert("Sheet save karne mein error!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    if (!paymentData.amount) return alert("Amount likho bhai!");
    setIsPaymentSaving(true);
    try {
      await axios.post("https://management-backend-a3je.onrender.com/api/v1/payment/add", { 
        workerId: selectedWorker._id, 
        amount: Number(paymentData.amount), 
        description: paymentData.description 
      });
      alert("Payment save ho gayi!");
      setIsPaymentModalOpen(false);
      setPaymentData({ amount: "", description: "" });
      dispatch(fetchAllWorkers({ role: activeTab, search: searchTerm }));
    } catch (error) {
      alert("Payment failed!");
    } finally {
      setIsPaymentSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="bg-white flex flex-col">
      {/* Category Tabs - Added Inactive Tab */}
      <div className="flex border-b bg-gray-50/50 overflow-x-auto no-scrollbar">
        {["All", "Labour", "Rajmistri", "Inactive"].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-6 md:px-8 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-gray-400"}`}
          >
            {tab === "Inactive" ? "🚫 Inactive" : tab}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white sticky top-0 z-10 border-b">
            <tr className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">
              <th className="px-4 md:px-6 py-4">Worker Details</th>
              <th className="hidden md:table-cell px-4 py-4">Earned</th>
              <th className="hidden md:table-cell px-4 py-4">Advance</th>
              <th className="hidden md:table-cell px-4 py-4">Balance</th>
              <th className="px-2 md:px-4 py-4 text-center">Attendance</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {workers?.length > 0 ? workers.map((worker) => (
              <tr key={worker._id} className={`hover:bg-indigo-50/20 transition-colors group text-sm ${!worker.isActive ? 'bg-gray-50/50 opacity-80' : ''}`}>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`min-w-[36px] h-[36px] md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold uppercase text-xs ${worker.isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                      {worker.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className={`font-bold truncate max-w-[100px] md:max-w-full ${worker.isActive ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                        {worker.name} {!worker.isActive && "(Inactive)"}
                      </p>
                      <div className="flex flex-col">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">{worker.role} • ₹{worker.dailyWage}</p>
                        {worker.isActive && (
                            <p className="md:hidden text-[9px] font-bold text-indigo-600">
                                Bal: ₹{(worker.totalEarned || 0) - (worker.advance || 0)}
                            </p>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Dashboard condition: Inactive workers ka paisa list mein blurred ya hidden rakhein agar aap chahein */}
                <td className="hidden md:table-cell px-4 py-4">₹{worker.totalEarned || 0}</td>
                <td className="hidden md:table-cell px-4 py-4 text-red-500">₹{worker.advance || 0}</td>
                <td className={`hidden md:table-cell px-4 py-4 font-bold ${worker.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    ₹{(worker.totalEarned || 0) - (worker.advance || 0)}
                </td>
                
                <td className="px-2 md:px-4 py-4">
                  <div className="flex justify-center gap-1 md:gap-3">
                    <button 
                      disabled={!worker.isActive} 
                      onClick={() => handleAttendance(worker._id, 'P')} 
                      className={`p-1 transition-all ${!worker.isActive ? 'cursor-not-allowed opacity-30' : attendance[worker._id] === 'P' ? "text-green-600 scale-110" : "text-gray-300"}`}
                    >
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    {/* ... (Similarly handle Half-Day and Absent buttons with disabled={!worker.isActive}) */}
                    <button 
                      disabled={!worker.isActive} 
                      onClick={() => handleAttendance(worker._id, 'H')} 
                      className={`p-1 transition-all ${!worker.isActive ? 'cursor-not-allowed opacity-30' : attendance[worker._id] === 'H' ? "text-orange-500 scale-110" : "text-gray-300"}`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 border-2 rounded-full flex items-center justify-center font-bold text-[8px] md:text-[10px] ${attendance[worker._id] === 'H' ? "border-orange-500" : "border-gray-300"}`}>½</div>
                    </button>
                    <button 
                      disabled={!worker.isActive} 
                      onClick={() => handleAttendance(worker._id, 'A')} 
                      className={`p-1 transition-all ${!worker.isActive ? 'cursor-not-allowed opacity-30' : attendance[worker._id] === 'A' ? "text-red-600 scale-110" : "text-gray-300"}`}
                    >
                      <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </td>

                <td className="px-4 py-4 text-right relative">
                  <div className="hidden lg:flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/worker/view/${worker._id}`)} className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-100 rounded-lg shadow-sm bg-white"><Eye className="w-4 h-4" /></button>
                    {worker.isActive && (
                        <button onClick={() => { setSelectedWorker(worker); setIsPaymentModalOpen(true); }} className="p-2 text-gray-400 hover:text-green-600 border border-gray-100 rounded-lg shadow-sm bg-white"><IndianRupee className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => handleEdit(worker)} className="p-2 text-gray-400 hover:text-blue-600 border border-gray-100 rounded-lg shadow-sm bg-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(worker._id, worker.name)} className="p-2 text-gray-400 hover:text-red-600 border border-gray-100 rounded-lg shadow-sm bg-white"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="lg:hidden">
                    <button onClick={() => setOpenMenu(openMenu === worker._id ? null : worker._id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === worker._id && (
                      <div className="absolute right-4 top-12 bg-white shadow-2xl border border-gray-100 rounded-xl z-50 w-44 py-2 overflow-hidden animate-in fade-in zoom-in duration-200 text-left">
                        <button onClick={() => navigate(`/worker/view/${worker._id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-gray-50 border-b border-gray-50"><Eye size={16}/> View Details</button>
                        {worker.isActive && (
                            <button onClick={() => { setSelectedWorker(worker); setIsPaymentModalOpen(true); setOpenMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-green-600 hover:bg-gray-50 border-b border-gray-50"><IndianRupee size={16}/> Add Payment</button>
                        )}
                        <button onClick={() => handleEdit(worker)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-gray-50 border-b border-gray-50"><Edit2 size={16}/> Edit Detail / Status</button>
                        <button onClick={() => handleDelete(worker._id, worker.name)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-gray-50"><Trash2 size={16}/> Delete Forever</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-400 font-medium">Koi worker nahi mila!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center">
                <span>Advance: {selectedWorker?.name}</span>
                <button onClick={() => setIsPaymentModalOpen(false)}><XCircle size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Amount (₹)</label>
                <input type="number" placeholder="Kitna paisa diya?" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-bold" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <input type="text" placeholder="Ration, Cash, etc." className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500" value={paymentData.description} onChange={(e) => setPaymentData({...paymentData, description: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100">Cancel</button>
                <button onClick={handleSavePayment} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">{isPaymentSaving ? "Saving..." : "Save Paisa"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <AddWorkerModal closeModal={() => setIsModalOpen(false)} refreshData={() => dispatch(fetchAllWorkers({ role: activeTab, search: searchTerm }))} editData={selectedWorker} />}

      {/* Footer */}
      <div className="bg-gray-50 px-4 md:px-6 py-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Total {activeTab}: {workers?.length}</span>
          <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-xs font-bold text-gray-600 outline-none" />
          </div>
        </div>
        <button 
          onClick={saveDailySheet} 
          disabled={isSaving || activeTab === 'Inactive'} 
          className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] shadow-lg ${activeTab === 'Inactive' ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}`}
        >
          {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={16}/> Save Daily Sheet</>}
        </button>
      </div>
    </div>
  );
};

export default WorkerList;