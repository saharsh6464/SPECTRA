import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaClock, FaListOl, FaArrowLeft, FaPlayCircle } from 'react-icons/fa';
import { getTestsByid } from '../../api/test';
import { useMainContext } from '../../context/AuthContext';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const { testDetail, setTestDetails, setcurrentQuestion } = useMainContext();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await getTestsByid(testId);
        console.log("Fetched Test:", response);
        setTestDetails(response); // update context state
      } catch (error) {
        console.error("Error fetching test:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId, setTestDetails]);

  if (loading) return <p className="text-white">Loading test details...</p>;
  if (!testDetail.testId) return <p className="text-red-500">No test found</p>;

  const handleStartTest = () => {
    // Clear previous statuses for this test's problems
    if (testDetail.testProblems) {
      testDetail.testProblems.forEach(p =>
        localStorage.removeItem(`problem_${p.question.problemId}_status`)
      );
      // Set current question list in context
      setcurrentQuestion(testDetail.testProblems);
    }
    navigate(`/student/attempt/${testDetail.testId}`);
  };

  return (
    <div>
      <Link
        to="/student/upcoming"
        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-6"
      >
        <FaArrowLeft /> Back to Upcoming Tests
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">{testDetail.testName}</h1>
        <p className="text-slate-400 text-lg">
          By {testDetail.company?.companyName}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
          <FaClock className="text-2xl text-indigo-400" />
          <div>
            <p className="text-slate-400 text-sm">Duration</p>
            <p className="font-bold text-white">{testDetail.durationMinutes} minutes</p>
          </div>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex items-center gap-4">
          <FaListOl className="text-2xl text-indigo-400" />
          <div>
            <p className="text-slate-400 text-sm">Total Problems</p>
            <p className="font-bold text-white">{testDetail.testProblems?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">Instructions</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Read all questions carefully before attempting.</li>
          <li>You cannot pause the test once started.</li>
          <li>Each question may have different marks assigned.</li>
          <li>Do not refresh or close the window during the test.</li>
          <li>Submit your answers before the timer ends.</li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={handleStartTest}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-3 mx-auto"
        >
          <FaPlayCircle /> Start Test
        </button>
      </div>
    </div>
  );
};

export default TestDetail;
