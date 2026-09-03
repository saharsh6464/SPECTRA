import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaBuilding } from 'react-icons/fa';
import { getTestAttemptById } from '../../api/testAttempt';

const StudentResultDetail = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const data = await getTestAttemptById(attemptId);
        setAttempt(data);
      } catch (err) {
        console.error("Error fetching attempt details:", err);
        setError("Could not load result details for this attempt.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return <div className="text-slate-400 p-8">Loading assessment result...</div>;
  }

  if (error || !attempt) {
    return (
      <div className="p-8">
        <Link to="/student/history" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-4">
          <FaArrowLeft /> Back to Test History
        </Link>
        <p className="text-red-400">{error || "Attempt not found."}</p>
      </div>
    );
  }

  const score = attempt.totalScore ?? 0;
  const isPassed = score >= 50;
  const risk = attempt.totalRisk ?? 0;

  return (
    <div className="max-w-4xl">
      <Link
        to="/student/history"
        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-6 cursor-pointer"
      >
        <FaArrowLeft /> Back to Test History
      </Link>

      <header
        className="mb-8 p-6 rounded-2xl border backdrop-blur-sm"
        style={{
          borderColor: isPassed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
          background: isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                color: isPassed ? '#34D399' : '#F87171',
                backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              }}
            >
              {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
              {isPassed ? 'Assessment Passed' : 'Assessment Not Cleared'}
            </span>

            <h1 className="text-3xl font-bold text-white">
              {attempt.test?.testName || `Assessment #${attempt.test?.testId || attempt.id}`}
            </h1>

            <p className="text-slate-400 flex items-center gap-2 text-sm">
              <FaBuilding className="text-slate-500" />
              {attempt.test?.company?.companyName || 'Host Company'} • Candidate: {attempt.user?.username || 'Student'}
            </p>
          </div>

          <div className="text-left md:text-right bg-slate-800/80 p-5 rounded-xl border border-slate-700 min-w-44">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Final Score</p>
            <p className="text-4xl font-black text-white mt-1">
              <span className="text-indigo-400 font-mono">{score}</span>
              <span className="text-slate-500 text-lg font-normal"> pts</span>
            </p>
          </div>
        </div>
      </header>

      {/* Assessment Breakdown Card */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h2 className="text-xl font-semibold text-white">Performance & Integrity Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Total Score</p>
            <p className="text-xl font-bold text-white mt-1">{score} Points</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Integrity Risk Score</p>
            <p className={`text-xl font-bold mt-1 flex items-center gap-2 ${risk > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              <FaShieldAlt className="text-sm" /> {risk}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Result Status</p>
            <p className={`text-xl font-bold mt-1 ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
              {isPassed ? 'Cleared' : 'Needs Improvement'}
            </p>
          </div>
        </div>

        {attempt.test?.description && (
          <div className="pt-2 text-sm text-slate-300">
            <p className="text-slate-400 text-xs font-medium uppercase mb-1">Assessment Notes</p>
            <p className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
              {attempt.test.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultDetail;
