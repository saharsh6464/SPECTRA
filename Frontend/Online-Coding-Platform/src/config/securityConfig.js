/**
 * Security, Proctoring & Editor Validation Configuration
 * 
 * Set ENABLE_PROCTORING to false to disable the complete proctoring system.
 */
export const SECURITY_CONFIG = {
  // Master switch: Set to false to disable all proctoring, blocking, and warnings completely
  ENABLE_PROCTORING: true,

  // Copy & Paste: Set to true to allow Ctrl+C, Ctrl+V, Ctrl+X in the editor
  ALLOW_COPY_PASTE: true,

  // Tab Switching: Set to true to allow switching browser tabs without penalty or detection
  ALLOW_TAB_SWITCH: true,

  // Window Focus: Set to true to allow clicking outside the window or minimizing without penalty
  ALLOW_WINDOW_BLUR: true,

  // Developer Tools & Screenshots: Set to true to allow PrintScreen, F12, DevTools shortcuts
  ALLOW_SHORTCUTS: true,

  // Backend Logging: Set to true to send anomaly records to /api/anomalies backend
  LOG_ANOMALIES_TO_BACKEND: false,
};

export default SECURITY_CONFIG;
