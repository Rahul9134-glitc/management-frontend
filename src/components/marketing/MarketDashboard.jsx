import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    PlusCircle, Target, IndianRupee, Trash2, 
    Search, FileText, Loader2, ShoppingCart, TrendingUp, Edit3 
} from 'lucide-react';

// Components
import AddAccountModal from './AddAccount';
import AddShoppingModal from './AddShoppingModal';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { toast } from 'react-hot-toast';

const MarketingDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { accounts, loading } = useSelector((state) => state.account);

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(""); 
    const [editAccountData, setEditAccountData] = useState(null); // Edit ke liye data
    
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    // Handle Delete
    const handleDeleteAccount = async (id) => {
        if(window.confirm("Bhai, kya aap sach mein ye bucket delete karna chahte hain?")) {
            // dispatch(deleteAccount(id)); // Isko slice mein handle karna
            toast.success("Bucket delete ho gaya!");
        }
    };

    const filteredAccounts = accounts?.filter(acc => {
        const matchesTab = activeTab === "All" || (activeTab === "Active" ? acc.balance > 0 : acc.balance <= 0);
        const matchesSearch = acc.holderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              acc.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const totalBalance = accounts?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
            
            {/* 1. HEADER SECTION */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Marketing Buckets</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage your projects & expenses</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => {
                            setSelectedAccountId("");
                            setIsShoppingModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95"
                    >
                        <ShoppingCart size={20} /> New Shopping
                    </button>
                    <button 
                        onClick={() => {
                            setEditAccountData(null); // Create new mode
                            setIsAccountModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <PlusCircle size={20} /> Create Bucket
                    </button>
                </div>
            </div>

            {/* 2. STATS CARDS (No change here) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Target size={28} /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Buckets</p>
                        <h3 className="text-2xl font-black text-gray-900">{accounts?.length || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 md:col-span-2">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><IndianRupee size={28} /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Combined Balance</p>
                        <h3 className="text-3xl font-black text-gray-900">₹{totalBalance.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* 3. SEARCH & TABS (No change here) */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search buckets..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-medium"
                    />
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100">
                    {["All", "Active", "Empty"].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. ACCOUNTS GRID (Update logic added here) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAccounts?.length > 0 ? filteredAccounts.map(acc => (
                    <div key={acc._id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative group hover:shadow-2xl transition-all duration-300">
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${acc.balance > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                <Target size={24} />
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <button 
                                    onClick={() => {
                                        setEditAccountData(acc); // Pura account data modal ko bheja
                                        setIsAccountModalOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${acc.balance > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {acc.balance > 0 ? 'Active' : 'Empty'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-xl text-gray-900 tracking-tight">{acc.holderName}</h3>
                            <p className="text-sm font-bold text-gray-400 mt-1 line-clamp-1">{acc.purpose}</p>
                        </div>

                        <div className="my-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center relative overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Available Balance</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">₹{acc.balance.toLocaleString()}</p>
                            <TrendingUp className="absolute -bottom-2 -right-2 text-gray-100 w-24 h-24 -rotate-12" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => navigate(`/marketing/history/${acc._id}`)}
                                className="col-span-2 flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all"
                            >
                                <FileText size={16} /> View History
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedAccountId(acc._id);
                                    setIsShoppingModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 py-3.5 bg-green-50 text-green-700 rounded-2xl font-black text-[10px] uppercase hover:bg-green-100 transition-all"
                            >
                                <ShoppingCart size={14} /> Shop
                            </button>
                            <button 
                                onClick={() => handleDeleteAccount(acc._id)}
                                className="flex items-center justify-center gap-2 py-3.5 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-black">No buckets found.</p>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            <AddAccountModal 
                isOpen={isAccountModalOpen} 
                onClose={() => {
                    setIsAccountModalOpen(false);
                    setEditAccountData(null); // Close par reset
                }} 
                editData={editAccountData} // Edit ke liye naya prop
            />

            <AddShoppingModal 
                isOpen={isShoppingModalOpen} 
                onClose={() => setIsShoppingModalOpen(false)} 
                initialAccountId={selectedAccountId}
            />

        </div>
    );
};

export default MarketingDashboard;