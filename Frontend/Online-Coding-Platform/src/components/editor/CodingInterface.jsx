import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlay, FaUpload, FaCog } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { runCode } from "../../api/piston";
import { FindQuestionById } from "../../api/question";
import { FindTestCase } from "../../api/Testcase";
import { addSubmission } from "../../api/submission";
import { useMainContext } from "../../context/AuthContext";
import SecurityBlocker from "../../security/SecurityBlocker";

const CodingInterface = () => {
  const { testId, problemId } = useParams();
  const navigate = useNavigate();

    const { final, setFinal } = useMainContext();
  
  const defaultCode = {
    python: `# Write your Python code here
def main():
    pass`,
    cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Write your Java code here
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

  const [code, setCode] = useState(defaultCode.python);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [combined, setCombined] = useState({});
  const editorRef = useRef(null); 

// assumes: const [final, setFinal] = useState({});
const LoggedUser = JSON.parse(localStorage.getItem("user"));

function compareMultiLineOutputs(userOutput, expectedOutput) {
  const userLines = userOutput.trim().split("\n").map(s => s.trim());
  const expectedLines = expectedOutput.trim().split("\n").map(s => s.trim());

  let passedCount = 0;

  for (let i = 0; i < expectedLines.length; i++) {
    const userLine = userLines[i] ?? "";
    const expectedLine = expectedLines[i] ?? "";

    if (userLine === expectedLine) {
      console.log(`Test Case ${i + 1}: ✅ Pass`);
      passedCount++;
    } else {
      console.log(`Test Case ${i + 1}: ❌ Fail`);
      console.log(`  Expected: ${expectedLine}`);
      console.log(`  Your Output: ${userLine}`);
    }
  }

  // FIX: update score for this problemId
  updateScore(problemId, passedCount, expectedLines.length - passedCount);


  return passedCount;
}




function updateScore(qid, passedCount, failedCount) {
  setFinal(prev => {
    const key = String(qid); // keep keys consistent
    const next = {
      ...prev,
      [key]: {
        ...(prev[key] ?? {}),
        score: passedCount * 10,
      },
    };
    console.log("next final (inside setFinal):", next); // this shows the updated state
    return next;
  });
}

// Log AFTER state actually changes
useEffect(() => {
  console.log("final updated:", final);
}, [final]);

  // Fetch problem + testcases
  useEffect(() => {
    const getProblems = async () => {
      try {
        const data = await FindQuestionById(problemId);
        const testcase = await FindTestCase(problemId);
        console.log(testcase);
        setCombined({ ...data, Testcase_detail: testcase });
      } catch (err) {
        console.error("Failed to fetch problem data:", err);
        setCombined({
          title: "Error loading problem",
          description: "Could not fetch problem details.",
          difficulty: "N/A",
          timeComplexity: "N/A",
          spaceComplexity: "N/A",
          Testcase_detail: {
            inputFormat: "N/A",
            outputFormat: "N/A",
            isSample: "N/A",
          },
        });
      }
    };
    getProblems();
  }, [problemId]);

  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
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

  const handleSubmit = () => {
    localStorage.setItem(`problem_${problemId}_status`, "submitted");
    window.dispatchEvent(new Event("storage"));
    if (testId) navigate(`/student/attempt/${testId}`);
    else navigate("/student/resources");
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

 // Inside handleRunCode
const handleRunCode = async () => {
  if (!code || !code.trim()) {
    setOutput("No code to run!");
    return;
  }
  const stdin = combined?.Testcase_detail?.isSample || "";
  const expectedOutput = combined?.Testcase_detail?.sampleOutputfile || "";

  try {
    const result = await runCode(code, language, stdin);
    const userOutput = result.stdout || result.stderr || "No output";
    setOutput(userOutput);

    // Compare outputs and log results
    compareMultiLineOutputs(userOutput, expectedOutput);

  } catch (err) {
    console.error(err);
    setOutput("Error running code: " + err.message);
  }
};


  if (!combined?.title) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <SecurityBlocker/>
      <header className="flex-shrink-0 p-3 border-b border-slate-700 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <FaArrowLeft /> Back to Problem List
        </button>
        <span className="text-lg font-bold">{combined.title}</span>
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm flex items-center gap-2"
        >
          <FaUpload /> Submit & Go Back
        </button>
      </header>

      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel */}
        <div
          className="overflow-y-auto p-6"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">{combined.title}</h1>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                combined.difficulty === "easy"
                  ? "bg-green-500/10 text-green-400"
                  : combined.difficulty === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {combined.difficulty}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-slate-400 mb-4">
            <span>
              Time: <strong>{combined.timeComplexity || "N/A"}</strong>
            </span>
            <span>
              Space: <strong>{combined.spaceComplexity || "N/A"}</strong>
            </span>
            <span>
              Avg Time: <strong>10 min</strong>
            </span>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
            <p>{combined.description}</p>
            <h3 className="text-white font-semibold">Input Format:</h3>
            <pre className="bg-slate-800 p-3 rounded-lg text-sm">
              {combined?.Testcase_detail?.inputFormat}
            </pre>
            <h3 className="text-white font-semibold">Output Format:</h3>
            <pre className="bg-slate-800 p-3 rounded-lg text-sm">
              {combined?.Testcase_detail?.outputFormat}
            </pre>
          </div>
          <h2 className="text-lg font-semibold text-white mt-6 mb-2">
            Sample Test Case File
          </h2>
          <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
            {combined?.Testcase_detail?.isSample ||
              "No sample test case available."}
          </div>
          <h2 className="text-lg font-semibold text-white mt-6 mb-2">
            Sample Output File
          </h2>
          <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
            {combined?.Testcase_detail?.sampleOutputfile ||
              "No sample output available."}
          </div>
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 cursor-col-resize bg-slate-700 hover:bg-indigo-500 transition-colors flex-shrink-0"
        ></div>

        {/* Right Panel */}
        <div
          className="flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="flex-shrink-0 p-2 border-b border-slate-700 flex justify-between items-center">
            {/* Language Dropdown */}
            <select
              value={language}
              onChange={(e) => {
                const selected = e.target.value;
                setLanguage(selected);
                setCode(defaultCode[selected] || "");
              }}
              className="py-1 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none text-sm"
            >
              <option value="python3">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </select>
            <button className="p-2 text-slate-400 hover:text-white">
              <FaCog />
            </button>
          </div>

          <div className="flex-grow bg-[#1e1e1e]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                lineNumbers: "on",
                renderLineHighlight: "all",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>

          <div className="flex-shrink-0 h-1/3 border-t border-slate-700 flex flex-col">
            <div className="p-2 flex justify-end gap-2 border-b border-slate-700">
              <button
                onClick={handleRunCode}
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1.5 px-4 rounded-lg text-sm flex items-center gap-2"
              >
                <FaPlay /> Run Code
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 bg-slate-900">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                {output || "Run your code to see the output here."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingInterface;
