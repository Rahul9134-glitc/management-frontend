import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice'; // Import AsyncThunk
import { Mail, Lock, LogIn, AlertTriangle, KeyRound } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state se loading aur error nikal rahe hain
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Dispatching the thunk
    const resultAction = await dispatch(loginUser({ email, password }));

    // Agar login successful raha (fulfilled), toh dashboard pe bhej do
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="bg-indigo-100 p-4 rounded-full border-4 border-white shadow-inner">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome<span className="text-indigo-600"> back.</span>
          </h1>
          <p className="text-sm text-gray-500">Sign in to manage your workforce accounts.</p>
        </div>

        {/* ERROR MESSAGE - Redux state se aa raha hai */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Login Failed!</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
          >
            {loading ? 'Signing you in...' : <><LogIn className="w-5 h-5" /> Sign in to your account</>}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-8">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;