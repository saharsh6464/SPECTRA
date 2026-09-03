import axiosInstance from "./axiosSetup";

export const getMCQs = async () => {
  try {
    const response = await axiosInstance.get('/mcqs');
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching MCQs:", e);
    throw e;
  }
};

export const getMCQById = async (id) => {
  try {
    const response = await axiosInstance.get(`/mcqs/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching MCQ with id ${id}:`, e);
    throw e;
  }
};

export const createMCQ = async (data) => {
  try {
    const response = await axiosInstance.post('/mcqs', data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating MCQ:", e);
    throw e;
  }
};

export const updateMCQ = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/mcqs/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while updating MCQ with id ${id}:`, e);
    throw e;
  }
};

export const deleteMCQ = async (id) => {
  try {
    const response = await axiosInstance.delete(`/mcqs/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while deleting MCQ with id ${id}:`, e);
    throw e;
  }
};
