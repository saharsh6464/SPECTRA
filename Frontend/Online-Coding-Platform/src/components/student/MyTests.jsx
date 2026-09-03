import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock, FaCheckCircle, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { getTests } from '../../api/test';

const getStatusConfig = (startTime, endTime) => {
  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  if (start && now < start) {
    return { status: 'Scheduled', icon: <FaCalendarAlt />, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
  }
  if (start && (!end || (now >= start && now <= end))) {
    return { status: 'Active', icon: <FaClock />, color: 'bg-green-500/10 text-green-400 border border-green-500/20' };
  }
  if (end && now > end) {
    return { status: 'Completed', icon: <FaCheckCircle />, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
  }
  return { status: 'Active', icon: <FaClock />, color: 'bg-green-500/10 text-green-400 border border-green-500/20' };
};

const MyTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const data = await getTests();
        setTests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      const testName = t.testName || '';
      const companyName = t.company?.companyName || '';
      return (
        testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [tests, searchTerm]);

  return (
    <div>
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">All Assessments</h1>
          <p className="text-slate-400">Review all tests available from companies.</p>
        </div>
      </header>

      <div className="mb-6">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by test or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading tests...</div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredTests.map(test => {
              const statusConfig = getStatusConfig(test.startTime, test.endTime);
              const duration = test.durationMinutes ? `${test.durationMinutes} mins` : 'N/A';
              const problemCount = test.questionIds?.length || 0;

              return (
                <Link
                  to={`/student/tests/${test.testId}`}
                  key={test.testId}
                  className="p-5 block hover:bg-slate-800 transition-colors duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400">#{test.testId}</span>
                        <h3 className="font-semibold text-white text-lg group-hover:text-indigo-400 transition-colors">
                          {test.testName}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        {test.company?.companyName || 'Host Company'} • Duration: {duration} • {problemCount} {problemCount === 1 ? 'problem' : 'problems'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex items-center gap-2 ${statusConfig.color}`}>
                        {statusConfig.icon} {statusConfig.status}
                      </span>
                      <FaEye className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredTests.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No tests found matching the search.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTests;
