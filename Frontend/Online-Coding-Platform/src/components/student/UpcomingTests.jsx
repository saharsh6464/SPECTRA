import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPlayCircle, FaLock } from 'react-icons/fa';
import { getTests } from '../../api/test'; // API call function
import { getTestsByid } from '../../api/test';
const UpcomingTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch tests from backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await getTests();
        setTests(response); // assuming API returns an array of tests

         const response1 = await getTestsByid(9);
             console.log("testData",response);
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);


  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedTests = useMemo(() => {
    return [...tests].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [tests]);

  if (loading) {
    return <p className="text-slate-400">Loading upcoming tests...</p>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upcoming Tests</h1>
        <p className="text-slate-400">Your scheduled assessments. Good luck!</p>
      </header>

      <div className="space-y-4">
        {sortedTests.map(test => {
          const startTime = new Date(test.startTime);
          const isTestActive = currentTime >= startTime;

          const ActionButton = () => (
            <button
              disabled={!isTestActive}
              className={`w-full text-center px-4 py-2 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                isTestActive
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isTestActive ? (
                <>
                  <FaPlayCircle /> Attempt Test
                </>
              ) : (
                <>
                  <FaLock /> Scheduled
                </>
              )}
            </button>
          );

          return (
            <div
              key={test.testId}
              className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div>
                <h3 className="font-semibold text-white">{test.testName}</h3>
                <p className="text-sm text-slate-400">{test.company?.companyName || "Unknown Company"}</p>
              </div>
              <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>Starts: {startTime.toLocaleString()}</span>
                </div>
                {isTestActive ? (
                  <Link to={`/student/tests/${test.testId}`} className="w-full sm:w-auto">
                    <ActionButton />
                  </Link>
                ) : (
                  <div className="w-full sm:w-auto">
                    <ActionButton />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingTests;
