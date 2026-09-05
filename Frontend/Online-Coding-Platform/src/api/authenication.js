import axiosInstance from "./axiosSetup";

export const RegisterUser = async (userData) => {
  try {
    console.log("Hiting this api")
    const response = await axiosInstance.post("/users", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const LoginUser = async (userData) => {
  try {
    
    const response = await axiosInstance.post("/users/login", userData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    }
    throw error.response ? error.response.data : error;
  }
};

export const GetAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const GetUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const GetUserByUsername = async (username) => {
  try {
    const response = await axiosInstance.get(`/users/username/${username}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const UpdateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};