import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaClock, FaListOl, FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { getTestsByid } from '../../api/test';
import { getQuestions } from '../../api/question';
import { getTestAttempts } from '../../api/testAttempt';
import { getPhoneStatus } from '../../api/proctoringApi';
import { useMainContext } from '../../context/AuthContext';
import SECURITY_CONFIG from '../../config/securityConfig';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { testDetail, setTestDetails, setcurrentQuestion } = useMainContext();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [startingTest, setStartingTest] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [phoneSeen, setPhoneSeen] = useState(false);
  const [userId, setUserId] = useState(null);
  const mobileProctorUrl = `https://nlgl6544-5173.inc1.devtunnels.ms/mobile-proctor?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(userId || '')}`;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [testRes, allQuestions, attemptData] = await Promise.all([
          getTestsByid(testId),
          getQuestions(),
          getTestAttempts(),
        ]);

        const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUserId(loggedUser?.id ? String(loggedUser.id) : null);
        const attempt = (Array.isArray(attemptData) ? attemptData : []).find((item) =>
          String(item.test?.testId ?? item.testId) === String(testId) &&
          (String(item.user?.id ?? item.userId) === String(loggedUser?.id) || item.user?.username === loggedUser?.username)
        );
        setExistingAttempt(attempt || null);

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

  useEffect(() => {
    if (!SECURITY_CONFIG.ENABLE_PROCTORING || !testId || !userId) return undefined;
    let disposed = false;

    const checkPhone = async () => {
      try {
        const latest = await getPhoneStatus(testId, userId);
        const timestamp = latest?.created_at ? new Date(latest.created_at).getTime() : 0;
        if (!disposed) {
          setPhoneConnected(Boolean(timestamp && Date.now() - timestamp <= 12000));
          if (timestamp) setPhoneSeen(true);
        }
      } catch (phoneError) {
        console.warn('Could not check phone proctor status:', phoneError.message);
      }
    };

    void checkPhone();
    const phoneTimer = window.setInterval(checkPhone, 5000);
    return () => {
      disposed = true;
      window.clearInterval(phoneTimer);
    };
  }, [testId, userId]);

  const handleStartTest = async () => {
    if (existingAttempt || startingTest || (SECURITY_CONFIG.ENABLE_PROCTORING && !phoneConnected)) return;

    setStartingTest(true);
    setPermissionError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      const requiredDevices = SECURITY_CONFIG.ENABLE_PROCTORING ? 'camera and microphone' : 'microphone';
      setPermissionError(`This browser does not support ${requiredDevices} access required for the test.`);
      setStartingTest(false);
      return;
    }

    const requiredDevices = SECURITY_CONFIG.ENABLE_PROCTORING ? 'camera and microphone' : 'microphone';
    let mediaStream;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        ...(SECURITY_CONFIG.ENABLE_PROCTORING ? { video: true } : {}),
      });
    } catch (reason) {
      const detail = reason?.name === 'NotAllowedError' || reason?.name === 'PermissionDeniedError'
        ? 'Allow access in your browser settings and try again.'
        : reason?.message || 'Check that the devices are connected and available.';
      setPermissionError(`${requiredDevices} access is required before starting the test. ${detail}`);
      return;
    } finally {
      mediaStream?.getTracks().forEach((track) => track.stop());
      setStartingTest(false);
    }

    console.log("=== [Attempt Test Clicked] Backend Data ===");
    console.log("[testDetail] Full test object from backend:", testDetail);
    console.log("[questions] Resolved question list:", questions);
    console.log("[existingAttempt] Attempt record for this user/test:", existingAttempt);
    // Clear previous problem statuses for fresh attempt
    questions.forEach(p => {
      localStorage.removeItem(`problem_${p.question.problemId}_status`);
    });

    if (testDetail.durationMinutes) {
      // Store a deadline timestamp so the timer survives navigation remounts
      const deadlineMs = Date.now() + testDetail.durationMinutes * 60 * 1000;
      localStorage.setItem(`test_${testDetail.testId}_deadline`, String(deadlineMs));
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
            <span>Allow {SECURITY_CONFIG.ENABLE_PROCTORING ? 'camera and microphone' : 'microphone'} access when prompted before the timed test begins.</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
            <span>The assessment timer starts after required device permissions are granted and the test opens.</span>
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

      {SECURITY_CONFIG.ENABLE_PROCTORING && (
        <section className="mb-8 flex max-w-2xl flex-col items-center gap-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-5 text-center sm:flex-row sm:text-left">
          <QRCodeCanvas value={mobileProctorUrl} size={128} bgColor="#0f172a" fgColor="#e2e8f0" includeMargin />
          <div>
            <h2 className="font-semibold text-white">Set up your phone camera</h2>
            <p className="mt-1 text-sm text-slate-300">Scan this code and allow camera access on your phone before starting the timed test.</p>
            <p className="mt-2 text-xs text-slate-400">
              {phoneConnected
                ? 'Phone camera connected. You can start the test.'
                : phoneSeen
                  ? 'Phone camera disconnected. Reopen the QR page to continue.'
                  : 'Waiting for phone camera access...'}
            </p>
          </div>
        </section>
      )}

      <div className="max-w-2xl">
        {permissionError && (
          <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-300">
            {permissionError}
          </p>
        )}
        {existingAttempt ? (
          <div className="border-4 border-black bg-[var(--neo-red)] p-4 text-center font-bold text-black shadow-[6px_6px_0_0_#000]">
            You have already attempted this test. Retakes are not allowed.
            <div className="mt-2 text-sm">Recorded score: {existingAttempt.totalScore ?? 0}%</div>
          </div>
        ) : (
          <button
            onClick={handleStartTest}
            disabled={startingTest || (SECURITY_CONFIG.ENABLE_PROCTORING && !phoneConnected)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl text-lg flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-green-600/20 transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            <FaPlayCircle /> {startingTest
              ? 'Checking device permissions...'
              : SECURITY_CONFIG.ENABLE_PROCTORING && !phoneConnected
                ? 'Connect phone camera to start'
                : 'Start Test Session'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TestDetail;
