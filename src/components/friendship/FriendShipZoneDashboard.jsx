import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, Wallet, ArrowUpRight, UserMinus, 
  CheckCircle2, Plus, Clock, UserCheck, 
  HandCoins, AlertCircle, Check, Loader2,
  TrendingUp, TrendingDown, Power, Download 
} from 'lucide-react';
import { fetchExpensesAction, approveExpenseAction } from '../../store/slices/expenceSlice'; 
import AddExpenseModal from './AddExpenceModal';
import { 
  requestInactiveAction, 
  approveInactiveAction,
  getGroupDetailsAction 
} from '../../store/slices/groupSlices'; 

import { socket } from '../../utils/socket';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable'; 

const FriendDashboard = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux States
  const { currentGroup, loading: groupLoading } = useSelector((state) => state.group);
  const { user } = useSelector((state) => state.auth);
  const { expenses = [], loading: expenseLoading } = useSelector((state) => state.expense || {});

  // 1. Initial Data Fetch & Socket Connection
  useEffect(() => {
    if (currentGroup?._id) {
      dispatch(fetchExpensesAction(currentGroup._id));
      
      socket.connect();
      socket.emit("joinGroup", currentGroup._id);

      socket.on("newExpense", () => {
        dispatch(fetchExpensesAction(currentGroup._id));
      });

      socket.on("expenseApproved", () => {
        dispatch(fetchExpensesAction(currentGroup._id));
      });

      socket.on("groupUpdate", () => {
        if (typeof getGroupDetailsAction === 'function') {
           dispatch(getGroupDetailsAction()); 
        }
        dispatch(fetchExpensesAction(currentGroup._id));
      });

      return () => {
        socket.off("newExpense");
        socket.off("expenseApproved");
        socket.off("groupUpdate");
      };
    }
  }, [currentGroup?._id, dispatch]);

  // --- SETTLEMENT LOGIC ---
  const settlementData = useMemo(() => {
    if (!expenses.length || !currentGroup) return { totals: { total: 0, myShare: 0, balance: 0 }, list: [] };

    const approvedExpenses = expenses.filter(exp => exp.status === 'approved');
    const totalGroupExpense = approvedExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    const balances = {};
    currentGroup.members.forEach(m => {
      balances[m.user._id] = 0;
    });

    approvedExpenses.forEach(exp => {
      const paidBy = exp.addedBy?._id;
      const amount = exp.amount || 0;
      const splitAmong = exp.splitAmong || [];
      const share = amount / (splitAmong.length || 1);

      if (balances[paidBy] !== undefined) balances[paidBy] += amount;

      splitAmong.forEach(userId => {
        if (balances[userId] !== undefined) balances[userId] -= share;
      });
    });

    const myBalance = balances[user?._id] || 0;
    
    const list = Object.keys(balances).map(userId => ({
      userId,
      name: currentGroup.members.find(m => m.user._id === userId)?.user?.name || "Partner",
      balance: parseFloat(balances[userId].toFixed(2))
    }));

    let myTotalShare = 0;
    approvedExpenses.forEach(exp => {
      if (exp.splitAmong?.includes(user?._id)) {
        myTotalShare += (exp.amount / (exp.splitAmong.length || 1));
      }
    });

    return {
      totals: { total: totalGroupExpense, myShare: myTotalShare, balance: myBalance },
      list
    };
  }, [expenses, currentGroup, user]);

  // --- PDF GENERATION LOGIC (ONLY APPROVED & CURRENT STATUS) ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Sirf approved expenses filter karo taaki report clean rahe
    const approvedOnly = expenses.filter(exp => exp.status === 'approved');
    const today = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); 
    doc.text(`${currentGroup?.groupName || 'Expense Report'}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Current Status Report: ${today}`, 14, 28);
    doc.text(`Group ID: ${currentGroup?.groupUniqueId}`, 14, 33);

    // Table 1: Final Settlement (Kisko kitna dena hai)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Current Net Balances", 14, 45);
    
    const settlementRows = settlementData.list.map(item => [
      item.name,
      item.balance >= 0 ? `+ Rs. ${item.balance}` : `- Rs. ${Math.abs(item.balance)}`
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Partner Name', 'Balance Status']],
      body: settlementRows,
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Table 2: Approved History
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Approved Expense Logs", 14, finalY);

    const expenseRows = approvedOnly.map(exp => [
      exp.itemName,
      `Rs. ${exp.amount}`,
      exp.addedBy?.name || 'User',
      new Date(exp.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [['Expense Item', 'Amount', 'Paid By', 'Date']],
      body: expenseRows,
      headStyles: { fillColor: [31, 41, 55] },
    });

    doc.save(`${currentGroup?.groupName}_Summary_${today}.pdf`);
  };

  if (groupLoading && !currentGroup) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const stats = [
    { label: 'Total Group Expense', value: `₹${settlementData.totals.total.toLocaleString()}`, icon: <Wallet className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Your Share', value: `₹${Math.round(settlementData.totals.myShare).toLocaleString()}`, icon: <ArrowUpRight className="text-blue-600" />, bg: 'bg-blue-50' },
    { 
      label: settlementData.totals.balance >= 0 ? 'You Get Back' : 'You Owe', 
      value: `₹${Math.abs(settlementData.totals.balance).toFixed(2)}`,
      icon: <HandCoins className={settlementData.totals.balance >= 0 ? "text-emerald-600" : "text-red-600"} />, 
      bg: settlementData.totals.balance >= 0 ? 'bg-emerald-50' : 'bg-red-50' 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{currentGroup?.groupName || 'My Group'}</h1>
          <p className="text-gray-500 font-medium">
            Group ID: <span className="text-indigo-600 font-bold">{currentGroup?.groupUniqueId}</span>
          </p>
        </div>
        
        {/* Buttons Group */}
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadPDF}
            className="p-4 bg-white text-gray-700 border border-gray-200 rounded-3xl hover:bg-gray-50 transition-all shadow-sm active:scale-90"
            title="Download PDF Summary"
          >
            <Download size={24} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            New Expense
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 ${stat.bg} rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Partners & Settlement List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={24} />
              Partners
            </h3>
            <div className="space-y-4">
              {currentGroup?.members?.map((m, index) => {
                const isMe = m.user._id === user._id;
                const needsMyApproval = !isMe && m.isRequestingInactive && !m.inactiveApprovals?.includes(user._id);
                const totalRequired = currentGroup.members.length - 1;
                const currentApprovals = m.inactiveApprovals?.length || 0;

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 uppercase text-sm">
                          {m?.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-none mb-1">{m?.user?.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                              {m.status}
                            </span>
                            {m.isRequestingInactive && (
                              <span className="text-[9px] font-black text-orange-500 animate-pulse uppercase">Requesting Off</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isMe && (
                        <button 
                          onClick={() => dispatch(requestInactiveAction())}
                          className={`p-2 rounded-xl transition-all active:scale-90 shadow-sm border ${m.isRequestingInactive ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-400 border-gray-100'}`}
                          title={m.status === 'active' ? "Request Inactive" : "Go Active"}
                        >
                          <Power size={18} strokeWidth={3} />
                        </button>
                      )}

                      {needsMyApproval && (
                        <button 
                          onClick={() => dispatch(approveInactiveAction(m.user._id))}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all active:scale-95"
                        >
                          APPROVE
                        </button>
                      )}
                    </div>

                    {m.isRequestingInactive && (
                      <div className="space-y-1 mt-2 px-1">
                        <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                          <span>Approval Progress</span>
                          <span>{currentApprovals}/{totalRequired}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full transition-all duration-500" 
                            style={{ width: `${(currentApprovals / totalRequired) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <HandCoins className="text-indigo-600" size={24} />
              Final Settlement
            </h3>
            <div className="space-y-3">
              {settlementData.list.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.balance >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {item.balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                  </div>
                  <p className={`font-black ${item.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.balance >= 0 ? `+₹${item.balance}` : `-₹${Math.abs(item.balance)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Pending & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="text-orange-500" size={24} />
              Pending Approvals
            </h3>
            <div className="space-y-4">
              {expenses.filter(exp => exp.status === 'pending' && !exp.approvals?.some(a => (a._id || a) === user?._id)).length > 0 ? (
                expenses
                  .filter(exp => exp.status === 'pending' && !exp.approvals?.some(a => (a._id || a) === user?._id))
                  .map((exp) => (
                    <div key={exp._id} className="flex items-center justify-between p-5 bg-orange-50/50 rounded-3xl border border-orange-100">
                      <div>
                        <p className="font-black text-gray-900">{exp.itemName}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">
                          By {exp.addedBy?.name} • ₹{exp.amount}
                        </p>
                      </div>
                      <button 
                        onClick={() => dispatch(approveExpenseAction(exp._id))}
                        className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 font-bold">All caught up! No pending approvals.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Recent Expenses</h3>
            <div className="space-y-4">
              {expenses.slice(0, 8).map((exp) => (
                <div key={exp._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${exp.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                      {exp.status === 'approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-0.5">{exp.itemName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {exp.addedBy?.name} • {new Date(exp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-lg">₹{exp.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FriendDashboard;