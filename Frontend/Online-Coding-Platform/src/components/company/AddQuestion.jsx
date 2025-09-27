import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { useMainContext } from "../../context/AuthContext";
import { PostData } from "../../api/question";
import { putTestcase } from "../../api/Testcase";

const AddQuestion = ({ onClose }) => {
  const { currentQuestion, setcurrentQuestion } = useMainContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [TestCaseInputFile, setTestCaseInputFile] = useState("");
  const [sample_test_cases, setSampleInputTestCases] = useState("");
  const [sampleOutputFile, setsampleOutputFile] = useState("");
  const [input_format, setinputformat] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); // success or error
  const [output_format, setoutputFormat] = useState("");
  const [TimeComplexity, setTimeComplexity] = useState("");
  const[RefrenceOutput,SetRefrenceOutput] = useState("")
  const [SpaceComplexity, setSpaceComplexity] = useState("");

  const SendData = async () => {
    const QuestionData = await PostData(questionData);
    console.log("Question Data from Compoenent After Submitting", QuestionData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionPayload = {
        title,
        description,
        difficulty,
        TimeComplexity,
        SpaceComplexity,
      };

      const QuestionResponse = await PostData(questionPayload);
      console.log("Submitted Question Succesfully to DB", QuestionResponse);

      const qid = QuestionResponse.problemId;

      const testCasePayload = {
        question: {
          problemId: qid,
        },
        testCaseFile: TestCaseInputFile,
        isSample: sample_test_cases,
        inputFormat: input_format,
        outputFormat: output_format,
        outputFile: sampleOutputFile,
        sampleOutputfile:RefrenceOutput,// ✅ use camelCase
      };

      console.log("before sending data", testCasePayload);

      const TestCaseResponse = await putTestcase(testCasePayload);

      console.log("Submitted Test Cases Succesfully to DB:", TestCaseResponse);

      setPopupMessage("✅ Question and Test Cases submitted successfully!");
      setPopupType("success");

      setTimeout(() => {
        setPopupMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit data:", error);
      setPopupMessage("❌ Failed to submit question or test cases.");
      setPopupType("error");

      setTimeout(() => {
        setPopupMessage("");
      }, 3000);
    }

    // console.log("Testcase Data", finaltestCaseData);
  };

  const Popup = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    return (
      <div
        className={`fixed top-5 right-5 px-4 py-2 text-white rounded-lg shadow-lg z-[9999] ${bgColor}`}
      >
        {message}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Question</h2>
        </header>

        <form
          onSubmit={handleSubmit}
          id="add-question-form"
          className="flex-grow overflow-y-auto p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          {/* TimeComplexity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              TimeComplexity
            </label>
            <input
              type="text"
              value={TimeComplexity}
              onChange={(e) => setTimeComplexity(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* SpaceComplexity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              SpaceComplexity
            </label>
            <input
              type="text"
              value={SpaceComplexity}
              onChange={(e) => setSpaceComplexity(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Test Cases */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Test Cases
            </h3>
            <div className="space-y-4">
              {/* Input Case Input Format*/}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Test Case Input format
                </label>
                <textarea
                  rows="4"
                  value={input_format}
                  onChange={(e) => setinputformat(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              {/*Output text Format*/}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Test Case Output format
                </label>
                <textarea
                  rows="4"
                  value={output_format}
                  onChange={(e) => setoutputFormat(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Testcase InputFile
                </label>
                <textarea
                  rows="4"
                  value={TestCaseInputFile}
                  onChange={(e) => setTestCaseInputFile(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Sample Testcase InputFile For Refrence
                </label>
                <textarea
                  rows="4"
                  value={sample_test_cases}
                  onChange={(e) => setSampleInputTestCases(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Testcase Outputfile
                </label>
                <textarea
                rows="4"
                value={sampleOutputFile}
                onChange={(e) => setsampleOutputFile(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                 Refrence Testcase Outputfile
                </label>
                <textarea
                rows="4"
                value={RefrenceOutput}
                onChange={(e) => SetRefrenceOutput(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
              </div>
           
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="p-4 flex justify-end gap-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-question-form"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <FaSave /> Save Question
          </button>
        </footer>
      </div>

      {/* Show popup if message exists */}
      {popupMessage && <Popup message={popupMessage} type={popupType} />}
    </div>
  );
};

export default AddQuestion;
