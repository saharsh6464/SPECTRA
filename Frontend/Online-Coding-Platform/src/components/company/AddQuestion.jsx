import React, { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { PostData } from "../../api/question";
import { putTestcase } from "../../api/Testcase";

const AddQuestion = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");

  // TestCase model fields (All 6 fields matching TestCase.java)
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [sampleInputFile, setSampleInputFile] = useState("");
  const [sampleOutputFile, setSampleOutputFile] = useState("");
  const [testCaseFile, setTestCaseFile] = useState("");
  const [outputFile, setOutputFile] = useState("");
  const [isSample, setIsSample] = useState(true);

  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionPayload = {
        title,
        description,
        difficulty,
        timeComplexity,
        spaceComplexity,
      };

      const questionResponse = await PostData(questionPayload);
      console.log("Submitted Question Successfully:", questionResponse);

      const savedProblemId = questionResponse?.problemId;

      // If testcase details provided, save testcase entity matching all 6 fields of TestCase model
      if (savedProblemId && (sampleInputFile || sampleOutputFile || testCaseFile || outputFile || inputFormat || outputFormat)) {
        await putTestcase({
          question: { problemId: savedProblemId },
          inputFormat: inputFormat || "Standard Input",
          outputFormat: outputFormat || "Standard Output",
          sampleInputFile: sampleInputFile || "",
          sampleOutputFile: sampleOutputFile || "",
          testCaseFile: testCaseFile || sampleInputFile || "",
          outputFile: outputFile || sampleOutputFile || "",
          isSample: isSample,
        });
        console.log("Testcase attached to question:", savedProblemId);
      }

      setPopupMessage("✅ Question created successfully!");
      setPopupType("success");

      setTimeout(() => {
        setPopupMessage("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to submit question:", error);
      setPopupMessage("❌ Failed to create question. Please check fields.");
      setPopupType("error");
      setTimeout(() => {
        setPopupMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Assessment Question</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} id="add-question-form" className="flex-grow overflow-y-auto p-6 space-y-5">
          {/* Question Details */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum Problem"
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Problem Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem statement, constraints, and requirements..."
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Time Complexity</label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="e.g. O(n)"
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Space Complexity</label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="e.g. O(1)"
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* TestCase Details */}
          <div className="pt-4 border-t border-slate-700 space-y-4">
            <h3 className="text-md font-semibold text-indigo-400">Sample Test Case (Optional)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Input Format</label>
                <input
                  type="text"
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  placeholder="e.g. An array of integers and target"
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Output Format</label>
                <input
                  type="text"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  placeholder="e.g. Indices of the two numbers"
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Sample Input File (sampleInputFile)
              </label>
              <textarea
                rows="2"
                value={sampleInputFile}
                onChange={(e) => setSampleInputFile(e.target.value)}
                placeholder="Sample input shown to candidates (e.g. 5\n1 2 3 4 5)..."
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Sample Output File (sampleOutputFile)
              </label>
              <textarea
                rows="2"
                value={sampleOutputFile}
                onChange={(e) => setSampleOutputFile(e.target.value)}
                placeholder="Expected sample output shown to candidates..."
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Test Case Input File (testCaseFile - Stdin)
              </label>
              <textarea
                rows="2"
                value={testCaseFile}
                onChange={(e) => setTestCaseFile(e.target.value)}
                placeholder="Raw input data fed to stdin during test evaluation..."
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Test Case Output File (outputFile - Expected Output)
              </label>
              <textarea
                rows="2"
                value={outputFile}
                onChange={(e) => setOutputFile(e.target.value)}
                placeholder="Full expected output corresponding to testCaseFile..."
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isSample"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isSample" className="text-sm text-slate-300 select-none cursor-pointer">
                Mark as Sample Test Case (<code className="text-indigo-400">isSample</code>)
              </label>
            </div>
          </div>
        </form>

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
            form="add-question-form"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            <FaSave /> {loading ? "Saving..." : "Save Question"}
          </button>
        </footer>
      </div>

      {popupMessage && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 text-white rounded-lg shadow-xl z-[9999] font-medium ${
            popupType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default AddQuestion;