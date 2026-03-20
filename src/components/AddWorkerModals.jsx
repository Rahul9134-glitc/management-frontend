import React, { useState, useEffect } from 'react';
import { X, User, Phone, Banknote, ShieldCheck, Loader2, Briefcase } from 'lucide-react';
import api from '../api/axios.js';

const AddWorkerModal = ({ closeModal, refreshData, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dailyWage: '',
    role: 'Labour',
    status: 'Active' // UI ke liye string rakha hai
  });
  const [loading, setLoading] = useState(false);

  // Jab Edit button pe click hoga, ye data load karega
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        phone: editData.phone || '',
        dailyWage: editData.dailyWage || '',
        role: editData.role || 'Labour',
        // Agar DB mein isActive true hai toh 'Active', nahi toh 'Inactive'
        status: editData.isActive !== false ? 'Active' : 'Inactive'
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend ko 'status' ke roop mein data bhej rahe hain
      // Controller isse isActive (true/false) mein convert kar lega
      if (editData) {
        const response = await api.patch(`/worker/update-worker/${editData._id}`, formData);
        if (response.data.success) {
          refreshData();
          closeModal();
        }
      } else {
        const response = await api.post("/worker/register", formData);
        if (response.data.success) {
          refreshData();
          closeModal();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Kuch gadbad ho gayi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {editData ? "Edit Worker Details" : "Naya Worker Add Karein"}
          </h2>
          <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="Ex: Rahul Vishwakarma"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
            <div className="relative">
              <Briefcase className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Labour">Labour</option>
                <option value="Rajmistri">Rajmistri</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                required
                type="tel" 
                placeholder="10 digit number"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Daily Wage */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Daily Wage (₹)</label>
            <div className="relative">
              <Banknote className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                required
                type="number" 
                placeholder="Ex: 500"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.dailyWage}
                onChange={(e) => setFormData({...formData, dailyWage: e.target.value})}
              />
            </div>
          </div>

          {/* Status Field (Naya Toggle) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Working Status</label>
            <div className="relative">
              <ShieldCheck className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${formData.status === 'Active' ? 'text-green-500' : 'text-red-500'}`} />
              <select 
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all appearance-none cursor-pointer font-bold ${
                    formData.status === 'Active' 
                    ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-200' 
                    : 'bg-red-50 border-red-200 text-red-700 focus:ring-red-200'
                }`}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">🟢 Active (Kaam par hai)</option>
                <option value="Inactive">🔴 Inactive (Ghar par hai)</option>
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                editData ? "Save Changes" : "Register Worker"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;