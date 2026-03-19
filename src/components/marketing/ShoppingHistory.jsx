import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    ArrowLeft, ShoppingBag, Calendar, 
    Trash2, Edit, IndianRupee, 
    Search, Plus, Loader2, Download, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';

// Vite 6 compatibility fix for jspdf-autotable
const autoTable = autoTableModule.default || autoTableModule;

import { fetchShoppingHistory, deleteShoppingEntry, fetchAccounts } from '../../store/slices/accountSlice';
import AddShoppingModal from './AddShoppingModal';

const ShoppingHistory = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { history, accounts, loading } = useSelector((state) => state.account);
    const [searchTerm, setSearchTerm] = useState("");
    const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const currentAccount = accounts.find(acc => acc._id === accountId);
    const accountHistory = history[accountId] || [];

    useEffect(() => {
        if (accountId) {
            dispatch(fetchShoppingHistory(accountId));
        }
    }, [dispatch, accountId]);

    // --- PDF LOGIC (FIXED) ---
    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            
            // PDF Header Setup
            doc.setFontSize(20);
            doc.text(`${currentAccount?.holderName || "Account"} Shopping History`, 14, 22);
            
            doc.setFontSize(10);
            doc.text(`Remaining Balance: Rs. ${currentAccount?.balance?.toLocaleString()}`, 14, 30);
            
            // Define the columns for the table
            const tableColumn = ["Date", "Item Name", "Quantity", "Rate", "Total"];
            
            // Prepare the rows from the filtered history
            const tableRows = filteredHistory.map(item => [
                new Date(item.createdAt).toLocaleDateString('en-IN'),
                item.itemName,
                `${item.quantity} ${item.unit}`,
                `Rs. ${item.pricePerUnit}`,
                `Rs. ${item.totalAmount}`
            ]);

            // Call autoTable (Fixed the double-doc argument error)
            doc.autoTable({
                head: [tableColumn], // Must be wrapped in an array [[]]
                body: tableRows,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
                styles: { fontSize: 9, cellPadding: 3 },
            });

            doc.save(`${currentAccount?.holderName || 'Shopping'}_History.pdf`);
            toast.success("PDF Download ho gaya!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("PDF generate karne mein error aaya.");
        }
    };

    const handleEditClick = (item) => {
        setSelectedEntry(item);
        setIsShoppingModalOpen(true);
    };

    const handleDeleteClick = async (shoppingId) => {
        if (window.confirm("Entry delete kar dein?")) {
            const result = await dispatch(deleteShoppingEntry(shoppingId));
            if (deleteShoppingEntry.fulfilled.match(result)) {
                toast.success("Delete ho gaya!");
                dispatch(fetchAccounts());
                dispatch(fetchShoppingHistory(accountId));
            }
        }
    };

    const filteredHistory = accountHistory.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && accountHistory.length === 0) return (
        <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">
                            {currentAccount?.holderName || "Account"}
                        </h1>
                        <p className="text-sm font-bold text-green-600 mt-1">₹{currentAccount?.balance?.toLocaleString()} Left</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={downloadPDF} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-gray-100 px-5 py-3 rounded-2xl font-bold text-sm"><Download size={18}/> PDF</button>
                    <button onClick={() => setIsShoppingModalOpen(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm"><Plus size={18}/> New</button>
                </div>
            </div>

            {/* SEARCH */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search items..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase">Date</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase">Item</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase text-center">Qty</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase text-right">Total</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredHistory.map((item) => (
                                <tr key={item._id} className="flex flex-col md:table-row p-5 md:p-0 hover:bg-gray-50/50 relative">
                                    <td className="md:p-5 text-xs font-bold text-gray-400 md:text-gray-700">
                                        <span className="md:hidden">Date: </span>
                                        {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="md:p-5 mt-1 md:mt-0">
                                        <p className="font-black text-gray-900">{item.itemName}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Rate: ₹{item.pricePerUnit} / {item.unit}</p>
                                    </td>
                                    <td className="md:p-5 md:text-center mt-2 md:mt-0">
                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-black border border-indigo-100">
                                            {item.quantity} {item.unit}
                                        </span>
                                    </td>
                                    <td className="md:p-5 md:text-right font-black text-red-600 text-lg md:text-base mt-1 md:mt-0">
                                        - ₹{item.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="md:p-5 mt-4 md:mt-0">
                                        <div className="flex items-center gap-2 md:justify-center">
                                            <button 
                                                onClick={() => handleEditClick(item)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 md:p-2 bg-gray-50 md:bg-transparent text-gray-600 hover:text-indigo-600 rounded-xl border border-gray-100 md:border-transparent transition-all"
                                            >
                                                <Edit size={16} /> <span className="md:hidden text-sm font-bold">Edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(item._id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 md:p-2 bg-red-50 md:bg-transparent text-red-400 hover:text-red-600 rounded-xl border border-red-100 md:border-transparent transition-all"
                                            >
                                                <Trash2 size={16} /> <span className="md:hidden text-sm font-bold">Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddShoppingModal 
                isOpen={isShoppingModalOpen} 
                onClose={() => { setIsShoppingModalOpen(false); setSelectedEntry(null); }} 
                initialAccountId={accountId}
                editData={selectedEntry}
            />
        </div>
    );
};

export default ShoppingHistory;