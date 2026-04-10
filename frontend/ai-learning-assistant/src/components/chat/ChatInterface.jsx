import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchInitialHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                // Handle both array response and object with data property
                const historyData = Array.isArray(response.data)
                    ? response.data
                    : response.data?.messages ?? [];
                setHistory(historyData);
            } catch (error) {
                // 404 just means no history yet — not a real error, start fresh
                console.warn("Could not load chat history, starting fresh:", error?.response?.status);
                setHistory([]);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchInitialHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
          if (!documentId) {
              throw new Error('Missing documentId');
          }

          console.log('Sending chat request:', {
              documentId,
              message: userMessage.content
          });

          const response = await aiService.chat(documentId, userMessage.content);

          console.log('Chat response:', response.data);

          const assistantMessage = {
              role: 'assistant',
              content: response.data.answer || response.data.message || 'No response returned.',
              timestamp: new Date(),
              relevantChunks: response.data.relevantChunks || []
          };

          setHistory(prev => [...prev, assistantMessage]);
      } catch (error) {
          console.error('Chat error full:', error);
          console.error('Chat error status:', error?.response?.status);
          console.error('Chat error data:', error?.response?.data);

          const errorMessage = {
              role: 'assistant',
              content:
                  error?.response?.data?.message ||
                  error?.response?.data?.error ||
                  'Sorry, something went wrong. Please try again.',
              timestamp: new Date()
          };

          setHistory(prev => [...prev, errorMessage]);
      } finally {
          setLoading(false);
      }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === 'user';
        return (
            <div key={index} className={`flex items-start gap-3 mb-4 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                    <div className="shrink-0">
                        <Sparkles className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 p-1.5 text-white" strokeWidth={2} />
                    </div>
                )}
                <div className={`max-w-lg p-4 rounded-2xl shadow-sm ${
                    isUser
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-tr-md'
                        : 'bg-orange-50 border border-orange-100 text-slate-800 rounded-tl-md'
                }`}>
                    {isUser ? (
                        <p className="text-sm">{msg.content}</p>
                    ) : (
                        <div className="text-sm">
                            <MarkdownRenderer content={msg.content} />
                        </div>
                    )}
                </div>
                {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-orange-400" strokeWidth={2} />
                </div>
                <Spinner />
                <p className="text-slate-500 text-sm">Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-orange-50/40 to-white">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center min-h-[400px] px-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 mb-4">
                            <MessageSquare className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            Start a conversation
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                            Ask me anything about the document!
                        </p>
                    </div>
                ) : (
                    history.map(renderMessage)
                )}

                <div ref={messagesEndRef} />

                {loading && (
                    <div className="flex items-start gap-3 mt-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
                            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-orange-100 bg-white px-4 py-3">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-300 transition-all"
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 px-2 py-2"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" strokeWidth={2} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;