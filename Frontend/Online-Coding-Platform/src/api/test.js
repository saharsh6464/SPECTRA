import axiosInstance from "./axiosSetup";

export const getTests = async () => {
  try {
    const response = await axiosInstance.get('/tests');
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching tests:", e);
    throw e;
  }
};

export const getTestsByid = async (id) => {
  try {
    const response = await axiosInstance.get(`/tests/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching test with id ${id}:`, e);
    throw e;
  }
};

export const postTests = async (data) => {
  try {
    const response = await axiosInstance.post('/tests', data);
    console.log("Test Created Successfully:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating test:", e);
    throw e;
  }
};

export const updateTest = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/tests/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while updating test with id ${id}:`, e);
    throw e;
  }
};

export const deleteTest = async (id) => {
  try {
    const response = await axiosInstance.delete(`/tests/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while deleting test with id ${id}:`, e);
    throw e;
  }
};