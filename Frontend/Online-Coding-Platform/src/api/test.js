import axiosInstance from "./axiosSetup";

export const postTests = async (data) =>{
    try{
        const response = await axiosInstance.post('tests',data);
        console.log(response.data);
        return response.data;
    }
    catch(e){
        console.log("Error Occurredd",e);
        throw e;
    }
}

export const getTests= async () =>{
    try{
        const response = await axiosInstance.get('tests');
    
        return response.data;
    }
    catch(e){
        console.log("Error Occurredd",e);
        throw e;
    }
}

export const getTestsByid= async (id) =>{
    try{
        const response = await axiosInstance.get(`tests/${id}`);
        console.log(response.data);
        return response.data;
    }
    catch(e){
        console.log("Error Occurredd",e);
        throw e;
    }
}
