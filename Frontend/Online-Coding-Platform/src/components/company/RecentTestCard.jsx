import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentTestCard = ({ test }) => {
  const navigate = useNavigate();
  const statusColor = {
    Active: 'bg-green-500/10 text-green-400 border border-green-500/20',
    Scheduled: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Completed: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  };

  return (
    <div
      onClick={() => navigate('/company/tests')}
      className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700/60 transition-all duration-300 cursor-pointer group border border-slate-700 hover:border-indigo-500/50"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-semibold text-white group-hover:text-indigo-400">{test.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{test.candidates} {test.candidates === 1 ? 'Attempt' : 'Attempts'}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[test.status] || statusColor.Scheduled}`}>
          {test.status}
        </span>
      </div>
    </div>
  );
};

export default RecentTestCard;