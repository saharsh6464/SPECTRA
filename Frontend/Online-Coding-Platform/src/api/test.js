import axiosInstance from "./axiosSetup";

export const postTests = async (data) => {
    try {
        const response = await axiosInstance.post('tests', data);
        console.log("Test Created Successfully:", response.data);
        return response.data;
    } catch (e) {
        console.error("Error occurred while creating test:", e);
        throw e;
    }
};

export const getTests = async () => {
    try {
        const response = await axiosInstance.get('tests');
        return response.data;
    } catch (e) {
        console.error("Error occurred while fetching tests:", e);
        throw e;
    }
};

export const getTestsByid = async (id) => {
    try {
        const response = await axiosInstance.get(`tests/${id}`);
        return response.data;
    } catch (e) {
        console.error(`Error occurred while fetching test with id ${id}:`, e);
        throw e;
    }
};