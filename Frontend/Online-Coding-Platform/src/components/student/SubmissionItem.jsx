import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaCode } from 'react-icons/fa';

const SubmissionItem = ({ submission }) => {
  const isPassed = Boolean(submission.status);
  const language = submission.language || 'Code';
  const score = submission.score ?? 0;
  const time = submission.totalTime
    ? new Date(submission.totalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recent';

  return (
    <div className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700/60 transition-all duration-300 group border border-slate-700 hover:border-indigo-500/50">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-indigo-400">#{submission.submissionId || 'Sub'}</span>
          <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400">
            {submission.problemTitle || `Problem Submission`}
          </h3>
        </div>
        <span className="text-xs font-medium text-white px-2 py-0.5 rounded-full bg-slate-600 capitalize">
          {language}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1.5 ${
            isPassed
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
          {isPassed ? 'Passed' : 'Failed'}
        </span>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Score: <strong className="text-white">{score}</strong></span>
          <span>• {time}</span>
        </div>
      </div>
    </div>
  );
};

export default SubmissionItem;