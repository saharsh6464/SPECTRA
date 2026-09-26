import { Route, Routes, Navigate } from 'react-router-dom';
import CompanyLayout from '../layouts/CompanyLayout';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import QuestionBank from '../components/common/QuestionBank';
import CompanySettings from '../components/company/CompanySettings';
import TestMonitoring from '../pages/company/TestMonitoring';

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route element={<CompanyLayout />}>
        <Route index element={<CompanyDashboard />} />
        <Route path="tests" element={<TestMonitoring />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="results" element={<Navigate to="/company/tests" replace />} />
        <Route path="settings" element={<CompanySettings />} />
        <Route path="*" element={<Navigate to="/company" replace />} />
      </Route>
    </Routes>
  );
};

export default CompanyRoutes;
