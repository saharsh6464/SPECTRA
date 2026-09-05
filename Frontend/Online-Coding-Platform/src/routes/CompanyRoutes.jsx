import { Route, Routes, Navigate } from 'react-router-dom';
import CompanyLayout from '../layouts/CompanyLayout';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import QuestionBank from '../components/common/QuestionBank';
import TestManagement from '../components/common/TestManagement';
import CandidateManagement from '../components/company/CandidateManagement';
import TestResults from '../components/company/TestResults';
import CompanySettings from '../components/company/CompanySettings';

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route element={<CompanyLayout />}>
        <Route index element={<CompanyDashboard />} />
        <Route path="tests" element={<TestManagement />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="candidates" element={<CandidateManagement />} />
        <Route path="results" element={<TestResults />} />
        <Route path="settings" element={<CompanySettings />} />
        <Route path="*" element={<Navigate to="/company" replace />} />
      </Route>
    </Routes>
  );
};

export default CompanyRoutes;
