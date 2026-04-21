import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  GraduationCap,
  BookOpen,
  MessageCircle,
  UserCircle2,
  Loader2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { sendMessageStream, Message } from "./lib/gemini";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Halo! 👋 Saya **LingoMaster AI**, tutor pribadi bahasa Inggris Anda. Saya siap membantu Anda berlatih percakapan, memperluas kosa kata, dan memperbaiki *grammar*!\\n\\nKetik pesan Anda atau gunakan salah satu perintah cepat di bawah ini untuk memulai belajar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let currentResponse = "";
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      // Pass the previous history excluding the newly added model placeholder
      await sendMessageStream(messages, text, (chunk) => {
        currentResponse = chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = currentResponse;
          return newMessages;
        });
      });
    } catch (error: any) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          error.message || "An error occurred.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const resetChat = () => {
    if (isLoading) return;
    setMessages([
      {
        role: "model",
        content:
          "Halo! 👋 Saya **LingoMaster AI**, tutor pribadi bahasa Inggris Anda. Saya siap membantu Anda berlatih percakapan, memperluas kosa kata, dan memperbaiki *grammar*!\\n\\nKetik pesan Anda atau gunakan salah satu perintah cepat di bawah ini untuk memulai belajar.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-white md:bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm md:shadow-none">
        <button 
          onClick={resetChat}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity focus:outline-none"
        >
          <div className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-xl shadow-md">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              LingoMaster AI
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Bilingual English Tutor
            </p>
          </div>
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                }`}
              >
                {msg.role === "user" ? (
                  <UserCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>

              <div
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}
              >
                <div
                  className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-sm text-[15px] sm:text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.content ? (
                    <div className="markdown-body prose prose-sm sm:prose-base prose-blue max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 py-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggestion Commands */}
      {messages.length === 1 && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-2">
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider pl-1">
            Quick Commands
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSend("/intro")}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-700 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              <UserCircle2 className="w-4 h-4 text-blue-500" />
              <span>/intro</span>
            </button>
            <button
              onClick={() => setInput("/vocab ")}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-700 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>/vocab [word]</span>
            </button>
            <button
              onClick={() => handleSend("/practice")}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-700 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span>/practice</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-3xl p-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or command..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-2.5 px-4 text-gray-800 placeholder-gray-400 text-[15px] outline-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 sm:p-3 w-10 sm:w-11 h-10 sm:h-11 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
          LingoMaster AI can make mistakes. Consider verifying important
          information.
        </p>
      </footer>
    </div>
  );
}
