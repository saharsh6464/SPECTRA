import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCode, FaHourglassHalf, FaShieldAlt } from 'react-icons/fa';
import { useMainContext } from '../../context/AuthContext';
import { createTestAttempt } from '../../api/testAttempt';
import { getTestsByid } from '../../api/test';
import { getQuestions } from '../../api/question';
import { QRCodeCanvas } from 'qrcode.react';
import SECURITY_CONFIG from '../../config/securityConfig';

const TestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentQuestion, setcurrentQuestion, final } = useMainContext();

  const [problems, setProblems] = useState(currentQuestion || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
  const mobileProctorUrl = `https://td5g7npg-5173.inc1.devtunnels.ms/mobile-proctor?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(loggedUser?.id || "")}`;

  // Duration in minutes
  const storedDuration = Number(localStorage.getItem(`test_${testId}_duration`)) || 60;
  const [timeLeft, setTimeLeft] = useState(storedDuration * 60);

  // If user refreshed during attempt, restore questions from backend
  useEffect(() => {
    if (!problems || problems.length === 0) {
      const restoreTest = async () => {
        try {
          const [testRes, allQ] = await Promise.all([
            getTestsByid(testId),
            getQuestions(),
          ]);
          const qIds = testRes.questionIds || [];
          const qMap = new Map((allQ || []).map(q => [q.problemId, q]));
          const restored = qIds.map((id, index) => ({
            question: qMap.get(id) || { problemId: id, title: `Problem #${id}`, difficulty: 'Medium' },
            points: 10,
            orderId: index + 1,
          }));
          setProblems(restored);
          setcurrentQuestion(restored);
        } catch (e) {
          console.error("Could not restore test questions:", e);
        }
      };
      restoreTest();
    }
  }, [testId, problems, setcurrentQuestion]);

  const getInitialStatuses = (items) => {
    const statuses = {};
    for (const item of items) {
      const qId = item.question?.problemId;
      if (qId) {
        const stored = localStorage.getItem(`problem_${qId}_status`);
        statuses[qId] = stored || 'pending';
      }
    }
    return statuses;
  };

  const [problemStatuses, setProblemStatuses] = useState(() => getInitialStatuses(problems));

  // Sync statuses if problems change
  useEffect(() => {
    setProblemStatuses(getInitialStatuses(problems));
  }, [problems]);

  // Listen for storage events (when a problem is solved in editor)
  useEffect(() => {
    const handleStorageChange = () => {
      setProblemStatuses(getInitialStatuses(problems));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [problems]);

  const handleFinalSubmit = React.useCallback(async () => {
    if (submitting) return;
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || !loggedUser.id) {
      setError("No logged in user found. Please re-login.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const totalScore = Object.values(final || {}).reduce((sum, item) => sum + (item.score || 0), 0);
      const securityViolations = Number(localStorage.getItem(`test_${testId}_violations`)) || 0;

      const payload = {
        test: {
          testId: parseInt(testId, 10),
        },
        user: {
          id: loggedUser.id,
        },
        totalScore: totalScore,
        totalRisk: securityViolations,
      };

      await createTestAttempt(payload);

      problems.forEach(p => {
        localStorage.removeItem(`problem_${p.question.problemId}_status`);
      });
      localStorage.removeItem(`test_${testId}_duration`);
      localStorage.removeItem(`test_${testId}_violations`);

      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      navigate('/student/history');
    } catch (err) {
      console.error("Failed to submit test attempt:", err);
      setError("Failed to finalize test attempt. Please try submitting again.");
    } finally {
      setSubmitting(false);
    }
  }, [final, navigate, problems, submitting, testId]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFinalSubmit]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getStatusButton = (status, problemId) => {
    switch (status) {
      case 'submitted':
        return (
          <Link
            to={`/student/attempt/${testId}/problem/${problemId}`}
            className="text-xs bg-green-600/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 hover:bg-green-600/30 transition-colors"
          >
            <FaCheckCircle /> Submitted (Review)
          </Link>
        );
      case 'attempted':
        return (
          <Link
            to={`/student/attempt/${testId}/problem/${problemId}`}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FaHourglassHalf /> Re-attempt
          </Link>
        );
      default:
        return (
          <Link
            to={`/student/attempt/${testId}/problem/${problemId}`}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FaCode /> Solve Problem
          </Link>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <header className="flex-shrink-0 p-4 border-b border-slate-700/80 bg-slate-800/40 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Test Session in Progress</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test #{testId} • {problems.length} Problems
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-base font-mono bg-slate-800 border border-slate-700 text-white py-1.5 px-3.5 rounded-lg shadow-inner">
            ⏳ {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-rose-600/20"
          >
            {submitting ? "Finalizing..." : "Finish & Submit Test"}
          </button>
        </div>
      </header>

      {error && (
        <div className="m-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {SECURITY_CONFIG.ENABLE_PROCTORING && (
        <section className="mx-6 mt-4 flex flex-col items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-center sm:flex-row sm:justify-center sm:text-left">
          <QRCodeCanvas value={mobileProctorUrl} size={112} bgColor="#0f172a" fgColor="#e2e8f0" includeMargin />
          <div>
            <h2 className="font-semibold text-white">Link a phone camera</h2>
            <p className="mt-1 max-w-md text-xs text-slate-400">Scan this code on your phone and keep the camera page open during the test.</p>
          </div>
        </section>
      )}

      <main className="flex-grow overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Problems to Solve</h2>
          <span className="text-xs text-slate-400">
            Click Solve on any question to open the coding editor.
          </span>
        </div>

        <div className="space-y-3">
          {problems.map((p, index) => {
            const q = p.question || {};
            const qId = q.problemId;
            const status = problemStatuses[qId] || 'pending';

            return (
              <div
                key={qId || index}
                className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white text-base">{q.title || `Problem #${qId}`}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{q.difficulty || 'Medium'}</span>
                      {q.timeComplexity && <span>• {q.timeComplexity}</span>}
                      <span>• {p.points || 10} points</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {getStatusButton(status, qId)}
                </div>
              </div>
            );
          })}

          {problems.length === 0 && (
            <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
              No problems found for this test.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestAttempt;
