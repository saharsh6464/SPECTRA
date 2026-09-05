import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaSearch, FaTimes, FaSave } from 'react-icons/fa';
import { getQuestions } from '../../api/question';
import { postTests } from "../../api/test";
import { getCompanies, createCompany } from "../../api/company";

const getDifficultyConfig = (difficulty) => {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy': return 'bg-green-500/10 text-green-400';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400';
    case 'hard': return 'bg-red-500/10 text-red-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
};

const inputStyle =
  "w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

const CreateTest = ({ onClose }) => {
  const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [questRes, compRes] = await Promise.all([
          getQuestions(),
          getCompanies()
        ]);

        const normalizedQuestions = (Array.isArray(questRes) ? questRes : []).map(q => ({
          problemId: q.problemId || q.problem_id,
          title: q.title,
          difficulty: q.difficulty
        }));
        setQuestions(normalizedQuestions);

        const compList = Array.isArray(compRes) ? compRes : [];
        setCompanies(compList);

        // Try to match company for logged-in user
        const matched = compList.find(c =>
          (c.user?.id && c.user.id === loggedUser.id) ||
          (c.user?.username && c.user.username === loggedUser.username)
        );

        if (matched) {
          setSelectedCompanyId(matched.id);
        } else if (compList.length > 0) {
          setSelectedCompanyId(compList[0].id);
        }
      } catch (e) {
        console.error("Error loading test creation data:", e);
      }
    };

    initData();
  }, [loggedUser.id, loggedUser.username]);

  const availableQuestions = useMemo(() => {
    return questions
      .filter(q => !selectedQuestions.some(sq => sq.problemId === q.problemId))
      .filter(q => (q.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [questions, selectedQuestions, searchTerm]);

  const handleAddQuestion = (question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const handleRemoveQuestion = (problemId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.problemId !== problemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedQuestions.length === 0) {
      setError('Please add at least one question to the test.');
      return;
    }

    setLoading(true);

    try {
      let companyId = selectedCompanyId;

      // If no company found yet, auto-create one for the logged in user
      if (!companyId) {
        const newComp = await createCompany({
          companyName: loggedUser.username || "My Company",
          description: "Company created for assessments",
          user: { id: loggedUser.id, username: loggedUser.username }
        });
        companyId = newComp.id;
      }

      const testData = {
        testName,
        description,
        durationMinutes: parseInt(duration, 10) || 60,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : new Date(Date.now() + (parseInt(duration, 10) || 60) * 60000).toISOString(),
        questionIds: selectedQuestions.map(q => q.problemId),
        mcqIds: [],
        company: { id: companyId }
      };

      console.log("Submitting Test payload:", testData);
      await postTests(testData);
      onClose();
    } catch (err) {
      console.error("Failed to create test:", err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700"
      >
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Assessment Test</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </header>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Test Details */}
          <div className="flex flex-col gap-5">
            <h3 className="text-md font-semibold text-indigo-400 border-b border-slate-700 pb-2">
              Test Configuration
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Test Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
                placeholder="e.g. Software Engineer Evaluation"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Test objectives and instructions..."
                className={inputStyle}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Duration (minutes) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className={inputStyle}
                />
              </div>

              {companies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                  <select
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompanyId(parseInt(e.target.value, 10))}
                    className={inputStyle}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Question Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="text-md font-semibold text-indigo-400 border-b border-slate-700 pb-2">
              Select Questions ({selectedQuestions.length} added)
            </h3>

            {/* Selected Questions */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedQuestions.map(q => (
                <div key={q.problemId} className="flex justify-between items-center p-2 rounded-lg bg-slate-700 border border-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400">#{q.problemId}</span>
                    <span className="text-sm font-medium text-white">{q.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.problemId)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
              {selectedQuestions.length === 0 && (
                <p className="text-xs text-slate-500 italic p-2">No questions added yet. Pick from below.</p>
              )}
            </div>

            {/* Question Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search available questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1.5 px-3 pl-8 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            </div>

            {/* Available Questions List */}
            <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-700 rounded-lg p-2 bg-slate-900/40">
              {availableQuestions.map(q => (
                <div key={q.problemId} className="flex justify-between items-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">#{q.problemId}</span>
                    <span className="text-sm text-white">{q.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getDifficultyConfig(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(q)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FaPlus className="text-[10px]" /> Add
                  </button>
                </div>
              ))}
              {availableQuestions.length === 0 && (
                <p className="text-xs text-slate-500 p-2 text-center">No available questions match search.</p>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 flex justify-end gap-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/20"
            disabled={loading}
          >
            <FaSave /> {loading ? "Creating Test..." : "Create Test"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateTest;