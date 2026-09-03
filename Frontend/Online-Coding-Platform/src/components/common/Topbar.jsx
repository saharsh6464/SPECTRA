import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaSearch,
  FaSignOutAlt,
  FaChevronDown,
} from 'react-icons/fa';

const Topbar = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loggedUser = JSON.parse(localStorage.getItem('user')) || { username: 'Student', role: 'student' };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <header className="w-full h-16 bg-slate-900/80 backdrop-blur-sm text-white flex items-center px-6 justify-between flex-shrink-0 border-b border-slate-700/50 sticky top-0 z-50">
      {/* Left Section: Branding */}
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-indigo-400">
          EduPortal
        </div>
        <div className="hidden md:block text-sm text-slate-400 border-l border-slate-700 pl-4">
          Student Portal
        </div>
      </div>

      {/* Right Section: Time & Profile */}
      <div className="flex items-center space-x-3 md:space-x-5">
        <div className="hidden sm:flex flex-col items-end text-sm leading-tight">
          <div className="font-medium text-slate-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-slate-500">
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 ml-2 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left"
          >
            <FaUserCircle className="text-2xl text-indigo-400" />
            <div className="hidden md:block">
              <div className="text-sm font-medium text-slate-200">{loggedUser.username}</div>
              <div className="text-xs text-slate-500 capitalize">{loggedUser.role || 'Student'}</div>
            </div>
            <FaChevronDown className="text-slate-500 text-xs ml-1 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="text-sm font-semibold text-white">{loggedUser.username}</p>
                <p className="text-xs text-slate-400 capitalize">Role: {loggedUser.role || 'Student'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <FaSignOutAlt className="text-red-400" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
