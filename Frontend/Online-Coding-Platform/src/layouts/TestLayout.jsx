// src/layouts/TestLayout.jsx (NEW FILE)
import React from 'react';
import { Outlet } from 'react-router-dom';
import ProctoringSession from '../components/editor/ProctoringSession';

// This is a minimal layout specifically for the test-taking experience.
// It removes the main Topbar and Sidebar to provide a focused, full-screen environment.
const TestLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white">
      <ProctoringSession>
        <Outlet />
      </ProctoringSession>
    </div>
  );
};

export default TestLayout;
