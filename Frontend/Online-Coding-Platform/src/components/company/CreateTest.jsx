import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { getQuestions } from '../../api/question';
import { postTests } from "../../api/test";

const getDifficultyConfig = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/10 text-green-400';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400';
    case 'hard': return 'bg-red-500/10 text-red-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
};

const inputStyle =
  "w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

const CreateTest = ({ onClose }) => {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getQuest = async () => {
      try {
        const response = await getQuestions();
        const normalized = response.map(q => ({
          problem_id: q.problemId,
          title: q.title,
          difficulty: q.difficulty
        }));
        setQuestions(normalized);
      } catch (e) {
        console.log("Error in fetching Questions ", e);
      }
    };
    getQuest();
  }, []);

  const availableQuestions = useMemo(() => {
    return questions
      .filter(q => !selectedQuestions.some(sq => sq.problem_id === q.problem_id))
      .filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [questions, selectedQuestions, searchTerm]);

  const handleAddQuestion = (question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const handleRemoveQuestion = (problem_id) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.problem_id !== problem_id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Maps to your Java Test Entity
    const testData = {
      testName,
      description,
      durationMinutes: parseInt(duration, 10), 
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      questionIds: selectedQuestions.map(q => q.problem_id), // Array of Integers
      mcqIds: [] // Array of Integers mapped to entity
    };
    
    postTests(testData);
    console.log("Creating Test:", testData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <header className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Test</h2>
        </header>

        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Test Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Test Name</label>
              <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} required className={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyle}></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required className={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={inputStyle} />
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Selected Questions ({selectedQuestions.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {selectedQuestions.map(q => (
                  <div key={q.problem_id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{q.title}</p>
                      <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${getDifficultyConfig(q.difficulty)}`}>{q.difficulty}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveQuestion(q.problem_id)} className="text-red-400 hover:text-red-300">
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {selectedQuestions.length === 0 && (
                  <p className="text-slate-400 text-sm text-center p-4">No questions added yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-4">Question Bank</h3>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search question bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
              {availableQuestions.map(q => (
                <div key={q.problem_id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{q.title}</p>
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${getDifficultyConfig(q.difficulty)}`}>{q.difficulty}</span>
                  </div>
                  <button type="button" onClick={() => handleAddQuestion(q)} className="text-indigo-400 hover:text-indigo-300"><FaPlus /></button>
                </div>
              ))}
              {availableQuestions.length === 0 && (
                <p className="text-slate-400 text-sm text-center p-4">No matching questions found.</p>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 flex justify-end gap-3 border-t border-slate-700">
          <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">Save Test</button>
        </footer>
      </form>
    </div>
  );
};

export default CreateTest;