import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createShoppingEntry, updateShoppingEntry, fetchAccounts, fetchShoppingHistory } from '../../store/slices/accountSlice';
import { X, ShoppingCart, IndianRupee, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddShoppingModal = ({ isOpen, onClose, initialAccountId = "", editData = null }) => {
    const dispatch = useDispatch();
    const { accounts } = useSelector((state) => state.account);

    const [formData, setFormData] = useState({
        accountId: initialAccountId,
        itemName: '',
        quantity: '',
        unit: 'pcs',
        pricePerUnit: ''
    });

    // Jab Edit mode on ho ya modal khule, fields populate karo
    useEffect(() => {
        if (editData) {
            setFormData({
                accountId: editData.accountId,
                itemName: editData.itemName,
                quantity: editData.quantity,
                unit: editData.unit,
                pricePerUnit: editData.pricePerUnit
            });
        } else {
            // Reset for new entry
            setFormData({
                accountId: initialAccountId,
                itemName: '',
                quantity: '',
                unit: 'pcs',
                pricePerUnit: ''
            });
        }
    }, [editData, isOpen, initialAccountId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.accountId) {
            return toast.error("Bhai, pehle account toh select kar lo!");
        }

        let result;
        if (editData) {
            // 1. UPDATE LOGIC
            result = await dispatch(updateShoppingEntry({ 
                shoppingId: editData._id, 
                formData 
            }));
            if (updateShoppingEntry.fulfilled.match(result)) {
                toast.success("Hisaab update ho gaya!");
            }
        } else {
            // 2. CREATE LOGIC
            result = await dispatch(createShoppingEntry(formData));
            if (createShoppingEntry.fulfilled.match(result)) {
                toast.success("Naya kharcha add ho gaya!");
            }
        }

        // Common steps after success
        if (result.meta.requestStatus === 'fulfilled') {
            dispatch(fetchAccounts()); // Balance update ke liye
            dispatch(fetchShoppingHistory(formData.accountId)); // History refresh
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                
                {/* Header: Title changes based on mode */}
                <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${editData ? 'bg-indigo-50/50' : 'bg-green-50/50'}`}>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        {editData ? (
                            <><Edit3 className="text-indigo-600" /> Edit Purchase</>
                        ) : (
                            <><ShoppingCart className="text-green-600" /> New Shopping Entry</>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* Account Selection - Disabled in Edit Mode */}
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Account (Bucket)</label>
                        <select 
                            disabled={!!editData}
                            required
                            value={formData.accountId}
                            className={`w-full mt-1 px-4 py-3.5 border border-gray-200 rounded-2xl outline-none font-bold appearance-none ${editData ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 cursor-pointer focus:ring-2 focus:ring-green-500'}`}
                            onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                        >
                            <option value="">-- Kaunse Bucket se kharch karein? --</option>
                            {accounts?.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.holderName} (Bal: ₹{acc.balance})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item Name */}
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.itemName}
                            placeholder="e.g. Tea & Snacks, Petrol" 
                            className="w-full mt-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                        />
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                            <input 
                                required
                                type="number" 
                                value={formData.quantity}
                                placeholder="0" 
                                className="w-full mt-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                            <select 
                                value={formData.unit}
                                className="w-full mt-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            >
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="kg">Kilogram (kg)</option>
                                <option value="ltr">Litre (ltr)</option>
                                <option value="bag">Bags</option>
                                <option value="ft">Feet</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Per Unit */}
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Price Per Unit</label>
                        <div className="relative mt-1">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                required
                                type="number" 
                                value={formData.pricePerUnit}
                                placeholder="0.00" 
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                                onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Total Estimate Display */}
                    {formData.quantity && formData.pricePerUnit && (
                        <div className={`p-4 rounded-2xl border-2 border-dashed flex justify-between items-center ${editData ? 'bg-indigo-50 border-indigo-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <span className={`font-bold ${editData ? 'text-indigo-700' : 'text-yellow-700'}`}>
                                {editData ? "Updated Total:" : "Total Kharcha:"}
                            </span>
                            <span className={`text-xl font-black ${editData ? 'text-indigo-800' : 'text-yellow-800'}`}>
                                ₹{(formData.quantity * formData.pricePerUnit).toLocaleString()}
                            </span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className={`w-full py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 text-white ${editData ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
                    >
                        {editData ? "Update Changes" : "Complete Purchase"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShoppingModal;