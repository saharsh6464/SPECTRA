import { Route, Routes, Navigate } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import Dashboard from "../pages/student/Dashboard";
import MyTests from "../components/student/MyTests";
import TestDetail from "../components/student/TestDetail";
import StudentResultDetail from "../components/student/StudentResultDetail";
import TestHistory from "../components/student/TestHistory";
import QuestionBank from "../components/common/QuestionBank";
import CodingInterface from "../components/editor/CodingInterface";
import TestAttempt from "../components/student/TestAttempt";
import TestLayout from "../layouts/TestLayout";

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tests" element={<MyTests />} />
        <Route path="upcoming" element={<Navigate to="/student/tests" replace />} />
        <Route path="tests/:testId" element={<TestDetail />} />
        <Route path="questions" element={<QuestionBank />} />
        {/* Backward-compatibility aliases */}
        <Route path="resources" element={<Navigate to="/student/questions" replace />} />
        <Route path="results" element={<Navigate to="/student/tests" replace />} />
        <Route path="history" element={<TestHistory />} />
        <Route path="results/:attemptId" element={<StudentResultDetail />} />
      </Route>

      <Route element={<TestLayout />}>
        <Route path="attempt/:testId" element={<TestAttempt />} />
        <Route path="attempt/:testId/problem/:problemId" element={<CodingInterface />} />
        <Route path="practise/:problemId" element={<CodingInterface />} />
      </Route>

      <Route path="*" element={<Navigate to="/student" replace />} />
    </Routes>
  );
};

export default StudentRoutes;
