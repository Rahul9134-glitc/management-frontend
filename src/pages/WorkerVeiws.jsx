import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, History, User, Phone, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import api from '../api/axios';
import jsPDF from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';

// Vite 6 / Modern Import Compatibility
const autoTable = autoTableModule.default || autoTableModule;

const WorkerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/worker/detail/${id}`);
                setData(res.data.data);
            } catch (err) {
                alert("Data load karne mein dikkat aayi!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            
            // --- PDF Header ---
            doc.setFontSize(22);
            doc.setTextColor(63, 81, 181);
            doc.text("WORKER SALARY REPORT", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 28);
            doc.line(14, 32, 196, 32);

            // --- Worker Profile Info ---
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text(`Name: ${data.name}`, 14, 42);
            doc.setFont(undefined, 'normal');
            doc.text(`Role: ${data.role}`, 14, 49);
            doc.text(`Phone: ${data.phone || 'N/A'}`, 14, 56);
            doc.text(`Daily Wage: Rs. ${data.dailyWage}`, 14, 63);

            // --- Summary Stats Box ---
            doc.setFillColor(245, 247, 251);
            doc.rect(14, 70, 182, 22, 'F');
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0);
            doc.text(`Total Earned: Rs. ${data.totalEarned}`, 20, 83);
            doc.setTextColor(220, 53, 69); // Red
            doc.text(`Total Advance: Rs. ${data.totalAdvance}`, 80, 83);
            doc.setTextColor(40, 167, 69); // Green
            doc.text(`Balance Due: Rs. ${data.totalEarned - data.totalAdvance}`, 140, 83);

            // --- Attendance Table (FIXED) ---
            doc.setTextColor(0);
            doc.setFontSize(14);
            doc.text("Attendance Records", 14, 105);
            
            autoTable(doc, {
                startY: 110,
                head: [['Date', 'Status', 'Daily Wage', 'Earned']],
                body: data.attendanceHistory.map(h => [
                    new Date(h.date).toLocaleDateString('en-GB'),
                    h.status,
                    `Rs. ${data.dailyWage}`,
                    `Rs. ${h.earnedAmount}`
                ]),
                headStyles: { fillColor: [63, 81, 181] },
                theme: 'striped'
            });

            // --- Payment Table (FIXED) ---
            const finalY = doc.lastAutoTable.finalY || 150;
            doc.setFontSize(14);
            doc.text("Payment (Advance) History", 14, finalY + 15);
            
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Date', 'Description', 'Amount Paid']],
                body: data.paymentHistory.map(p => [
                    new Date(p.date || p.createdAt).toLocaleDateString('en-GB'),
                    p.description || 'Cash Advance',
                    `Rs. ${p.amount}`
                ]),
                headStyles: { fillColor: [239, 68, 68] },
                theme: 'grid'
            });

            // Save PDF
            doc.save(`${data.name}_Salary_Slip.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
            alert("PDF banane mein error aaya!");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-gray-50/30 min-h-screen">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-all group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Dashboard
                </button>
                
                <button 
                    onClick={generatePDF}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    <Download size={20} /> Export PDF Report
                </button>
            </div>

            {/* Profile Section */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-inner ${data?.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'}`}>
                        {data?.name.charAt(0)}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{data?.name}</h1>
                            {data?.isActive ? 
                                <CheckCircle size={24} className="text-green-500 fill-green-50" /> : 
                                <XCircle size={24} className="text-red-400" />
                            }
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{data?.role} • ₹{data?.dailyWage}/Day</p>
                        <a href={`tel:${data?.phone}`} className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl w-fit hover:bg-indigo-100 transition-all">
                            <Phone size={14} fill="currentColor" /> {data?.phone || "No Number"}
                        </a>
                    </div>
                </div>

                <div className="w-full md:w-auto text-center md:text-right">
                    <div className="px-10 py-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2.5rem] border border-green-100">
                        <p className="text-xs text-green-600 font-black uppercase tracking-[0.2em] mb-1">Total Balance Due</p>
                        <p className="text-5xl font-black text-green-700">₹{data?.totalEarned - data?.totalAdvance}</p>
                    </div>
                </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Earnings", val: `₹${data?.totalEarned}`, icon: Calendar, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
                    { label: "Total Advance", val: `₹${data?.totalAdvance}`, icon: IndianRupee, color: "red", bg: "bg-red-50", text: "text-red-600" },
                    { label: "Status", val: data?.isActive ? "Currently Active" : "Inactive", icon: User, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center hover:border-indigo-100 transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <h3 className="text-3xl font-black mt-1 text-gray-900">{item.val}</h3>
                        </div>
                        <div className={`p-5 ${item.bg} ${item.text} rounded-3xl shadow-sm`}>
                            <item.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-7 border-b flex items-center justify-between bg-gray-50/30">
                        <h2 className="font-black text-gray-800 flex items-center gap-3">
                            <History size={22} className="text-indigo-600" /> ATTENDANCE LOG
                        </h2>
                        <span className="text-xs font-black bg-white border border-gray-100 text-indigo-600 px-4 py-1.5 rounded-full shadow-sm">
                            {data?.attendanceHistory.length} DAYS
                        </span>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto px-4 pb-4">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="text-[10px] uppercase text-gray-400 font-black border-b border-gray-50">
                                    <th className="p-5 text-left">Date</th>
                                    <th className="p-5 text-left">Status</th>
                                    <th className="p-5 text-right">Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.attendanceHistory.map((h, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/20 transition-colors">
                                        <td className="p-5 text-sm font-bold text-gray-700">{new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="p-5">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${h.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                {h.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-black text-gray-900">₹{h.earnedAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-7 border-b flex items-center justify-between bg-red-50/10">
                        <h2 className="font-black text-red-600 flex items-center gap-3">
                            <IndianRupee size={22} /> PAYMENT LOG
                        </h2>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto px-4 pb-4">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="text-[10px] uppercase text-gray-400 font-black border-b border-gray-50">
                                    <th className="p-5 text-left">Date</th>
                                    <th className="p-5 text-left">Note</th>
                                    <th className="p-5 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.paymentHistory.map((p, i) => (
                                    <tr key={i} className="hover:bg-red-50/30 transition-colors">
                                        <td className="p-5 text-sm font-bold text-gray-700">{new Date(p.date || p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                                        <td className="p-5 text-xs font-medium italic text-gray-400">{p.description || "Advance Cash"}</td>
                                        <td className="p-5 text-right font-black text-red-600">₹{p.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerView;