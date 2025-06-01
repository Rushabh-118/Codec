import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuid } from "uuid";

const socket = import.meta.env.MODE === "development" 
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
  go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n  // Start coding here\n}",
  ruby: "# Start coding here\n",
  rust: "fn main() {\n  // Start coding here\n}"
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
        showSnippets: true
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
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
      inlayHints: { enabled: "on" }
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

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
      toast.success("You have joined the room");
    }
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
    const roomId = uuid().slice(0, 10);
    setRoomId(roomId);
    toast.success(`New room created: ${roomId}`);
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />  
          <button onClick={createRoomId}>
            create Room Id
          </button>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Link to="/api/editor">
            <button onClick={joinRoom}>Join Room</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <button onClick={copyRoomId} className="icon-button" title="Copy Room ID">
            📋
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
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
          className={`lock-button ${isTypingLocked ? 'locked' : ''}`}
          onClick={toggleTypingLock}
        >
          {isTypingLocked && currentTypingUser === userName 
            ? 'Unlock Editor' 
            : isTypingLocked 
              ? 'Editor Locked' 
              : 'Lock Editor'}
        </button>
        <Link to="/api/create-room">
          <button className="leave-button" onClick={leaveRoom}>
            Leave Room
          </button>
        </Link>
      </div>

      <div className="editor-wrapper">
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
              showSnippets: true
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
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
            inlayHints: { enabled: "on" }
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