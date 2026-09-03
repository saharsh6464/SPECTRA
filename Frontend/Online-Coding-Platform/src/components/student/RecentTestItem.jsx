import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import { BsFillLightningFill } from 'react-icons/bs';

const getStatusConfig = (status) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'completed':
      return { icon: <FaCheckCircle />, color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    case 'active':
    case 'started':
      return { icon: <FaClock />, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    case 'scheduled':
    case 'pending':
      return { icon: <BsFillLightningFill />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    default:
      return { icon: <FaFileAlt />, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const RecentTestItem = ({ test }) => {
  const navigate = useNavigate();
  const config = getStatusConfig(test.status);

  const handleClick = () => {
    if (test.testId) {
      navigate(`/student/tests/${test.testId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700/60 transition-all duration-300 cursor-pointer group border border-slate-700 hover:border-indigo-500/50"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-md font-semibold text-white group-hover:text-indigo-400">{test.testName}</h3>
          <p className="text-sm text-slate-400">
            {test.companyName || 'Company Assessment'} {test.duration && `• ${test.duration}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex items-center gap-1.5 ${config.color}`}>
            {config.icon} {test.status}
          </span>
          {test.score !== undefined && test.score !== null ? (
            <p className="text-lg font-bold text-green-400">
              {test.score}
              {test.totalScore && <span className="text-sm text-slate-400">/{test.totalScore}</span>}
            </p>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentTestItem;
