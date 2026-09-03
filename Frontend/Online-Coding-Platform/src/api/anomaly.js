import axiosInstance from "./axiosSetup";

export const getAnomalies = async () => {
  try {
    const response = await axiosInstance.get('/anomalies');
    return response.data;
  } catch (e) {
    console.error("Error occurred while fetching anomalies:", e);
    throw e;
  }
};

export const getAnomalyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/anomalies/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching anomaly with id ${id}:`, e);
    throw e;
  }
};

export const createAnomaly = async (data) => {
  try {
    const response = await axiosInstance.post('/anomalies', data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating anomaly:", e);
    throw e;
  }
};
