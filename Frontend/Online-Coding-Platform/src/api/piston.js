import axios from "axios";

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

export const runCode = async (code,language,stdin) => {
  console.log(code,language)
  if (typeof code !== "string" || !code.trim()) {
    console.error("Code must be a non-empty string");
    return { stdout: "", stderr: "No code provided" };
  }

  try {
    const { data } = await axios.post(
      PISTON_API_URL,
      {
        language, // hardcoded
        version: "*",     // latest Java
        files: [{ name: "Main.java", content: code }],
        stdin,
      },
      { headers: { "Content-Type": "application/json" } }
      
    );

    // Return stdout and stderr
    return data.run;
  } catch (error) {
    console.error("Error running code:", error);
    return { stdout: "", stderr: error?.response?.data?.message || error.message };
  }
};
