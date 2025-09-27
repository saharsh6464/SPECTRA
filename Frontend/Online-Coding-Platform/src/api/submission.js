import axiosInstance from "./axiosSetup";
export const addSubmission = async (data) =>{
    try{
        const response = await axiosInstance.post(`testattempts`,data);
        console.log(response.data);
        return response.data;
    }
    catch(e){
        console.log("Error Occurredd",e);
        throw e;
    }
}


