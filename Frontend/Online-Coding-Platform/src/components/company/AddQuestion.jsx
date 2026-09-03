import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { PostData } from "../../api/question";

const AddQuestion = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionPayload = {
        title,
        description,
        difficulty,
        timeComplexity,
        spaceComplexity,
      };

      const QuestionResponse = await PostData(questionPayload);
      console.log("Submitted Question Successfully to DB", QuestionResponse);

      setPopupMessage("✅ Question submitted successfully!");
      setPopupType("success");

      setTimeout(() => {
        setPopupMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit data:", error);
      setPopupMessage("❌ Failed to submit question.");
      setPopupType("error");

      setTimeout(() => {
        setPopupMessage("");
      }, 3000);
    }
  };

  const Popup = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    return (
      <div className={`fixed top-5 right-5 px-4 py-2 text-white rounded-lg shadow-lg z-[9999] ${bgColor}`}>
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

        <form onSubmit={handleSubmit} id="add-question-form" className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Time Complexity</label>
            <input
              type="text"
              value={timeComplexity}
              onChange={(e) => setTimeComplexity(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Space Complexity</label>
            <input
              type="text"
              value={spaceComplexity}
              onChange={(e) => setSpaceComplexity(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

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
        </form>

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

      {popupMessage && <Popup message={popupMessage} type={popupType} />}
    </div>
  );
};

export default AddQuestion;