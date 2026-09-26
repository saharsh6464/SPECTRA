import axiosInstance from "./axiosSetup";
import { API_BASE_URL } from "./axiosSetup";

export const uploadProctoringSnapshot = async (testId, userId, deviceType, imageBlob) => {
  const formData = new FormData();
  formData.append("testId", testId);
  formData.append("userId", userId);
  formData.append("deviceType", deviceType);
  formData.append("image", imageBlob, `${Date.now()}.jpg`);
  const response = await fetch(`${API_BASE_URL}/proctoring/snapshots`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.details || body.error || `Snapshot upload failed (${response.status})`);
    error.status = response.status;
    error.response = { data: body };
    throw error;
  }
  return body;
};

export const updateProctoringTelemetry = async (testId, userId, updates = {}) => {
  const response = await axiosInstance.post(
    `/proctoring/telemetry?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(userId)}`,
    updates,
  );
  return response.data;
};

export const getAnomalyFactors = async (testId, userId) => {
  const response = await axiosInstance.get(
    `/proctoring/anomalies?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(userId)}`,
  );
  return response.data;
};

export const getFlaggedImages = async (testId, userId) => {
  const response = await axiosInstance.get(
    `/proctoring/flagged-images?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(userId)}`,
  );
  return response.data;
};

export const getPhoneStatus = async (testId, userId) => {
  const response = await axiosInstance.get(`/proctoring/phone-status?testId=${encodeURIComponent(testId)}&userId=${encodeURIComponent(userId)}`);
  return response.data;
};
