import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createAccount, updateAccountName } from '../../store/slices/accountSlice'; 
import { X, Target, IndianRupee, PenSquare, Save, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddAccountModal = ({ isOpen, onClose, editData = null }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        holderName: '',
        purpose: '',
        extraAmount: '' 
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                holderName: editData.holderName || '',
                purpose: editData.purpose || '',
                extraAmount: '' // Edit mode mein hum naya amount mangte hain
            });
        } else {
            setFormData({ holderName: '', purpose: '', extraAmount: '' });
        }
    }, [editData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editData) {
            // --- UPDATE LOGIC WITH MATH ---
            const oldBalance = Number(editData.balance) || 0;
            const inputAmount = Number(formData.extraAmount) || 0;
            
            // Backend "balance" key expect kar raha hai, toh hum total bhejenge
            const finalBalance = oldBalance + inputAmount;

            console.log("Updating Account ID:", editData._id);
            console.log("Calculated Final Balance:", finalBalance);

            const result = await dispatch(updateAccountName({ 
                accountId: editData._id, 
                holderName: formData.holderName,
                purpose: formData.purpose,
                balance: finalBalance 
            }));
            
            if (updateAccountName.fulfilled.match(result)) {
                toast.success(`Bucket updated! Total: ₹${finalBalance}`);
                onClose();
            } else {
                toast.error("Update failed. Check console!");
            }
        } else {
            // --- CREATE LOGIC ---
            const result = await dispatch(createAccount({
                holderName: formData.holderName,
                purpose: formData.purpose,
                initialAmount: formData.extraAmount 
            }));
            if (createAccount.fulfilled.match(result)) {
                toast.success("New Bucket created!");
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                
                {/* Header Section */}
                <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${editData ? 'bg-amber-50/50' : 'bg-indigo-50/50'}`}>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        {editData ? (
                            <><PenSquare className="text-amber-600" /> Update Bucket</>
                        ) : (
                            <><Target className="text-indigo-600" /> New Bucket</>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Bucket Name</label>
                            <input 
                                required
                                type="text" 
                                value={formData.holderName}
                                className="w-full mt-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                onChange={(e) => setFormData({...formData, holderName: e.target.value})}
                            />
                        </div>

                        {/* Purpose Input */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Purpose</label>
                            <textarea 
                                required
                                rows="2"
                                value={formData.purpose}
                                className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold resize-none"
                                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                            ></textarea>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                {editData ? "Add Money (Optional)" : "Starting Balance"}
                            </label>
                            <div className="relative mt-1">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="number" 
                                    value={formData.extraAmount}
                                    placeholder={editData ? "0" : "0.00"} 
                                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    onChange={(e) => setFormData({...formData, extraAmount: e.target.value})}
                                />
                                {editData && <PlusCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                            </div>
                            {editData && (
                                <p className="text-[10px] font-bold text-gray-400 mt-2 ml-1">
                                    Current Balance: ₹{editData.balance}. Jo yahan likhoge wo add ho jayega.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        type="submit"
                        className={`w-full py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            editData 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                        }`}
                    >
                        {editData ? <><Save size={20}/> Save Changes</> : 'Create Bucket'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAccountModal;