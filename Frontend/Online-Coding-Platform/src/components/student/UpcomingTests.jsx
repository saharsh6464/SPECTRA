import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPlayCircle, FaLock, FaClock } from 'react-icons/fa';
import { getTests } from '../../api/test';

const UpcomingTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await getTests();
        setTests(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching upcoming tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Update current time every second for accurate countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedTests = useMemo(() => {
    return [...tests].sort((a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0));
  }, [tests]);

  if (loading) {
    return <p className="text-slate-400 p-6">Loading upcoming assessments...</p>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upcoming Tests</h1>
        <p className="text-slate-400">Your scheduled assessments. When active, you can launch the test session.</p>
      </header>

      <div className="space-y-4">
        {sortedTests.map(test => {
          const startTime = test.startTime ? new Date(test.startTime) : new Date();
          const endTime = test.endTime ? new Date(test.endTime) : null;
          const isStarted = currentTime >= startTime;
          const isExpired = endTime && currentTime > endTime;
          const isTestActive = isStarted && !isExpired;

          return (
            <div
              key={test.testId}
              className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-600 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-400">#{test.testId}</span>
                  <h3 className="font-semibold text-white text-lg">{test.testName}</h3>
                </div>
                <p className="text-sm text-slate-400">
                  {test.company?.companyName || "Host Company"} • {test.durationMinutes ? `${test.durationMinutes} mins` : '60 mins'} • {test.questionIds?.length || 0} questions
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-500" />
                  <span>
                    {isExpired
                      ? `Ended: ${endTime.toLocaleString()}`
                      : `Starts: ${startTime.toLocaleString()}`}
                  </span>
                </div>

                {isTestActive ? (
                  <Link
                    to={`/student/tests/${test.testId}`}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <FaPlayCircle /> Attempt Test
                  </Link>
                ) : isExpired ? (
                  <button
                    disabled
                    className="w-full sm:w-auto bg-slate-700 text-slate-400 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaClock /> Test Closed
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto bg-slate-700 text-slate-400 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaLock /> Scheduled
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {sortedTests.length === 0 && (
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
            No upcoming tests scheduled at this time.
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTests;
