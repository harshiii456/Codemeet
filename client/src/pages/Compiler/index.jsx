import React, { useState, useEffect, useRef } from "react";
import codeSnippets from "../../components/codeSnippets/index";
import ACTIONS from "../../Action";

// Function to create a submission
const createSubmission = async (languageId, code, input) => {
  const url = "https://judge0-ce.p.rapidapi.com/submissions?fields=*";
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "5ac47ae538msh90fce1baad47ea3p195c46jsnc31aa49e3713",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: code,
      stdin: input,
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.token;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw new Error("Failed to create submission.");
  }
};

// Function to get the result of a submission
const getSubmission = async (token) => {
  const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "5ac47ae538msh90fce1baad47ea3p195c46jsnc31aa49e3713",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw new Error("Failed to fetch submission result.");
  }
};

const CompilerPage = ({ socketRef, roomId, onCodeChange, onClose }) => {
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(codeSnippets[language]);
  const editorRef = useRef(null);

  const compileCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const languageCodes = {
        javascript: 93,
        java: 91,
        c: 54,
        python: 92,
        cpp: 50,
      };

      const languageId = languageCodes[language];
      const token = await createSubmission(languageId, code, input);

      if (!token) {
        throw new Error("Failed to retrieve token.");
      }

      let result;
      do {
        result = await getSubmission(token);
      } while (result.status.id < 3);

      const decodedOutput = result.stdout
        ? atob(result.stdout)
        : result.stderr
          ? atob(result.stderr)
          : "No output.";
      setOutput(decodedOutput);
    } catch (error) {
      console.error(error);
      setOutput("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // Insert 4 spaces
      // setCode(
      //   (prevCode) =>
      //     prevCode.substring(0, start) + "    " + prevCode.substring(end)
      // );
      // Move the cursor
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }

    // Handle auto-closing brackets and quotes
    const char = e.key;
    const closingChars = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };

    if (closingChars[char]) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // Insert the character and its closing counterpart
      setCode(
        (prevCode) =>
          prevCode.substring(0, start) +
          char +
          closingChars[char] +
          prevCode.substring(end)
      );
      // Move the cursor between the characters
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 0);
    }
  };


  useEffect(() => {
    setCode(codeSnippets[language]);
  }, [language]);

  const myChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, newCode });
    }
  }


  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, (codeRec) => {
        if (code !== codeRec.code) {
          setCode(codeRec.code);
        }
      });
      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      };
    }
  }, [code]);





  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md animate__animated animate__fadeIn animate__faster p-4">
      <div className="relative flex h-[90vh] w-full max-w-7xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-all shadow-lg"
          title="Close Compiler"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Section: Code Editor */}
        <div className="w-2/3 flex flex-col border-r border-slate-700">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
            <h3 className="text-xl font-bold text-slate-100">Code Editor</h3>
            <span className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded-full">
              {language.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 p-5 overflow-hidden">
            <textarea
              id="code"
              ref={editorRef}
              value={code}
              onChange={myChange}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-4 rounded-xl bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed resize-none shadow-inner"
              placeholder="Write your code here..."
            ></textarea>
          </div>
        </div>

        {/* Right Section: Controls & Output */}
        <div className="w-1/3 flex flex-col bg-slate-850">
          <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
            <h3 className="text-xl font-bold text-slate-100">Controls</h3>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {/* Compile Button */}
            <button
              onClick={compileCode}
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-base transition-all shadow-lg ${
                loading 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Compiling...
                </span>
              ) : (
                "▶ Run Code"
              )}
            </button>

            {/* Input Section */}
            {language !== "javascript" && (
              <div>
                <label htmlFor="input" className="block text-sm font-semibold text-slate-300 mb-2">
                  Input
                </label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows="5"
                  className="w-full p-3 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none shadow-inner"
                  placeholder="Enter input for your program..."
                ></textarea>
              </div>
            )}

            {/* Output Section */}
            <div>
              <label htmlFor="output" className="block text-sm font-semibold text-slate-300 mb-2">
                Output
              </label>
              <textarea
                id="output"
                value={output}
                readOnly
                rows="8"
                className="w-full p-3 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none font-mono text-sm resize-none shadow-inner"
                placeholder="Output will appear here..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;
