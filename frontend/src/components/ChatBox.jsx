import axios from "axios";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample AI responses (you can replace with actual API calls)
  const aiResponses = [
    "Hello! How can I assist you today?",
    "That's an interesting question. Let me think about that...",
    "I'm an AI assistant here to help with your queries.",
    "Could you elaborate more on that?",
    "Thanks for chatting with me! Is there anything else you'd like to know?",
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRandomResponse = () => {
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { text: inputMessage, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get AI response (replace with actual API call)
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/chat`, {
        message: inputMessage,
      });
      const aiMessage = {
        text:
          res.data.chatRes ||
          res.data.text ||
          "I didn't understand that. Could you try rephrasing?",
        sender: "ai",
      };
      console.log(aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text:
          error.response?.data?.error ||
          "Sorry, I encountered an error. Please try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Updated message rendering with Markdown support
  const renderMessage = (text) => {
    return <ReactMarkdown>{text}</ReactMarkdown>;
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat header (unchanged) */}
      <div className="bg-indigo-600 text-white p-4">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation with the AI
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-indigo-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {renderMessage(message.text)}
              </div>
            </div>
          ))
        )}
        {/* Loading indicator (unchanged) */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area (unchanged) */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-white bg-slate-900 flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
