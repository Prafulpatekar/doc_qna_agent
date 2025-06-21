import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  function getAccessToken() {
    try {
      const session = localStorage.getItem("session");
      if (!session) return null;
      const data = JSON.parse(session);
      return data.access_token || null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    axios
      .get("http://localhost:8090/api/v1/upload/", {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      .then((res) => {
        setChats(res.data.data);
        if (res.data.data.length > 0) {
          console.log("Fetched chats:", res.data.data);
          setActiveChatId(res.data.data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch chats:", err);
      });
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    // Fetch message history for the active chat
    axios
      .get(`http://localhost:8090/api/v1/query/history/${activeChatId}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      .then((res) => {
        const chatsData = res.data?.data?.chats || [];
        // Transform API response to messages array
        const messages = chatsData.flatMap((item) => [
          { sender: "user", text: item.question },
          { sender: "bot", text: item.answer },
        ]);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, messages } : chat
          )
        );
      })
      .catch((err) => {
        console.error("Failed to fetch chat history:", err);
      });
  }, [activeChatId]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChatId) return;

    // Optimistically add user message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...(chat.messages || []),
                { sender: "user", text: input.trim() },
              ],
            }
          : chat
      )
    );

    const userInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8090/api/v1/query/",
        {
          doc_id: activeChatId,
          question: userInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const answer = res.data?.data?.answer || "No answer found.";
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...(chat.messages || []),
                  // Only add bot response if last message is user's
                  { sender: "bot", text: answer },
                ],
              }
            : chat
        )
      );
    } catch (err) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...(chat.messages || []),
                  { sender: "bot", text: "Failed to get response from agent." },
                ],
              }
            : chat
        )
      );
      console.error("Query failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadName.trim() || !uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile, uploadName.trim());

    try {
      const res = await axios.post(
        "http://localhost:8090/api/v1/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      if (res.data?.status) {
        // Refresh chats list
        const chatRes = await axios.get(
          "http://localhost:8090/api/v1/upload/",
          {
            headers: {
              Authorization: `Bearer ${getAccessToken()}`,
            },
          }
        );
        setChats(chatRes.data.data);
        if (res.data?.data?.id) {
          setActiveChatId(res.data.data.id);
        }
        setUploadName("");
        setUploadFile(null);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-215 w-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r flex flex-col">
        <div className="p-4 font-bold text-lg border-b">Documents</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`w-full text-left px-2 py-2 hover:bg-blue-50 focus:outline-none ${
                chat.id === activeChatId ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              {chat.filename}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow p-4 border-b">
          <div className="text-lg md:text-xl font-bold text-gray-800 truncate">
            {activeChat?.filename}
          </div>
          <button
            className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm md:text-base"
            onClick={() => setShowModal(true)}
          >
            Upload 💻
          </button>
        </header>
        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-1 md:p-2">
          <div className="max-w-full md:max-w-7xl mx-auto space-y-2">
            {(activeChat?.messages || []).map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="relative flex items-center group">
                  <div
                    className={`rounded-lg px-1 md:px-4 py-2 max-w-[100vw] md:max-w-xl break-words ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "bot" && (
                    <button
                      className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 text-xs p-1"
                      title="Copy to clipboard"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                      }}
                    >
                      {/* Heroicons Clipboard SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 text-sm">
                    Agent is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        {/* Input */}
        <form
          onSubmit={handleSend}
          className="bg-white p-2 md:p-4 flex items-center gap-2 border-t"
        >
          <input
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm md:text-base"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-xs md:max-w-md">
            <div className="text-lg font-bold mb-4">New Upload</div>
            <form onSubmit={handleUpload}>
              <input
                type="file"
                className="w-full border rounded-lg px-3 py-2 mb-4"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadName(e.target.files[0].name);
                    setUploadFile(e.target.files[0]);
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Chat;
