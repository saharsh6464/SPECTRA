import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';

const DashboardHeader = ({ user }) => {
  const navigate = useNavigate();
  const username = user?.username || 'Student';
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <div className="bg-indigo-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mr-4 border-2 border-slate-700 shadow-md">
          {initial}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {username}</h1>
          <p className="text-slate-400">Here's your learning & assessment overview.</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/student/tests')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 flex items-center shadow-lg shadow-indigo-500/10 cursor-pointer"
      >
        <span>Explore Tests</span>
        <FaExternalLinkAlt className="ml-2 text-xs" />
      </button>
    </header>
  );
};

export default DashboardHeader;