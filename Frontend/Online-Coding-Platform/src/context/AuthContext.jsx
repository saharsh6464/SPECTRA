import { createContext, useContext, useState } from 'react';

const MainContext = createContext();

export const ContextProvider = ({ children }) => {
  const [currentQuestion, setcurrentQuestion] = useState([]);
    const [testDetail, setTestDetails] = useState({});
  
  return (
    <MainContext.Provider value={{ currentQuestion, setcurrentQuestion,testDetail,setTestDetails }}>
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
