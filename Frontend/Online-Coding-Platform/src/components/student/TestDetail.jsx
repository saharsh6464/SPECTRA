import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaClock, FaListOl, FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import { getTestsByid } from '../../api/test';
import { getQuestions } from '../../api/question';
import { useMainContext } from '../../context/AuthContext';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { testDetail, setTestDetails, setcurrentQuestion } = useMainContext();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [testRes, allQuestions] = await Promise.all([
          getTestsByid(testId),
          getQuestions(),
        ]);

        setTestDetails(testRes);

        // Resolve question objects from questionIds in Test entity
        const qIds = testRes.questionIds || [];
        const questionMap = new Map((allQuestions || []).map(q => [q.problemId, q]));

        const matchedQuestions = qIds
          .map((id, index) => {
            const found = questionMap.get(id);
            if (found) {
              return {
                question: found,
                points: 10,
                orderId: index + 1,
              };
            }
            return {
              question: { problemId: id, title: `Problem #${id}`, difficulty: 'Medium' },
              points: 10,
              orderId: index + 1,
            };
          });

        setQuestions(matchedQuestions);
      } catch (err) {
        console.error("Error fetching test details:", err);
        setError("Could not load test details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [testId, setTestDetails]);

  const handleStartTest = () => {
    // Clear previous problem statuses for fresh attempt
    questions.forEach(p => {
      localStorage.removeItem(`problem_${p.question.problemId}_status`);
    });

    if (testDetail.durationMinutes) {
      localStorage.setItem(`test_${testDetail.testId}_duration`, testDetail.durationMinutes);
    }

    setcurrentQuestion(questions);
    navigate(`/student/attempt/${testDetail.testId}`);
  };

  if (loading) {
    return <div className="text-slate-400 p-8">Loading assessment details...</div>;
  }

  if (error || !testDetail?.testId) {
    return (
      <div className="p-8">
        <Link to="/student/tests" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4">
          <FaArrowLeft /> Back to Tests
        </Link>
        <p className="text-red-400 font-semibold">{error || "Test not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/student/tests"
        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-6 cursor-pointer"
      >
        <FaArrowLeft /> Back to Tests
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono text-indigo-400">Test #{testDetail.testId}</span>
        </div>
        <h1 className="text-4xl font-bold text-white">{testDetail.testName}</h1>
        <p className="text-slate-400 text-lg mt-1">
          Presented by {testDetail.company?.companyName || 'Host Company'}
        </p>
        {testDetail.description && (
          <p className="text-slate-300 mt-3 max-w-2xl bg-slate-800/40 p-4 rounded-lg border border-slate-700/60">
            {testDetail.description}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
          <FaClock className="text-3xl text-indigo-400" />
          <div>
            <p className="text-slate-400 text-sm">Duration</p>
            <p className="font-bold text-white text-xl">{testDetail.durationMinutes || 60} minutes</p>
          </div>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
          <FaListOl className="text-3xl text-indigo-400" />
          <div>
            <p className="text-slate-400 text-sm">Total Coding Questions</p>
            <p className="font-bold text-white text-xl">{questions.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-3">Assessment Guidelines</h2>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
            <span>Ensure you have a stable network connection before starting.</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
            <span>The assessment timer starts immediately when you click <strong>Start Test</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
            <span>Security integrity checks are enforced during test execution.</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
            <span>You can submit your code per problem and finalize your test once all questions are attempted.</span>
          </li>
        </ul>
      </div>

      <div className="max-w-2xl">
        <button
          onClick={handleStartTest}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl text-lg flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-green-600/20 transition-colors"
        >
          <FaPlayCircle /> Start Test Session
        </button>
      </div>
    </div>
  );
};

export default TestDetail;
