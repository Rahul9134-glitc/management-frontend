import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice'; 
import { User, Mail, Lock, Phone, UserPlus, AlertTriangle, BriefcaseBusiness } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async(e) => {
    e.preventDefault();
    
    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="bg-indigo-100 p-4 rounded-full border-4 border-white shadow-inner">
            <BriefcaseBusiness className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create an<span className="text-indigo-600"> account.</span>
          </h1>
          <p className="text-sm text-gray-500">Sign up to manage your workers and money flow.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Registration Failed!</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Rahul Vishwakarma" required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="rahul@example.com" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
          >
            {loading ? 'Creating account...' : <><UserPlus className="w-5 h-5" /> Get started free</>}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;