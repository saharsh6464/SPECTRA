  export const getCompanyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/companies/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while fetching company with id ${id}:`, e);
    throw e;
  }
};

export const createCompany = async (data) => {
  try {
    const response = await axiosInstance.post('/companies', data);
    return response.data;
  } catch (e) {
    console.error("Error occurred while creating company:", e);
    throw e;
  }
};

export const updateCompany = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/companies/${id}`, data);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while updating company with id ${id}:`, e);
    throw e;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await axiosInstance.delete(`/companies/${id}`);
    return response.data;
  } catch (e) {
    console.error(`Error occurred while deleting company with id ${id}:`, e);
    throw e;
  }
};
