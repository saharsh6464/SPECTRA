import axiosInstance from "./axiosSetup";


// export const RegisterUser = async (userData) => {
//   try {
//     const response = await axiosInstance.post(`users`, userData);
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// export const LoginUser = async (userData) => {
//   try {
//     const response = await axiosInstance.post(`users/login`, userData);
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };


export const RegisterUser = async (userData) => {
  try {
    console.log("Registering user with data:", userData); // Log the user data being sent
    const response = await axiosInstance.post("/users", userData);
    console.log("Registration response:", response.data); // Log the response data
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
    // Backend returns 401 when username/password is wrong
    if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    }

    throw error.response ? error.response.data : error;
  }
};