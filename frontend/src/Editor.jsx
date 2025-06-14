import { useEffect, useState, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuid } from "uuid";
import { saveAs } from "file-saver";
import { FiCopy } from "react-icons/fi";

const socket =
  import.meta.env.MODE === "development"
    ? io("http://localhost:5001")
    : io("https://minor-codec.onrender.com/");

// Default code templates for each language
const DEFAULT_CODE = {
  javascript: "// Start coding here\n",
  python: "# Start coding here\n",
  java: "public class Main {\n  public static void main(String[] args) {\n    // Start coding here\n  }\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Start coding here\n  return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n  // Start coding here\n  return 0;\n}",
  php: "<?php\n\n// Start coding here\n\n?>",
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  // Start coding here\n}',
  ruby: "# Start coding here\n",
  rust: "fn main() {\n  // Start coding here\n}",
};

const Editor1 = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [userInput, setUserInput] = useState("");
  const [isTypingLocked, setIsTypingLocked] = useState(false);
  const [currentTypingUser, setCurrentTypingUser] = useState("");

  // Track if user already created a room (for Free plan restriction)
  const [roomCreated, setRoomCreated] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");

  // Sidebar resizable state
  const [sidebarWidth, setSidebarWidth] = useState(260); // default width in px
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const startSidebarX = useRef(0);
  const startSidebarWidth = useRef(260);

  // Configure Monaco Editor with full IntelliSense support
  const handleEditorDidMount = (editor, monaco) => {
    // Configure editor with all IntelliSense features
    editor.updateOptions({
      suggest: {
        preview: true,
        showStatusBar: true,
        showIcons: true,
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: { enabled: true },
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoSurround: "languageDefined",
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      wordBasedSuggestions: true,
      suggestSelection: "first",
      tabCompletion: "on",
      snippetSuggestions: "bottom",
      inlayHints: { enabled: "on" },
    });
  };

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
      setCode(DEFAULT_CODE[newLanguage] || DEFAULT_CODE.javascript);
    });

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
    });

    socket.on("typingLocked", ({ user, isLocked }) => {
      setIsTypingLocked(isLocked);
      setCurrentTypingUser(isLocked ? user : "");
      if (isLocked) {
        toast.info(`${user.slice(0, 8)}... has locked the editor`);
      } else {
        toast.info("Editor is now unlocked");
      }
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("typingLocked");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    socket.on("toastMessage", ({ type, message }) => {
      toast[type](message);
    });

    return () => {
      socket.off("toastMessage");
    };
  }, []);

  useEffect(() => {
    // Get user plan from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserPlan(user.plan || "Free");
    }
    // Check if user already created a room today (persisted in localStorage with date)
    const createdDate = localStorage.getItem("roomCreatedDate");
    const today = new Date().toISOString().slice(0, 10);
    setRoomCreated(createdDate === today);
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
      toast.success("You have joined the room");
    }
  };

  const leave = () => {
    Navigate("/");
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode(DEFAULT_CODE.javascript);
    setLanguage("javascript");
    toast.success("You have left the room");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const toggleTypingLock = () => {
    socket.emit("toggleTypingLock", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage] || DEFAULT_CODE.javascript);
    socket.emit("languageChange", { roomId, language: newLanguage });
    toast.success("Language changed!");
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version, userInput });
    toast.info("Running code...");
  };

  const createRoomId = () => {
    if (userPlan === "Free" && roomCreated) {
      toast.notify("Free plan users can only create one room per day. Upgrade Pro or Team Plan for unlimited rooms.");
      return;
    }
    const roomId = uuid().slice(0, 10);
    setRoomId(roomId);
    toast.success(`New room created: ${roomId}`);
    if (userPlan === "Free") {
      setRoomCreated(true);
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("roomCreatedDate", today);
    }
  };

  const downloadCode = () => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      php: "php",
      go: "go",
      ruby: "rb",
      rust: "rs",
    };

    const extension = extensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `code-${roomId || "snippet"}.${extension}`);
    toast.success("Code downloaded!");
  };

  // Sidebar resize handlers
  const handleSidebarMouseDown = (e) => {
    setResizingSidebar(true);
    startSidebarX.current = e.clientX;
    startSidebarWidth.current = sidebarWidth;
    document.body.style.userSelect = "none";
  };
  const handleSidebarMouseMove = (e) => {
    if (!resizingSidebar) return;
    const dx = e.clientX - startSidebarX.current;
    setSidebarWidth(Math.max(180, Math.min(500, startSidebarWidth.current + dx)));
  };
  const handleSidebarMouseUp = () => {
    setResizingSidebar(false);
    document.body.style.userSelect = "auto";
  };
  useEffect(() => {
    if (resizingSidebar) {
      window.addEventListener("mousemove", handleSidebarMouseMove);
      window.addEventListener("mouseup", handleSidebarMouseUp);
    } else {
      window.removeEventListener("mousemove", handleSidebarMouseMove);
      window.removeEventListener("mouseup", handleSidebarMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleSidebarMouseMove);
      window.removeEventListener("mouseup", handleSidebarMouseUp);
    };
  }, [resizingSidebar]);

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Left Side - Features */}
            <div className="lg:w-1/2 p-8 bg-indigo-50">
              <div className="h-full flex flex-col">
                <Link to="/" className="self-start mb-6">
                  <button className="p-2 text-indigo-600 hover:text-white rounded-full hover:bg-indigo-600 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Link>

                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Code Collaboration Made Simple
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Real-time editing with your team
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-white p-3 rounded-lg mr-4 shadow-sm">
                        <svg
                          className="h-6 w-6 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Real-time Sync
                        </h3>
                        <p className="text-gray-600">
                          See changes instantly as you code together
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white p-3 rounded-lg mr-4 shadow-sm">
                        <svg
                          className="h-6 w-6 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Multi-language Support
                        </h3>
                        <p className="text-gray-600">
                          Supports all major programming languages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white p-3 rounded-lg mr-4 shadow-sm">
                        <svg
                          className="h-6 w-6 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Secure Rooms
                        </h3>
                        <p className="text-gray-600">
                          End-to-end encrypted collaboration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Room Form */}
            <div className="lg:w-1/2 p-8 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Join Code Room
                  </h1>
                  <p className="mt-1 text-gray-500">Collaborate in real-time</p>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="peer w-full px-4 py-2 border-0 text-black border-b-2 border-gray-300 bg-gray-50 rounded-t-lg focus:ring-0 focus:border-indigo-600"
                      placeholder="Enter Room ID...!"
                      disabled={userPlan === "Free" && roomCreated}
                    />
                  </div>

                  <div className="relative mt-6">
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="peer w-full text-black px-4 py-2 border-0 border-b-2 border-gray-300 bg-gray-50 rounded-t-lg focus:ring-0 focus:border-indigo-600"
                      placeholder="Enter Your Name...!"
                      disabled={userPlan === "Free" && roomCreated}
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={createRoomId}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg
                  hover:bg-indigo-50 transition-colors duration-200 active:scale-[0.98]"
                      disabled={userPlan === "Free" && roomCreated}
                    >
                      Create Room
                    </button>

                    <Link to="/api/editor" className="flex-1">
                      <button
                        onClick={joinRoom}
                        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg
                    hover:bg-indigo-700 transition-colors duration-200 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!roomId || !userName}
                      >
                        Join Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container" style={{ display: "flex", height: "100vh" }}>
      <div
        ref={sidebarRef}
        className="sidebar"
        style={{ width: sidebarWidth, minWidth: 120, maxWidth: 500, position: "relative", transition: resizingSidebar ? "none" : "width 0.2s" }}
      >
        <div className="room-info" style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <h2 style={{ marginRight: 8, whiteSpace: "nowrap" }}>Room: {roomId}</h2>
          <button
            onClick={copyRoomId}
            className="icon-button"
            title="Copy Room ID"
            style={{ marginLeft: 0, background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <FiCopy size={22} color="#2563eb" style={{ filter: "drop-shadow(0 0 2px #60a5fa)" }} />
          </button>
          {copySuccess && <span className="copy-success" style={{ marginLeft: 8 }}>{copySuccess}</span>}
        </div>
        <div className="user-list">
          <h3>Online Users ({users.length})</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user} {user === userName && "(You)"}
              </li>
            ))}
          </ul>
        </div>
        <p className="typing-indicator">{typing}</p>
        {isTypingLocked && (
          <p className="typing-lock-indicator">
            Editor locked by: {currentTypingUser.slice(0, 8)}...
          </p>
        )}
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="php">PHP</option>
          <option value="go">Go</option>
          <option value="ruby">Ruby</option>
          <option value="rust">Rust</option>
        </select>
        <button
          className={`lock-button ${isTypingLocked ? "locked" : ""}`}
          onClick={toggleTypingLock}
        >
          {isTypingLocked && currentTypingUser === userName
            ? "Unlock Editor"
            : isTypingLocked
            ? "Editor Locked"
            : "Lock Editor"}
        </button>
        <button className="download-button" onClick={downloadCode}>
          Download Code
        </button>
        <Link to="/api/create-room">
          <button className="leave-button" onClick={leaveRoom}>
            Leave Room
          </button>
        </Link>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10,
            background: resizingSidebar ? "rgba(37,99,235,0.08)" : "transparent",
            borderRight: resizingSidebar ? "2px solid #2563eb" : "none",
          }}
          onMouseDown={handleSidebarMouseDown}
          title="Resize sidebar"
        />
      </div>
      <div className="editor-wrapper" style={{ flex: 1, minWidth: 0 }}>
        <Editor
          height={"60%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: isTypingLocked && currentTypingUser !== userName,
            suggest: {
              preview: true,
              showStatusBar: true,
              showIcons: true,
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            parameterHints: { enabled: true },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            wordBasedSuggestions: true,
            suggestSelection: "first",
            tabCompletion: "on",
            snippetSuggestions: "bottom",
            inlayHints: { enabled: "on" },
          }}
        />
        <textarea
          className="user-input"
          placeholder="Enter input for your program here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="run-btn" onClick={runCode}>
          Execute
        </button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output will appear here..."
        />
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Editor1;
