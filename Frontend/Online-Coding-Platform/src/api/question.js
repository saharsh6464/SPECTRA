import axiosInstance from "./axiosSetup";

export const getQuestions = async () => {
  try {
    const response = await axiosInstance.get('/questions');
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching questions:", e);
    throw e;
  }
};

export const FindQuestionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/questions/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching question with id ${id}:`, e);
    throw e;
  }
};

export const PostData = async (data) => {
  try {
    const response = await axiosInstance.post('/questions', data);
    console.log("Question Submitted Successfully:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while submitting question:", e);
    throw e;
  }
};

export const updateQuestion = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/questions/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while updating question with id ${id}:`, e);
    throw e;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await axiosInstance.delete(`/questions/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while deleting question with id ${id}:`, e);
    throw e;
  }
};