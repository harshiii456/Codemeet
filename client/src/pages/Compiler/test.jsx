import React, { useState } from "react";

// Function to create a submission
const createSubmission = async (languageId, code, input) => {
    const url = "https://judge0-ce.p.rapidapi.com/submissions?fields=*";
    const options = {
        method: "POST",
        headers: {
            "x-rapidapi-key": "YOUR_API_KEY",
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
            "x-rapidapi-key": "YOUR_API_KEY",
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

const CompilerPage = () => {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            // Insert 4 spaces
            setCode((prevCode) => prevCode.substring(0, start) + "    " + prevCode.substring(end));
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
            setCode((prevCode) => prevCode.substring(0, start) + char + closingChars[char] + prevCode.substring(end));
            // Move the cursor between the characters
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 1;
            }, 0);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Online Code Compiler</h1>

            <div className="w-full max-w-4xl">
                {/* Language Selector */}
                <label htmlFor="language" className="block text-lg font-semibold mb-2">
                    Select Language
                </label>
                <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none mb-4"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                </select>

                {/* Code Editor */}
                <label htmlFor="code" className="block text-lg font-semibold mb-2">
                    Write Code
                </label>
                <textarea
                    id="code"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    rows="10"
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none mb-4"
                    placeholder="Write your code here..."
                ></textarea>

                {/* Input Field */}
                <label htmlFor="input" className="block text-lg font-semibold mb-2">
                    Provide Input
                </label>
                <textarea
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows="5"
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none mb-4"
                    placeholder="Enter input for your code..."
                ></textarea>

                {/* Compile Button */}
                <button
                    onClick={compileCode}
                    disabled={loading}
                    className={`w-full ${loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
                        } text-white font-semibold py-3 rounded-lg transition-all mb-4`}
                >
                    {loading ? "Compiling..." : "Compile"}
                </button>

                {/* Output Display */}
                <label htmlFor="output" className="block text-lg font-semibold mb-2">
                    Output
                </label>
                <textarea
                    id="output"
                    value={output}
                    readOnly
                    rows="5"
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none"
                    placeholder="Compilation output will appear here..."
                ></textarea>
            </div>
        </div>
    );
};

export default CompilerPage;