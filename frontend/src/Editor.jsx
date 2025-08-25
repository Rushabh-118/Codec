import { useEffect, useState, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuid } from "uuid";
import { saveAs } from "file-saver";
import { FiCopy, FiSun, FiMoon, FiTrash2 } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

const socket =
  import.meta.env.MODE === "development"
    ? io(import.meta.env.VITE_BACKEND_URL)
    : io("https://codec-backend.onrender.com");

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

  // --- Emoji Picker State ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedRoomId = localStorage.getItem("roomId");
    const storedUserName = localStorage.getItem("userName");
    const storedJoined = localStorage.getItem("joined");
    if (storedRoomId && storedUserName && storedJoined === "true") {
      setRoomId(storedRoomId);
      setUserName(storedUserName);
      setJoined(true);
      // Optionally, re-join the room on refresh
      socket.emit("join", { roomId: storedRoomId, userName: storedUserName });
    }
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("userName", userName);
      localStorage.setItem("joined", "true");
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
    localStorage.removeItem("roomId");
    localStorage.removeItem("userName");
    localStorage.removeItem("joined");
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest(".emoji-picker")) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  if (!joined) {
    return (
      <div
        className={`min-h-screen relative flex items-center justify-center p-6 overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
        }`}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.25),transparent_40%)] blur-2xl"></div>

        <div className="w-full max-w-6xl relative z-10">
          <div
            className={`flex flex-col lg:flex-row gap-8 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden border ${
              darkMode
                ? "bg-gray-800/70 border-gray-700"
                : "bg-white/70 border-gray-200"
            }`}
          >
            {/* Left Side - Features */}
            <div
              className={`lg:w-1/2 p-10 flex flex-col justify-between ${
                darkMode
                  ? "bg-gradient-to-br from-gray-700/80 to-gray-800/70"
                  : "bg-gradient-to-br from-indigo-50 to-purple-50"
              }`}
            >
              <Link to="/" className="self-start mb-6">
                <button
                  className={`p-2 rounded-full transition duration-300 shadow-md ${
                    darkMode
                      ? "text-indigo-300 hover:bg-gray-600 hover:scale-105"
                      : "text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-105"
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
                  className={`text-4xl font-extrabold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Code Collaboration{" "}
                  <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                    Made Simple
                  </span>
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
                      className={`p-3 rounded-lg mr-4 shadow-md transition ${
                        darkMode
                          ? "bg-gray-600/70 group-hover:bg-indigo-600/30"
                          : "bg-white"
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
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        See changes instantly as you code together
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-lg mr-4 shadow-md transition ${
                        darkMode
                          ? "bg-gray-600/70 group-hover:bg-indigo-600/30"
                          : "bg-white"
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
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        Supports all major programming languages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-lg mr-4 shadow-md transition ${
                        darkMode
                          ? "bg-gray-600/70 group-hover:bg-indigo-600/30"
                          : "bg-white"
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
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        End-to-end encrypted collaboration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Room Form */}
            <div
              className={`lg:w-1/2 p-10 flex items-center justify-center ${
                darkMode ? "bg-gray-900/70" : "bg-white/80"
              }`}
            >
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1
                    className={`text-3xl font-bold ${
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
                      className={`peer w-full px-4 py-2 border-0 border-b-2 rounded-t-lg focus:ring-0 focus:border-indigo-600 transition-all ${
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
                      className={`peer w-full px-4 py-2 border-0 border-b-2 rounded-t-lg focus:ring-0 focus:border-indigo-600 transition-all ${
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
                        className={`w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 active:scale-[0.98] ${
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
              plan :- {userPlan}
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
              {copySuccess && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "12px",
                    color: darkMode ? "#fbbf24" : "#4b5563",
                  }}
                >
                  {copySuccess}
                </span>
              )}
            </button>
          </div>
        </div>

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
                  color: navigator.onLine ? "#10b981" : "#ef4444",
                  transition: "color 0.2s",
                }}
              >
                {navigator.onLine ? "Active" : "Inactive"}
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
                const isOnline = navigator.onLine;
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
                        background: isOnline ? "#10b981" : "#ef4444",
                        transition: "background 0.2s",
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
                {/* Emoji Picker Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-l border-r border-gray-300 dark:border-gray-600"
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Emoji"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 9H9.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 9H15.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Emoji Picker (shown when toggled) */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 z-10 emoji-picker">
                    <EmojiPicker
                      onEmojiClick={(emojiObject, event) => {
                        setChatInput(
                          (prev) =>
                            prev +
                            (emojiObject.emoji || emojiObject.native || "")
                        );
                      }}
                      width={300}
                      height={350}
                    />
                  </div>
                )}

                {/* Message Input */}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  className="flex-1 border bg-gray-100 dark:bg-gray-700"
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

                {/* Send Button */}
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
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
            }}
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
                borderRight: darkMode
                  ? "1px solid #374151"
                  : "1px solid #e5e7eb", // Add right border
                resize: "none",
                backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                color: darkMode ? "#f3f4f6" : "#111827",
                outline: "none",
                fontFamily: "monospace",
                fontSize: "14px",
                height: "auto",
              }}
            />
            <button
              className="run-btn"
              onClick={runCode}
              style={{
                padding: "12px 20px",
                border: "none",
                background: darkMode ? "#1e40af" : "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                height: "auto",
              }}
            >
              Execute
            </button>
          </div>

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
