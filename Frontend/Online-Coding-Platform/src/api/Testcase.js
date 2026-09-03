import axiosInstance from "./axiosSetup";

export const getTestCases = async () => {
  try {
    const response = await axiosInstance.get('/testcases');
    return response.data;
  } catch (e) {
    console.error("Testcase get error", e);
    throw e;
  }
};

export const FindTestCase = async (questionId) => {
  try {
    const response = await axiosInstance.get(`/testcases/question/${questionId}`);
    return response.data;
  } catch (e) {
    console.error(`Error fetching testcase for question ${questionId}:`, e);
    throw e;
  }
};

export const putTestcase = async (data) => {
  try {
    const response = await axiosInstance.post('/testcases', data);
    return response.data;
  } catch (e) {
    console.error("Testcase post error", e);
    throw e;
  }
};

export const updateTestCase = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/testcases/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Testcase update error for id ${id}:`, e);
    throw e;
  }
};

export const deleteTestCase = async (id) => {
  try {
    const response = await axiosInstance.delete(`/testcases/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Testcase delete error for id ${id}:`, e);
    throw e;
  }
};