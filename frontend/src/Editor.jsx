import { useEffect, useState, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuid } from "uuid";
import { saveAs } from "file-saver";
import { FiCopy, FiSun, FiMoon, FiTrash2 } from "react-icons/fi";

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
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Track if user already created a room (for Free plan restriction)
  const [roomCreatedCount, setRoomCreatedCount] = useState(0);
  const [userPlan, setUserPlan] = useState("Free");

  // Sidebar resizable state
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const startSidebarX = useRef(0);
  const startSidebarWidth = useRef(260);

  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // --- Leader State ---
  const [leader, setLeader] = useState(null);

  // --- Chat Box State ---
  const [showChat, setShowChat] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastSeenMessageIndex = useRef(-1);

  // Only allow chat for Team users
  const chatAllowed = userPlan === "Team";

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Apply dark mode class to body when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#1a202c";
    } else {
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = "#f7fafc";
    }
  }, [darkMode]);

  // Configure Monaco Editor with full IntelliSense support
  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.setTheme(darkMode ? "vs-dark" : "vs");
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

    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);

      // Only increment unread count if chat is closed or if the message isn't from the current user
      if (!showChat && msg.userName !== userName) {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    socket.on("clearChat", () => setChatMessages([]));

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("typingLocked");
      socket.off("chatMessage");
      socket.off("clearChat");
    };
  }, [showChat, userName]);

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
    // Check how many rooms user created today (persisted in localStorage with date)
    const createdData = JSON.parse(
      localStorage.getItem("roomCreatedData") || "{}"
    );
    const today = new Date().toISOString().slice(0, 10);
    setRoomCreatedCount(createdData[today] || 0);
  }, []);

  useEffect(() => {
    // Update leader when users list changes
    if (users && users.length > 0) {
      setLeader(users[0]);
    } else {
      setLeader(null);
    }
  }, [users]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // When chat is opened, reset unread count and update last seen message
    if (showChat) {
      setUnreadChatCount(0);
      lastSeenMessageIndex.current = chatMessages.length - 1;
    }
  }, [chatMessages, showChat]);

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
    if (userPlan === "Free" && roomCreatedCount >= 3) {
      toast.error(
        "Free plan users can only create up to 3 rooms per day. Upgrade to Pro or Team Plan for unlimited rooms."
      );
      return;
    }
    const roomId = uuid().slice(0, 10);
    setRoomId(roomId);
    toast.success(`New room created: ${roomId}`);
    if (userPlan === "Free") {
      const today = new Date().toISOString().slice(0, 10);
      const createdData = JSON.parse(
        localStorage.getItem("roomCreatedData") || "{}"
      );
      createdData[today] = (createdData[today] || 0) + 1;
      localStorage.setItem("roomCreatedData", JSON.stringify(createdData));
      setRoomCreatedCount(createdData[today]);
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
    setSidebarWidth(
      Math.max(180, Math.min(500, startSidebarWidth.current + dx))
    );
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

  const sendChat = () => {
    if (chatInput.trim()) {
      socket.emit("chatMessage", { roomId, message: chatInput, userName });
      setChatInput("");
    }
  };

  const clearChat = () => {
    if (userName === leader) {
      socket.emit("clearChat", { roomId });
    } else {
      toast.warn("Only the leader can clear the chat.");
    }
  };

  const toggleChat = () => {
    setShowChat((prev) => {
      // When opening chat, reset unread count
      if (!prev) {
        setUnreadChatCount(0);
      }
      return !prev;
    });
  };

  if (!joined) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center p-4`}
      >
        <div className="w-full max-w-6xl">
          <div
            className={`flex flex-col lg:flex-row gap-8 rounded-xl shadow-lg overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Left Side - Features */}
            <div
              className={`lg:w-1/2 p-8 ${
                darkMode ? "bg-gray-700" : "bg-indigo-50"
              }`}
            >
              <div className="h-full flex flex-col">
                <Link to="/" className="self-start mb-6">
                  <button
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      darkMode
                        ? "text-indigo-300 hover:bg-gray-600"
                        : "text-indigo-600 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
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
                  <h1
                    className={`text-3xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Code Collaboration Made Simple
                  </h1>
                  <p
                    className={`text-lg mb-8 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Real-time editing with your team
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg mr-4 shadow-sm ${
                          darkMode ? "bg-gray-600" : "bg-white"
                        }`}
                      >
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
                        <h3
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Real-time Sync
                        </h3>
                        <p
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          See changes instantly as you code together
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg mr-4 shadow-sm ${
                          darkMode ? "bg-gray-600" : "bg-white"
                        }`}
                      >
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
                        <h3
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Multi-language Support
                        </h3>
                        <p
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          Supports all major programming languages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg mr-4 shadow-sm ${
                          darkMode ? "bg-gray-600" : "bg-white"
                        }`}
                      >
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
                        <h3
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Secure Rooms
                        </h3>
                        <p
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          End-to-end encrypted collaboration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Room Form */}
            <div
              className={`lg:w-1/2 p-8 flex items-center justify-center ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Join Code Room
                  </h1>
                  <p
                    className={`mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Collaborate in real-time
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className={`peer w-full px-4 py-2 border-0 border-b-2 rounded-t-lg focus:ring-0 focus:border-indigo-600 ${
                        darkMode
                          ? "text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                          : "text-black bg-gray-50 border-gray-300 placeholder-gray-500"
                      }`}
                      placeholder="Enter Room ID...!"
                      disabled={userPlan === "Free" && roomCreatedCount >= 3}
                    />
                  </div>

                  <div className="relative mt-6">
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`peer w-full px-4 py-2 border-0 border-b-2 rounded-t-lg focus:ring-0 focus:border-indigo-600 ${
                        darkMode
                          ? "text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                          : "text-black bg-gray-50 border-gray-300 placeholder-gray-500"
                      }`}
                      placeholder="Enter Your Name...!"
                      disabled={userPlan === "Free" && roomCreatedCount >= 3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={createRoomId}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] ${
                        darkMode
                          ? "text-indigo-300 border border-indigo-300 hover:bg-gray-700"
                          : "text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                      }`}
                      disabled={userPlan === "Free" && roomCreatedCount >= 3}
                    >
                      Create Room
                    </button>

                    <Link to="/api/editor" className="flex-1">
                      <button
                        onClick={joinRoom}
                        className={`w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                          darkMode ? "bg-indigo-700 hover:bg-indigo-800" : ""
                        }`}
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
    <div
      className={`editor-container ${darkMode ? "dark" : ""}`}
      style={{ display: "flex", height: "100vh" }}
    >
      <div
        ref={sidebarRef}
        className={`sidebar ${darkMode ? "dark" : ""}`}
        style={{
          width: sidebarWidth,
          minWidth: 220,
          maxWidth: 400,
          position: "relative",
          transition: resizingSidebar ? "none" : "width 0.2s",
          backgroundColor: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#f3f4f6" : "#111827",
          display: "flex",
          flexDirection: "column",
          borderRight: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          boxShadow: darkMode ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: "16px",
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "8px 0",
              color: darkMode ? "#ffffff" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Code<span style={{ color: "#3b82f6" }}>Collab</span>
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              justifyContent: "center",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
                backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#9ca3af" : "#4b5563",
              }}
            >
              {userPlan} Plan
            </span>
            <button
              onClick={toggleDarkMode}
              style={{
                background: "none",
                border: "none",
                color: darkMode ? "#fbbf24" : "#4b5563",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
                borderRadius: "4px",
                transition: "all 0.2s",
              }}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
          </div>
        </div>

        {/* Room Info Section */}
        <div
          style={{
            padding: "16px",
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: darkMode ? "#9ca3af" : "#4b5563",
                margin: 0,
              }}
            >
              Room Information
            </h3>
            <button
              onClick={copyRoomId}
              style={{
                background: "none",
                border: "none",
                color: darkMode ? "#9ca3af" : "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
                borderRadius: "4px",
              }}
              title="Copy Room ID"
            >
              <FiCopy size={14} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                ID:
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: darkMode ? "#ffffff" : "#111827",
                }}
              >
                {roomId}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                Status:
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#10b981",
                }}
              >
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div
          style={{
            padding: "16px",
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: darkMode ? "#9ca3af" : "#4b5563",
              margin: "0 0 12px 0",
            }}
          >
            Quick Actions
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            <button
              onClick={toggleTypingLock}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: isTypingLocked
                  ? darkMode
                    ? "#7f1d1d"
                    : "#fee2e2"
                  : darkMode
                  ? "#1e40af"
                  : "#dbeafe",
                color: isTypingLocked
                  ? darkMode
                    ? "#fca5a5"
                    : "#b91c1c"
                  : darkMode
                  ? "#bfdbfe"
                  : "#1e40af",
                cursor:
                  isTypingLocked && currentTypingUser !== userName
                    ? "not-allowed"
                    : "pointer",
                fontSize: "12px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              disabled={isTypingLocked && currentTypingUser !== userName}
            >
              {isTypingLocked && currentTypingUser === userName
                ? "Unlock"
                : isTypingLocked
                ? "Locked"
                : "Lock"}
            </button>
            <button
              onClick={downloadCode}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#f3f4f6" : "#111827",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              Download
            </button>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#f3f4f6" : "#111827",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                gridColumn: "span 2",
                appearance: "none",
                paddingRight: "28px",
              }}
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
          </div>
        </div>

        {/* Users Section */}
        <div
          style={{
            padding: "16px",
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: darkMode ? "#9ca3af" : "#4b5563",
                margin: 0,
              }}
            >
              Online Users ({users.length})
            </h3>
            <span
              style={{
                fontSize: "12px",
                color: darkMode ? "#6b7280" : "#9ca3af",
              }}
            >
              {leader ? `Leader: ${leader.slice(0, 8)}...` : ""}
            </span>
          </div>
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              paddingRight: "4px",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {users.map((userObj, index) => {
                const user =
                  typeof userObj === "string" ? userObj : userObj.name;
                const isMe = user === userName;
                const isLeader = user === leader;
                return (
                  <li
                    key={index}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      background: isMe
                        ? darkMode
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(37, 99, 235, 0.1)"
                        : darkMode
                        ? "rgba(31, 41, 55, 0.5)"
                        : "rgba(243, 244, 246, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: isMe
                          ? darkMode
                            ? "#3b82f6"
                            : "#2563eb"
                          : darkMode
                          ? "#f3f4f6"
                          : "#111827",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user}
                      {isMe && " (You)"}
                    </span>
                    {isLeader && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#f59e0b",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          background: darkMode
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(245, 158, 11, 0.2)",
                        }}
                      >
                        LEADER
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer Section */}
        <div
          style={{
            padding: "16px",
            borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={leaveRoom}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: darkMode
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(239, 68, 68, 0.1)",
              color: darkMode ? "#fca5a5" : "#dc2626",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            Leave Room
          </button>
        </div>

        {/* Resize Handle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "8px",
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10,
            background: resizingSidebar
              ? darkMode
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(37, 99, 235, 0.08)"
              : "transparent",
            borderRight: resizingSidebar
              ? `2px solid ${darkMode ? "#3b82f6" : "#2563eb"}`
              : "none",
          }}
          onMouseDown={handleSidebarMouseDown}
          title="Resize sidebar"
        />

        {/* --- Floating Chat Button and Chat Box --- */}
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1200 }}>
          <button
            onClick={chatAllowed ? toggleChat : undefined}
            style={{
              background: darkMode ? "#2563eb" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 56,
              height: 56,
              boxShadow: "0 2px 8px #0002",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              cursor: chatAllowed ? "pointer" : "not-allowed",
              marginBottom: 8,
              position: "relative",
              padding: 0,
              opacity: chatAllowed ? 1 : 0.6,
            }}
            title={
              chatAllowed
                ? showChat
                  ? "Close Chat"
                  : "Open Chat"
                : "Chat is available only for Team users"
            }
            disabled={!chatAllowed}
          >
            {/* Use inbuilt message icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 6.5C21 5.11929 19.8807 4 18.5 4H5.5C4.11929 4 3 5.11929 3 6.5V17.5C3 18.8807 4.11929 20 5.5 20H18.5C19.8807 20 21 18.8807 21 17.5V6.5Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10H16"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 14H14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadChatCount > 0 && !showChat && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 2px 8px #ef444422",
                  border: "2px solid #fff",
                  zIndex: 2,
                }}
              >
                {unreadChatCount}
              </span>
            )}
          </button>
          {showChat && chatAllowed && (
            <div
              className="chat-bot bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-[40rem] w-[28rem]"
              style={{ marginTop: 8, minWidth: 340, maxWidth: 480 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Room Chat</span>
                <span
                  style={{
                    color: "#22c55e",
                    fontWeight: 600,
                    fontSize: 14,
                    marginLeft: 12,
                  }}
                >
                  {users.length} online
                </span>
                <button
                  onClick={clearChat}
                  className={`text-xs px-2 py-1 rounded flex items-center ${
                    userName === leader
                      ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={
                    userName === leader
                      ? "Clear Chat"
                      : `Only leader (${leader}) can clear`
                  }
                  disabled={userName !== leader}
                >
                  <FiTrash2 className="mr-1" /> Clear
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto mb-2"
                style={{ fontSize: 14 }}
              >
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.userName === userName;
                  return (
                    <div
                      key={idx}
                      className="mb-1 flex"
                      style={{
                        justifyContent: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          background: isMe
                            ? darkMode
                              ? "#2563eb"
                              : "#dbeafe"
                            : darkMode
                            ? "#374151"
                            : "#f3f4f6",
                          color: isMe
                            ? darkMode
                              ? "#fff"
                              : "#1e3a8a"
                            : darkMode
                            ? "#f3f4f6"
                            : "#111827",
                          borderRadius: "12px",
                          padding: "6px 12px",
                          maxWidth: "75%",
                          minWidth: "80px",
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          boxShadow: isMe
                            ? "0 2px 8px #2563eb22"
                            : "0 2px 8px #0001",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          {msg.userName}
                          {msg.userName === leader && (
                            <span
                              style={{
                                color: "#f59e42",
                                fontWeight: 600,
                                fontSize: 11,
                                marginLeft: 4,
                              }}
                            >
                              (Leader)
                            </span>
                          )}
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: 11,
                              marginLeft: 8,
                              color: isMe ? "#e0e7ef" : "#64748b",
                            }}
                          >
                            {msg.time}
                          </span>
                        </div>
                        <div style={{ fontSize: 14 }}>{msg.message}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="flex" style={{ minWidth: 0 }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  className="flex-1 border rounded-l bg-gray-100 dark:bg-gray-700"
                  style={{
                    width: 0,
                    minWidth: 0,
                    flex: "1 1 0%",
                    padding: "8px",
                    fontSize: "14px",
                    borderRight: "none",
                  }}
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendChat}
                  className="bg-blue-500 text-white rounded-r hover:bg-blue-600"
                  style={{
                    flexShrink: 0,
                    padding: "8px 16px",
                    fontSize: "14px",
                    minWidth: 60,
                    border: "none",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
          {!chatAllowed && showChat && (
            <div
              className="chat-bot bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-[16rem] w-[22rem] items-center justify-center text-center"
              style={{ marginTop: 8, minWidth: 220, maxWidth: 320 }}
            >
              <span className="font-bold text-lg mb-2">Room Chat</span>
              <div className="text-gray-700 dark:text-gray-200 mb-2">
                Chat is available only for <b>Pro</b> or <b>Team</b> plan users.
              </div>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowChat(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10,
            background: resizingSidebar
              ? darkMode
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(37,99,235,0.08)"
              : "transparent",
            borderRight: resizingSidebar
              ? `2px solid ${darkMode ? "#3b82f6" : "#2563eb"}`
              : "none",
          }}
          onMouseDown={handleSidebarMouseDown}
          title="Resize sidebar"
        />
      </div>

      <div
        className="editor-wrapper"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: darkMode ? "#1a202c" : "#f7fafc",
        }}
      >
        <Editor
          height={"60%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme={darkMode ? "vs-dark" : "vs"}
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

        <div
          style={{ display: "flex", flexDirection: "column", height: "40%" }}
        >
          <textarea
            className="user-input"
            placeholder="Enter input for your program here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
              resize: "none",
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              color: darkMode ? "#f3f4f6" : "#111827",
              outline: "none",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          <button
            className="run-btn"
            onClick={runCode}
            style={{
              padding: "10px",
              border: "none",
              background: darkMode ? "#1e40af" : "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            Execute
          </button>

          <textarea
            className="output-console"
            value={outPut}
            readOnly
            placeholder="Output will appear here..."
            style={{
              flex: 2,
              padding: "12px",
              border: "none",
              borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
              resize: "none",
              backgroundColor: darkMode ? "#111827" : "#f3f4f6",
              color: darkMode ? "#f3f4f6" : "#111827",
              outline: "none",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
};

export default Editor1;
