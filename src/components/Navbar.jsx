import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { 
  BriefcaseBusiness, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  CircleDollarSign,
  HeartHandshake,
  Store // Naya icon import kiya hai Marketing ke liye
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const resultAction = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(resultAction)) {
      navigate("/login");
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Workers', path: '/workers', icon: <Users className="w-4 h-4" /> },
    { 
      name: 'Friendship Zone', 
      path: '/friendship-zone', 
      icon: <HeartHandshake className="w-4 h-4 text-pink-500" /> 
    }, 
    { name: 'Marketing', path: '/marketing', icon: <Store className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BriefcaseBusiness className="w-6 h-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
              Manage<span className="text-indigo-600">Work.</span>
            </Link>
          </div>

          {/* CENTER: DESKTOP NAV */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path}
                  className={({isActive}) => `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* RIGHT: PROFILE / AUTH */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full pl-1.5 pr-3 py-1.5 hover:border-indigo-300 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium tracking-tight">Administrator</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <>
                    {/* Background overlay to close dropdown on outside click */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in duration-200 z-20">
                      <button className="flex items-center gap-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 p-2.5 rounded-lg transition-colors">
                        <UserIcon className="w-4 h-4" /> My Profile
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 w-full text-left text-sm text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-4 py-2">Sign In</Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100">Get Started</Link>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 shadow-2xl animate-in slide-in-from-top duration-300">
          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 mb-4 px-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.phone}</p>
                </div>
              </div>
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 mt-4 text-red-600 font-bold bg-red-50 rounded-xl"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center p-3 font-semibold text-gray-700 border border-gray-200 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center p-3 font-semibold text-white bg-indigo-600 rounded-xl">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;