import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentRoutes from './routes/StudentRoutes';
import CompanyRoutes from './routes/CompanyRoutes';
import './index.css';
import { ContextProvider } from './context/AuthContext';
import ProtectedRoute from './security/ProtectedRoute';
import AuthPage from './security/login';
import MobileProctor from './components/editor/MobileProctor';

const LogoutHandler = () => {
  localStorage.removeItem("user");
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Routes>
          {/* Default entry redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="/mobile-proctor" element={<MobileProctor />} />

          {/* Student routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute>
                <StudentRoutes />
              </ProtectedRoute>
            }
          />

          {/* Company routes */}
          <Route
            path="/company/*"
            element={
              <ProtectedRoute>
                <CompanyRoutes />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;
