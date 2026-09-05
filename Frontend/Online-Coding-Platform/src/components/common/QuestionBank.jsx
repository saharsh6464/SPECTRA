import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaCode, FaClock, FaMemory } from 'react-icons/fa';
import AddQuestion from '../company/AddQuestion';
import { getQuestions } from '../../api/question';

const getDifficultyConfig = (difficulty) => {
  const diff = (difficulty || '').toLowerCase();
  switch (diff) {
    case 'easy':
      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isCompanyView = location.pathname.startsWith('/company');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => (q.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(q => difficultyFilter === 'all' || (q.difficulty || '').toLowerCase() === difficultyFilter.toLowerCase());
  }, [questions, searchTerm, difficultyFilter]);

  return (
    <>
      <div>
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Question Bank</h1>
            <p className="text-slate-400">
              {isCompanyView
                ? "Manage your company's coding assessment questions."
                : "Explore and practice coding challenges."}
            </p>
          </div>
          {isCompanyView && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 flex items-center shadow-lg mt-4 md:mt-0 cursor-pointer"
            >
              <FaPlus className="mr-2 text-xs" />
              <span>Add New Question</span>
            </button>
          )}
        </header>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search questions by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading questions...</div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filteredQuestions.map(question => {
                const pId = question.problemId || question.problem_id;
                return (
                  <div
                    key={pId}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-800/60 transition-colors duration-200 gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-indigo-400">#{pId}</span>
                        <h3 className="font-semibold text-white text-lg">{question.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 max-w-xl">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        {question.timeComplexity && (
                          <span className="flex items-center gap-1">
                            <FaClock className="text-slate-500" /> Time: {question.timeComplexity}
                          </span>
                        )}
                        {question.spaceComplexity && (
                          <span className="flex items-center gap-1">
                            <FaMemory className="text-slate-500" /> Space: {question.spaceComplexity}
                          </span>
                        )}
                        {(question.createdAt || question.created_at) && (
                          <span>
                            Created: {new Date(question.createdAt || question.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getDifficultyConfig(question.difficulty)}`}>
                        {question.difficulty || 'Easy'}
                      </span>
                      <button
                        onClick={() => navigate(`/student/practise/${pId}`)}
                        className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaCode className="text-xs" />
                        <span>Solve</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredQuestions.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No questions found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {isModalOpen && (
        <AddQuestion
          onClose={() => {
            setIsModalOpen(false);
            fetchQuestions();
          }}
        />
      )}
    </>
  );
};

export default QuestionBank;
