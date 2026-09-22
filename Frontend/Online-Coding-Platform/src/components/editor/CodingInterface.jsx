import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlay, FaUpload, FaCheckCircle, FaTimesCircle, FaClock, FaMemory } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { FindQuestionById } from "../../api/question";
import { FindTestCase } from "../../api/Testcase";
import { runCode, submitCodeApi } from "../../api/submission";
import { useMainContext } from "../../context/AuthContext";
import SecurityBlocker from "../../security/SecurityBlocker";
import FloatingInterviewWidget from "./FloatingInterviewWidget";



const defaultCode = {
  python: `# Write your Python code here
def main():
    pass

if __name__ == "__main__":
    main()`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    return 0;
}`,
  java: `// Write your Java code here
import java.util.*;

public class Main {
    public static void main(String[] args) {
    }
}`,
  c: `// Write your C code here
#include <stdio.h>

int main() {
    return 0;
}`,
};

const CodingInterface = () => {
  const { testId, problemId } = useParams();
  const navigate = useNavigate();
  const { setFinal } = useMainContext();

  const [code, setCode] = useState(defaultCode.python);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [combined, setCombined] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorRef = useRef(null);

  // Fetch question and testcase
  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        const [qData, tcData] = await Promise.allSettled([
          FindQuestionById(problemId),
          FindTestCase(problemId),
        ]);

        const question = qData.status === 'fulfilled' ? qData.value : null;
        const testCase = tcData.status === 'fulfilled' ? tcData.value : null;

        if (question) {
          setCombined({
            ...question,
            testCase: testCase || null,
          });
        } else {
          setCombined({
            problemId,
            title: `Problem #${problemId}`,
            description: "No description available for this problem.",
            difficulty: "Medium",
            timeComplexity: "O(n)",
            spaceComplexity: "O(1)",
            testCase: null,
          });
        }
      } catch (err) {
        console.error("Error loading problem details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [problemId]);

  // Resizer state
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const isResizing = useRef(false);

  const handleMouseDown = (e) => {
    isResizing.current = true;
    e.preventDefault();
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 25 && newWidth < 75) setLeftPanelWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      setOutput("Please enter code before running.");
      return;
    }

    setIsRunning(true);
    setOutput("Executing code against assessment test cases...");
    setTestResult(null);

    const payload = {
      problemId: parseInt(problemId, 10),
      language: language,
      submittedCode: code,
    };

    console.log("Executing /questions/run with payload:", payload);

    try {
      const result = await runCode(payload);
      console.log("RunCode response from backend:", result);

      const passedCases = Array.isArray(result?.passed) ? result.passed : [];
      const failedCases = Array.isArray(result?.failed) ? result.failed : [];
      const executionError = result?.error;

      const totalCases = passedCases.length + failedCases.length;
      const isPassed = !executionError && totalCases > 0 && failedCases.length === 0;
      const score = totalCases > 0 ? Math.round((passedCases.length / totalCases) * 10) : (isPassed ? 10 : 0);

      const evalData = {
        passed: isPassed,
        score: score,
        passedList: passedCases,
        failedList: failedCases,
        error: executionError,
        total: totalCases,
      };

      setTestResult(evalData);

      console.log(`Execution Summary: ${passedCases.length}/${totalCases} Passed, ${failedCases.length} Failed. Error:`, executionError);

      if (executionError) {
        setOutput(`Compilation / Execution Error:\n${executionError}`);
      } else if (totalCases === 0) {
        setOutput("Code executed. No test cases returned.");
      } else {
        let msg = `Execution Finished.\n`;
        msg += `✓ Passed: ${passedCases.length}/${totalCases} testcase(s) [${passedCases.join(", ")}]\n`;
        if (failedCases.length > 0) {
          msg += `✗ Failed: ${failedCases.length}/${totalCases} testcase(s) [${failedCases.join(", ")}]\n`;
        }
        setOutput(msg);
      }

      // Update score in context
      setFinal(prev => ({
        ...prev,
        [String(problemId)]: {
          score: evalData.score,
          passed: evalData.passed,
        }
      }));
    } catch (err) {
      console.error("RunCode execution failed:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Execution failed";
      setOutput(`Error running code: ${errMsg}`);
      setTestResult({
        passed: false,
        score: 0,
        passedList: [],
        failedList: [],
        error: errMsg,
        total: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const [clientSecret, setClientSecret] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        problemId: parseInt(problemId, 10),
        language: language,
        submittedCode: code,
      };

      try {
        const response = await submitCodeApi(payload);

        const passedCases = Array.isArray(response?.passed) ? response.passed : [];
        const failedCases = Array.isArray(response?.failed) ? response.failed : [];
        const totalCases = passedCases.length + failedCases.length;
        const isPassed = !response.error && totalCases > 0 && failedCases.length === 0;
        const score = totalCases > 0 ? Math.round((passedCases.length / totalCases) * 10) : (isPassed ? 10 : 0);

        // Update state for test attempt
        setFinal(prev => ({
          ...prev,
          [String(problemId)]: {
            score,
            passed: isPassed,
          }
        }));

        localStorage.setItem(`problem_${problemId}_status`, "submitted");
        window.dispatchEvent(new Event("storage"));

        if (response?.realtimeClientSecret) {
          setClientSecret(response.realtimeClientSecret);
          setOutput("Code submitted successfully. All test cases passed! You can now start the AI Interview.");
          // Wait for user to finish interview, prevent immediate navigation
          setIsSubmitting(false);
          return;
        }

      } catch (err) {
        console.warn("Error calling submit code API:", err);
      }

      // Fallback: If no interview secret, navigate away immediately
      if (testId) {
        navigate(`/student/attempt/${testId}`);
      } else {
        navigate("/student/questions");
      }
    } catch (err) {
      console.error("Error submitting problem:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-400">Loading problem...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {testId && <SecurityBlocker testId={testId} />}

      {/* Top Header */}
      <header className="flex-shrink-0 px-4 py-2.5 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
        <button
          onClick={() => (testId ? navigate(`/student/attempt/${testId}`) : navigate("/student/questions"))}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          <FaArrowLeft /> {testId ? "Back to Test Attempt" : "Back to Questions"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-indigo-400">#{problemId}</span>
          <span className="text-base font-bold text-white truncate max-w-md">{combined?.title}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm flex items-center gap-2 cursor-pointer shadow transition-colors disabled:opacity-50"
        >
          <FaUpload /> {isSubmitting ? "Submitting..." : "Submit & Back"}
        </button>
      </header>

      {/* Split Workspace */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel: Problem Statement & Test Cases */}
        <div
          className="overflow-y-auto p-6 space-y-6 border-r border-slate-700/50"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{combined?.title}</h1>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${(combined?.difficulty || '').toLowerCase() === "easy"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : (combined?.difficulty || '').toLowerCase() === "medium"
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
            >
              {combined?.difficulty || "Medium"}
            </span>
          </div>

          <div className="flex gap-4 text-xs text-slate-400">
            {combined?.timeComplexity && (
              <span className="flex items-center gap-1">
                <FaClock className="text-slate-500" /> Time: <strong className="text-slate-200">{combined.timeComplexity}</strong>
              </span>
            )}
            {combined?.spaceComplexity && (
              <span className="flex items-center gap-1">
                <FaMemory className="text-slate-500" /> Space: <strong className="text-slate-200">{combined.spaceComplexity}</strong>
              </span>
            )}
          </div>

          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            <h3 className="text-white font-semibold text-base">Description</h3>
            <p className="whitespace-pre-wrap">{combined?.description}</p>
          </div>

          {combined?.testCase?.inputFormat && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Input Format</h3>
              <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
                {combined.testCase.inputFormat}
              </div>
            </div>
          )}

          {combined?.testCase?.outputFormat && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Output Format</h3>
              <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
                {combined.testCase.outputFormat}
              </div>
            </div>
          )}

          {combined?.testCase?.sampleInputFile && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Sample Input</h3>
              <pre className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 overflow-x-auto">
                {combined.testCase.sampleInputFile}
              </pre>
            </div>
          )}

          {combined?.testCase?.sampleOutputFile && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Sample Expected Output</h3>
              <pre className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 overflow-x-auto">
                {combined.testCase.sampleOutputFile}
              </pre>
            </div>
          )}

          {combined?.testCase?.testCaseFile && combined.testCase.testCaseFile !== combined.testCase.sampleInputFile && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Test Case Input (testCaseFile)</h3>
              <pre className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 overflow-x-auto">
                {combined.testCase.testCaseFile}
              </pre>
            </div>
          )}

          {combined?.testCase?.outputFile && combined.testCase.outputFile !== combined.testCase.sampleOutputFile && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Test Case Expected Output (outputFile)</h3>
              <pre className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 overflow-x-auto">
                {combined.testCase.outputFile}
              </pre>
            </div>
          )}
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize bg-slate-800 hover:bg-indigo-500 transition-colors flex-shrink-0"
        ></div>

        {/* Right Panel: Code Editor & Execution Console */}
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Editor Toolbar */}
          <div className="flex-shrink-0 px-4 py-2 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Language:</span>
              <select
                value={language}
                onChange={(e) => {
                  const sel = e.target.value;
                  setLanguage(sel);
                  setCode(defaultCode[sel] || "");
                }}
                className="py-1 px-3 rounded bg-slate-700 border border-slate-600 text-white text-xs focus:outline-none"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </select>
            </div>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <FaPlay className="text-[10px]" /> {isRunning ? "Executing..." : "Run Code"}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-grow min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "python" ? "python" : language}
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                contextmenu: true,
              }}
            />
          </div>

          {/* Console / Output Drawer */}
          <div className="flex-shrink-0 h-48 border-t border-slate-700 bg-slate-900 flex flex-col">
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Execution Output</span>
                {testResult && testResult.total > 0 && (
                  <span className="text-slate-400">
                    Passed: <strong className="text-green-400 font-mono">{testResult.passedList.length}</strong> / {testResult.total}
                  </span>
                )}
              </div>
              {testResult && (
                <span
                  className={`flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full text-xs ${testResult.passed
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : testResult.error
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}
                >
                  {testResult.passed ? (
                    <>
                      <FaCheckCircle /> All Testcases Passed ({testResult.score}/10 pts)
                    </>
                  ) : testResult.error ? (
                    <>
                      <FaTimesCircle /> Execution Error (0/10 pts)
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> {testResult.passedList?.length || 0}/{testResult.total} Passed ({testResult.score}/10 pts)
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Testcase Pills */}
            {testResult && (testResult.passedList?.length > 0 || testResult.failedList?.length > 0) && (
              <div className="px-4 py-1.5 bg-slate-800/40 border-b border-slate-700/50 flex flex-wrap items-center gap-2 text-xs">
                {testResult.passedList?.map((tcId) => (
                  <span
                    key={`passed-${tcId}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-[11px]"
                  >
                    <FaCheckCircle className="text-[10px]" /> Testcase #{tcId}: Passed
                  </span>
                ))}
                {testResult.failedList?.map((tcId) => (
                  <span
                    key={`failed-${tcId}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-[11px]"
                  >
                    <FaTimesCircle className="text-[10px]" /> Testcase #{tcId}: Failed
                  </span>
                ))}
              </div>
            )}

            <div className="flex-grow p-3 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {output || "Click 'Run Code' to execute against backend assessment test cases."}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Realtime Interview Widget */}
      {clientSecret && (
        <FloatingInterviewWidget clientSecret={clientSecret} />
      )}
    </div>
  );
};

export default CodingInterface;
