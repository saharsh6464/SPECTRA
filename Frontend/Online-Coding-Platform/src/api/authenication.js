import axiosInstance from "./axiosSetup";


export const RegisterUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`users`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const LoginUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`users/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};