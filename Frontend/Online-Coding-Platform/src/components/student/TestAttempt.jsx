import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaListOl, FaCheckCircle, FaCode, FaHourglassHalf } from 'react-icons/fa';
import { useMainContext } from '../../context/AuthContext';

const TestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentQuestion } = useMainContext(); 

  // If context is empty, fallback to empty array
  const problems = currentQuestion || [];

  // Assuming duration is stored in localStorage or context; fallback 90 minutes
  const durationMinutes = Number(localStorage.getItem(`test_${testId}_duration`)) || 90;

  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  // Helper to get initial statuses from localStorage
  const getInitialStatuses = (problems) => {
    const statuses = {};
    for (const problem of problems) {
      const storedStatus = localStorage.getItem(`problem_${problem.question.problemId}_status`);
      statuses[problem.question.problemId] = storedStatus || 'pending';
    }
    return statuses;
  };

  const [problemStatuses, setProblemStatuses] = useState(() => getInitialStatuses(problems));

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit logic
          navigate('/student/history');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // Listen for localStorage changes (e.g., from coding interface)
  useEffect(() => {
    const handleStorageChange = () => {
      setProblemStatuses(getInitialStatuses(problems));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [problems]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getStatusButton = (status, problemId) => {
    switch (status) {
      case 'submitted':
        return (
          <button disabled className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-md font-semibold flex items-center gap-2">
            <FaCheckCircle /> Submitted
          </button>
        );
      case 'attempted':
        return (
          <Link
            to={`/student/attempt/${testId}/problem/${problemId}`}
            className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md font-semibold flex items-center gap-2"
          >
            <FaHourglassHalf /> Re-attempt
          </Link>
        );
      default:
        return (
          <Link
            to={`/student/attempt/${testId}/problem/${problemId}`}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md font-semibold flex items-center gap-2"
          >
            <FaCode /> Solve Question
          </Link>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex-shrink-0 p-3 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Test in Progress</h1>
          <p className="text-sm text-slate-400">Attempting Test ID: {testId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-mono bg-slate-700 text-white py-1.5 px-3 rounded-lg">{formatTime(timeLeft)}</span>
          <button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm">
            Finish & Submit Test
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Problems</h2>
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div key={problem.question.problemId} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-indigo-400 font-bold text-lg">{index + 1}</span>
                <h3 className="font-semibold text-white">{problem.question.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{problem.points} points</span>
                {getStatusButton(problemStatuses[problem.question.problemId], problem.question.problemId)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TestAttempt;
