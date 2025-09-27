import { Route, Routes } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import Dashboard from "../pages/student/Dashboard";
import MyTests from "../components/student/MyTests";
import UpcomingTests from "../components/student/UpcomingTests";
import TestDetail from "../components/student/TestDetail";
import StudentResultDetail from "../components/student/StudentResultDetail";
import TestHistory from "../components/student/TestHistory";
import QuestionBank from "../components/common/QuestionBank";
import CodingInterface from "../components/editor/CodingInterface";
import TestAttempt from "../components/student/TestAttempt";
import TestLayout from "../layouts/TestLayout";
import AuthPage from "../security/login";
// import Tests from '../pages/student/Tests';
// import Results from '../pages/student/Results';
// import History from '../pages/student/History';
// import Profile from '../pages/student/Profile';

// Placeholder for pages that are not yet created
const Placeholder = ({ title }) => (
  <div className="text-white text-2xl">{title}</div>
);

const StudentRoutes = () => {
  return (
    // The StudentLayout component provides the consistent UI (Sidebar, Topbar)
    // for all nested student pages. The <Outlet> inside it renders the specific page.
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
       
        <Route path="tests" element={<MyTests />} />
        <Route path="results" element={<UpcomingTests />} />
        <Route path="tests/:testId" element={<TestDetail />} />
        <Route path="resources" element={<QuestionBank />} />

        <Route
          path="resources"
          element={<Placeholder title="Resources Page" />}
        />
        <Route path="profile" element={<Placeholder title="Profile Page" />} />
        <Route path="history" element={<TestHistory />} />
        <Route path="results/:attemptId" element={<StudentResultDetail />} />
      </Route>

       <Route element={<TestLayout />}>
        <Route path="attempt/:testId" element={<TestAttempt />} />
        <Route path="attempt/:testId/problem/:problemId" element={<CodingInterface />} />
        <Route path="practise/:problemId"  element = {<CodingInterface/>} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
