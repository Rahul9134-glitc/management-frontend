import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createExpenseAction } from '../../store/slices/expenceSlice';
import { X, IndianRupee, ShoppingBag, Loader2, Info } from 'lucide-react';

const AddExpenseModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { currentGroup } = useSelector((state) => state.group);
    const { loading } = useSelector((state) => state.expense);

    // Active members count for the split hint
    const activeMembersCount = currentGroup?.members?.filter(m => m.status === 'active').length || 0;

    const [formData, setFormData] = useState({
        itemName: '',
        amount: '',
        groupId: currentGroup?._id || ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- IMPORTANT: Backend ko ye bhi bata rahe hain ki kharcha sirf active members mein katega ---
        // Agar backend model automatic split among group members hai, toh backend controller mein
        // member.status === 'active' ka filter hona chahiye.
        const finalData = { ...formData, groupId: currentGroup?._id };
        
        const result = await dispatch(createExpenseAction(finalData));
        if (createExpenseAction.fulfilled.match(result)) {
            onClose();
            setFormData({ itemName: '', amount: '', groupId: '' });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
                <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="mb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <ShoppingBag size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Naya Kharcha?</h2>
                    <p className="text-gray-500 text-sm font-medium">Entry karo bhai, dosti bani rahegi!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Kiske liye kharcha kiya?</label>
                        <input
                            type="text"
                            placeholder="e.g. Room Rent, Party, Dinner"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-300 transition-all font-medium"
                            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Kitna Paisa Hua?</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><IndianRupee size={18} /></span>
                            <input
                                type="number"
                                placeholder="0.00"
                                required
                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-300 transition-all font-black text-lg"
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl flex items-start gap-3 border border-blue-100">
                        <Info className="text-blue-500 mt-0.5" size={16} />
                        <p className="text-[11px] text-blue-700 font-bold uppercase leading-relaxed tracking-wide">
                            Ye kharcha abhi {activeMembersCount} Active doston mein barabar batega. Inactive doston ko nahi dena padega.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:bg-indigo-300"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Add Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;