import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaImages, FaShieldAlt } from "react-icons/fa";
import { getTests } from "../../api/test";
import { getTestAttempts } from "../../api/testAttempt";
import { getAnomalyFactors, getFlaggedImages } from "../../api/proctoringApi";

const TestMonitoring = () => {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [images, setImages] = useState([]);
  const [showImages, setShowImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsResult, attemptsResult] = await Promise.allSettled([getTests(), getTestAttempts()]);
        const testData = testsResult.status === "fulfilled" ? testsResult.value : [];
        const attemptData = attemptsResult.status === "fulfilled" ? attemptsResult.value : [];
        setTests(Array.isArray(testData) ? testData : []);
        setAttempts(Array.isArray(attemptData) ? attemptData : []);
      } catch (loadError) {
        setError("Could not load tests and completed attempts.");
        console.error("Could not load company test monitoring data:", loadError);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const completedAttempts = useMemo(() => {
    if (!selectedTest) return [];
    const byUser = new Map();

    attempts
      .filter((attempt) => String(attempt.test?.testId ?? attempt.testId) === String(selectedTest.testId))
      .forEach((attempt) => {
        const userId = String(attempt.user?.id ?? attempt.userId ?? "unknown");
        if (!byUser.has(userId)) {
          byUser.set(userId, {
            userId,
            username: attempt.user?.username || `User #${userId}`,
            score: attempt.totalScore ?? 0,
            risk: attempt.totalRisk ?? 0,
            attemptId: attempt.id,
          });
        }
      });

    return Array.from(byUser.values());
  }, [attempts, selectedTest]);

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setShowImages(false);
    setImages([]);
    setReportLoading(true);
    setError("");
    try {
      const anomaly = await getAnomalyFactors(selectedTest.testId, student.userId);
      setReport(anomaly);
    } catch (reportError) {
      setReport(null);
      setError("Could not load this student's proctoring report.");
      console.error("Could not load anomaly report:", reportError);
    } finally {
      setReportLoading(false);
    }
  };

  const loadFlaggedImages = async () => {
    if (!selectedTest || !selectedStudent) return;
    setShowImages(true);
    setImageLoading(true);
    setError("");
    try {
      const imageData = await getFlaggedImages(selectedTest.testId, selectedStudent.userId);
      setImages(Array.isArray(imageData) ? imageData : []);
    } catch (imageError) {
      setError("Could not load flagged images.");
      console.error("Could not load flagged images:", imageError);
    } finally {
      setImageLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-300">Loading tests...</div>;
  }

  if (selectedStudent) {
    return (
      <div>
        <button type="button" onClick={() => setSelectedStudent(null)} className="mb-6 flex items-center gap-2 bg-slate-700 px-4 py-2 text-white">
          <FaArrowLeft /> Back to {selectedTest.testName || "test"}
        </button>
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-300">{selectedTest.testName || `Test #${selectedTest.testId}`}</p>
            <h1 className="text-3xl font-bold text-white">{selectedStudent.username}</h1>
            <p className="mt-1 text-sm text-slate-300">User ID: {selectedStudent.userId}</p>
          </div>
          <button type="button" onClick={loadFlaggedImages} className="flex items-center gap-2 bg-[var(--neo-pink)] px-4 py-2 text-black">
            <FaImages /> View Flagged Images
          </button>
        </header>

        {error && <div className="mb-5 border-2 border-black bg-[var(--neo-red)] p-3 text-black">{error}</div>}
        {reportLoading ? <p className="text-slate-300">Loading report...</p> : (
          <div className="border-4 border-black bg-slate-800 p-5 shadow-[6px_6px_0_0_#000]">
            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Window blurs", report?.window_blur_count ?? 0],
                ["Paste events", report?.paste_count ?? 0],
                ["Copy events", report?.copy_count ?? 0],
                ["Fullscreen exits", report?.fullscreen_exit_count ?? 0],
                ["Score", selectedStudent.score],
              ].map(([label, value]) => (
                <div key={label} className="border-2 border-black bg-slate-700 p-4 text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs text-slate-200">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <FaShieldAlt className="text-amber-400" /> Security risk: <strong>{selectedStudent.risk}</strong>
            </div>
            {report?.transcript && <div className="mt-5 border-2 border-black bg-slate-900 p-4 text-sm text-white">Transcript: {report.transcript}</div>}
          </div>
        )}

        {showImages && (
          <section className="mt-6 border-4 border-black bg-slate-800 p-5 shadow-[6px_6px_0_0_#000]">
            <h2 className="mb-4 text-xl font-bold text-white">Flagged Images</h2>
            {imageLoading ? <p className="text-slate-300">Loading images...</p> : images.length === 0 ? <p className="text-slate-300">No flagged images found.</p> : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <figure key={image.id || image.image_url} className="border-2 border-black bg-white p-2">
                    <img src={image.image_url} alt={`Flagged proctoring capture for ${selectedStudent.username}`} className="aspect-video w-full object-cover" />
                    <figcaption className="mt-2 text-xs text-black">{image.created_at ? new Date(image.created_at).toLocaleString() : "Flagged capture"}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div>
        <button type="button" onClick={() => setSelectedTest(null)} className="mb-6 flex items-center gap-2 bg-slate-700 px-4 py-2 text-white"><FaArrowLeft /> All Tests</button>
        <header className="mb-6">
          <p className="text-sm text-slate-300">Test #{selectedTest.testId}</p>
          <h1 className="text-3xl font-bold text-white">{selectedTest.testName || "Untitled Test"}</h1>
          <p className="mt-1 text-slate-300">Completed students</p>
        </header>
        <div className="overflow-hidden border-4 border-black bg-slate-800 shadow-[6px_6px_0_0_#000]">
          {completedAttempts.length === 0 ? <p className="p-6 text-slate-300">No completed students for this test.</p> : completedAttempts.map((student) => (
            <button key={student.userId} type="button" onClick={() => selectStudent(student)} style={{ background: `linear-gradient(90deg, rgba(239, 68, 68, 0), rgba(239, 68, 68, ${Math.min(0.72, 0.04 + (Math.max(0, Number(student.risk)) / 100) * 0.68)}))` }} className="grid w-full grid-cols-3 gap-4 border-b-2 border-black p-4 text-left text-white hover:bg-slate-700">
              <span className="font-semibold">{student.username}<small className="ml-2 text-xs text-slate-300">#{student.userId}</small></span>
              <span>Score: <strong>{student.score}</strong></span>
              <span>Risk: <strong>{student.risk}</strong></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tests</h1>
        <p className="text-slate-300">Select a test to review finished students and proctoring reports.</p>
      </header>
      {error && <div className="mb-5 border-2 border-black bg-[var(--neo-red)] p-3 text-black">{error}</div>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tests.map((test) => (
          <button key={test.testId} type="button" onClick={() => setSelectedTest(test)} className="border-4 border-black bg-[var(--neo-yellow)] p-5 text-left text-black shadow-[6px_6px_0_0_#000]">
            <span className="text-xs font-bold">TEST #{test.testId}</span>
            <h2 className="mt-2 text-xl font-bold">{test.testName || "Untitled Test"}</h2>
            <p className="mt-2 text-sm">{test.questionIds?.length || 0} questions</p>
          </button>
        ))}
      </div>
      {tests.length === 0 && <p className="text-slate-300">No tests found.</p>}
    </div>
  );
};

export default TestMonitoring;
