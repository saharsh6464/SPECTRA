import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaClock, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import CreateTest from '../company/CreateTest';
import { getTests } from '../../api/test';

const getStatusAndDuration = (startTime, endTime, durationMinutes) => {
  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  const durationText = durationMinutes ? `${durationMinutes} mins` : 'N/A';

  if (!start && !end) {
    return { status: 'Draft', duration: durationText };
  }

  if (start && now < start) {
    return { status: 'Scheduled', duration: durationText };
  }

  if (start && (!end || (now >= start && now <= end))) {
    return { status: 'Active', duration: durationText };
  }

  if (end && now > end) {
    return { status: 'Completed', duration: durationText };
  }

  return { status: 'Scheduled', duration: durationText };
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'Active':
      return { icon: <FaClock />, color: 'bg-green-500/10 text-green-400 border border-green-500/20' };
    case 'Scheduled':
      return { icon: <FaCalendarAlt />, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    case 'Completed':
      return { icon: <FaCheckCircle />, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    default:
      return { icon: <FaClock />, color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
  }
};

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await getTests();
      const formattedData = (Array.isArray(data) ? data : []).map((test) => {
        const { status, duration } = getStatusAndDuration(
          test.startTime,
          test.endTime,
          test.durationMinutes
        );
        return {
          testId: test.testId,
          testName: test.testName || 'Untitled Test',
          description: test.description || '',
          companyName: test.company?.companyName || 'N/A',
          durationMinutes: duration,
          questionCount: test.questionIds?.length || 0,
          status,
          createdAt: test.createdAt,
          startTime: test.startTime,
          endTime: test.endTime,
        };
      });
      setTests(formattedData);
    } catch (e) {
      console.error("Error fetching tests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const filteredTests = useMemo(() => {
    return tests
      .filter(t => t.testName.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => statusFilter === 'all' || t.status === statusFilter);
  }, [tests, searchTerm, statusFilter]);

  return (
    <>
      <div>
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Test Management</h1>
            <p className="text-slate-400">Create, monitor, and manage company assessments.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 flex items-center shadow-lg mt-4 md:mt-0 cursor-pointer"
          >
            <FaPlus className="mr-2 text-xs" />
            <span>Create New Test</span>
          </button>
        </header>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search tests by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Tests List */}
        <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading tests...</div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {/* Table Header */}
              <div className="p-4 hidden md:grid grid-cols-5 gap-4 font-semibold text-slate-400 text-sm bg-slate-800/80">
                <h3 className="col-span-2">Test Name</h3>
                <h3>Status</h3>
                <h3>Duration</h3>
                <h3>Questions</h3>
              </div>

              {filteredTests.map(test => {
                const statusConfig = getStatusConfig(test.status);
                return (
                  <div
                    key={test.testId}
                    className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center hover:bg-slate-800 transition-colors duration-200"
                  >
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400">#{test.testId}</span>
                        <h3 className="font-semibold text-white">{test.testName}</h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        {test.companyName} {test.createdAt && `• Created: ${new Date(test.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex items-center gap-1.5 w-fit ${statusConfig.color}`}>
                        {statusConfig.icon} {test.status}
                      </span>
                    </div>

                    <div className="text-slate-300 text-sm">{test.durationMinutes}</div>

                    <div className="text-slate-300 text-sm">
                      {test.questionCount} {test.questionCount === 1 ? 'problem' : 'problems'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredTests.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No tests found.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateTest
          onClose={() => {
            setIsModalOpen(false);
            fetchTests();
          }}
        />
      )}
    </>
  );
};

export default TestManagement;