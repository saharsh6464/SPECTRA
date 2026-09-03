import axiosInstance from "./axiosSetup";

export const getSubmissions = async () => {
  try {
    const response = await axiosInstance.get("/submissions");
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching submissions:", e);
    throw e;
  }
};

export const getSubmissionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/submissions/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching submission with id ${id}:`, e);
    throw e;
  }
};

export const addSubmission = async (data) => {
  try {
    const response = await axiosInstance.post("/submissions", data);
    console.log("Submission response:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating submission:", e);
    throw e;
  }
};

export const runCode = async (data) => {
  try {
    console.log("LOGGIN RUN API",data);
    const response = await axiosInstance.post("/submissions/run", data);
    console.log("Run code response:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while running code:", e);
    throw e;
  }
};
