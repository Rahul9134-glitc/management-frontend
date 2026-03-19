import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllWorkers } from '../store/slices/WorkerReducer';
import { 
  Users, CheckCircle2, IndianRupee, 
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { workers, loading } = useSelector((state) => state.worker);

  useEffect(() => {
    dispatch(fetchAllWorkers({ role: "All", search: "" }));
  }, [dispatch]);

  // Calculations for Stats
  const totalWorkers = workers?.length || 0;
  const totalAdvance = workers?.reduce((acc, w) => acc + (w.advance || 0), 0);
  const totalEarned = workers?.reduce((acc, w) => acc + (w.totalEarned || 0), 0);
  const pendingBalance = totalEarned - totalAdvance;

  const stats = [
    {
      title: "Total Workers",
      value: totalWorkers,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      trend: "+2 this week",
      trendUp: true
    },
    {
      title: "Today Present",
      value: "Calculated...", // Iske liye attendance API se data lena hoga
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
      trend: "85% Avg",
      trendUp: true
    },
    {
      title: "Advance Given",
      value: `₹${totalAdvance.toLocaleString()}`,
      icon: <ArrowUpRight className="w-6 h-6 text-red-600" />,
      bg: "bg-red-50",
      trend: "This Month",
      trendUp: false
    },
    {
      title: "Pending Balance",
      value: `₹${pendingBalance.toLocaleString()}`,
      icon: <IndianRupee className="w-6 h-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      trend: "Total Payable",
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Swagat hai, <span className="text-indigo-600 font-black text-3xl">Admin!</span>
        </h1>
        <p className="text-gray-500 font-medium">Aaj ka kaam-kaaj aur hisab-kitab yahan dekhein.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${item.bg}`}>
                {item.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${item.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {item.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Progress Section (Lefty) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Worker Distribution
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Yahan hum manually roles ka breakdown dikha sakte hain */}
            {['Rajmistri', 'Labour'].map((role) => {
               const count = workers?.filter(w => w.role === role).length || 0;
               const percentage = totalWorkers > 0 ? (count / totalWorkers) * 100 : 0;
               return (
                 <div key={role} className="space-y-2">
                   <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-700">{role}</span>
                     <span className="text-indigo-600">{count} Workers</span>
                   </div>
                   <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${role === 'Rajmistri' ? 'bg-indigo-600' : 'bg-orange-500'} transition-all duration-1000`} 
                       style={{ width: `${percentage}%` }}
                     ></div>
                   </div>
                 </div>
               )
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;