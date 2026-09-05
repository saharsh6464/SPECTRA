import axiosInstance from "./axiosSetup";

export const getTestAttempts = async () => {
  try {
    const response = await axiosInstance.get('/testattempts');
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching test attempts:", e);
    throw e;
  }
};

export const getTestAttemptById = async (id) => {
  try {
    const response = await axiosInstance.get(`/testattempts/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching test attempt with id ${id}:`, e);
    throw e;
  }
};

export const createTestAttempt = async (data) => {
  try {
    const response = await axiosInstance.post('/testattempts', data);
    console.log("Test Attempt created:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating test attempt:", e);
    throw e;
  }
};

export const updateTestAttempt = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/testattempts/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while updating test attempt with id ${id}:`, e);
    throw e;
  }
};

export const deleteTestAttempt = async (id) => {
  try {
    const response = await axiosInstance.delete(`/testattempts/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while deleting test attempt with id ${id}:`, e);
    throw e;
  }
};
