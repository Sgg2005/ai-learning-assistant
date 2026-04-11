import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();

    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load all sessions for this document
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatSessions(documentId);
                const data = response.data || [];
                setSessions(data);
                // Auto-select the most recent session
                if (data.length > 0) {
                    loadSession(data[0]);
                }
            } catch (error) {
                console.warn('No sessions found, starting fresh');
                setSessions([]);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchSessions();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const loadSession = async (session) => {
        setActiveSessionId(session._id);
        try {
            const response = await aiService.getChatSession(session._id);
            setHistory(response.data.messages || []);
        } catch (error) {
            setHistory([]);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setHistory([]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content, activeSessionId);
            const { answer, sessionId, sessionName, relevantChunks } = response.data;

            const assistantMessage = {
                role: 'assistant',
                content: answer || 'No response returned.',
                timestamp: new Date(),
                relevantChunks: relevantChunks || []
            };

            setHistory(prev => [...prev, assistantMessage]);

            // If new session was created, add it to the sidebar
            if (!activeSessionId) {
                setActiveSessionId(sessionId);
                setSessions(prev => [{ _id: sessionId, sessionName, messages: [] }, ...prev]);
            } else {
                // Update session name in sidebar if needed
                setSessions(prev => prev.map(s =>
                    s._id === sessionId ? { ...s, sessionName } : s
                ));
            }
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: error?.message || 'Sorry, something went wrong. Please try again.',
                timestamp: new Date()
            };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (sessionId) => {
        if (!renameValue.trim()) return;
        try {
            await aiService.renameChatSession(sessionId, renameValue.trim());
            setSessions(prev => prev.map(s =>
                s._id === sessionId ? { ...s, sessionName: renameValue.trim() } : s
            ));
            setRenamingId(null);
        } catch (error) {
            console.error('Failed to rename session');
        }
    };

    const handleDelete = async (sessionId) => {
        try {
            await aiService.deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setHistory([]);
            }
        } catch (error) {
            console.error('Failed to delete session');
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
                <p className="text-slate-500 text-sm">Loading chats...</p>
            </div>
        );
    }

    return (
        <div className="flex gap-4 h-[75vh]">

            {/* Sessions Sidebar */}
            <div className="w-60 shrink-0 bg-white border border-orange-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                {/* New Chat Button */}
                <div className="p-3 border-b border-orange-100">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        New Chat
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                    {sessions.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center mt-4">No chats yet</p>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session._id}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                                    activeSessionId === session._id
                                        ? 'bg-orange-50 border border-orange-200'
                                        : 'hover:bg-orange-50 border border-transparent'
                                }`}
                                onClick={() => loadSession(session)}
                            >
                                {renamingId === session._id ? (
                                    <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            className="flex-1 text-xs bg-white border border-orange-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-300"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleRename(session._id);
                                                if (e.key === 'Escape') setRenamingId(null);
                                            }}
                                        />
                                        <button onClick={() => handleRename(session._id)} className="text-orange-500 hover:text-orange-700">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setRenamingId(null)} className="text-slate-400 hover:text-slate-600">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <MessageSquare className="w-3.5 h-3.5 text-orange-400 shrink-0" strokeWidth={2} />
                                        <span className="flex-1 text-xs text-slate-600 truncate">{session.sessionName}</span>
                                        <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setRenamingId(session._id); setRenameValue(session.sessionName); }}
                                                className="text-slate-400 hover:text-orange-500 transition-colors"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session._id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-orange-50/40 to-white">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center min-h-[400px] px-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 mb-4">
                                <MessageSquare className="w-8 h-8 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Start a conversation</h3>
                            <p className="text-sm text-slate-500 max-w-sm">Ask me anything about the document!</p>
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
        </div>
    );
};

export default ChatInterface;