import { createContext, useContext, useState } from 'react';

const MainContext = createContext();

export const ContextProvider = ({ children }) => {
  const [currentQuestion, setcurrentQuestion] = useState([]);
    const [testDetail, setTestDetails] = useState({});
    const[TestActive,setTestActive] = useState({});
      const [final,setFinal] = useState({});
  return (
    <MainContext.Provider value={{ 
      final,setFinal,
      currentQuestion, setcurrentQuestion,
      testDetail,setTestDetails ,TestActive,setTestActive}}>
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
