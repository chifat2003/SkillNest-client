"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FaPaperPlane, FaComments } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Participant {
  _id: string;
  fullName: string;
  role: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readBy: string[];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function MessagesUI() {
  const searchParams = useSearchParams();
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get("conversationId"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) { try { setMe(JSON.parse(stored)); } catch { /* ignore */ } }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setConversations(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/conversations/${convId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch { /* ignore */ } finally { setMessagesLoading(false); }
  }, []);

  useEffect(() => { void fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    void fetchMessages(activeConvId);
    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(() => { void fetchMessages(activeConvId); }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        void fetchConversations(); // refresh last message
      } else {
        throw new Error(data.error?.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
      setNewMessage(content); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeConvId);
  const otherParticipant = activeConv?.participants?.[0];

  return (
    <main className="min-h-screen bg-[#08080d] text-white flex flex-col" style={{ height: "calc(100vh - 68px)" }}>
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Sidebar: conversations list */}
        <aside className="w-full max-w-[280px] border-r border-white/8 flex flex-col">
          <div className="px-4 py-4 border-b border-white/8">
            <h1 className="text-base font-bold">Messages</h1>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#7c6aff]" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-[#9090aa] text-center px-4">
              <FaComments className="text-3xl mb-2 opacity-30" />
              <p className="text-xs">No conversations yet.</p>
              <p className="text-xs mt-1">Start by visiting a freelancer or client profile.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const other = conv.participants?.[0];
                const isActive = conv._id === activeConvId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-white/5 transition-all hover:bg-white/3 ${isActive ? "bg-[#7c6aff]/10 border-l-2 border-l-[#7c6aff]" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {other?.fullName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{other?.fullName || "Unknown"}</span>
                        <span className="text-[10px] text-[#68687d] ml-1 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-[#9090aa] truncate mt-0.5">{conv.lastMessage || "No messages yet"}</p>
                      {conv.unreadCount > 0 && (
                        <span className="mt-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-[#7c6aff] rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main: message thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeConvId ? (
            <div className="flex flex-col items-center justify-center flex-1 text-[#9090aa]">
              <FaComments className="text-5xl mb-3 opacity-20" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-sm font-bold text-white">
                  {otherParticipant?.fullName?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{otherParticipant?.fullName || "Unknown"}</p>
                  <p className="text-xs text-[#68687d]">{otherParticipant?.role || ""}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#7c6aff]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-[#9090aa] py-10">
                    <p className="text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = me?.id === msg.senderId.toString();
                    return (
                      <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-gradient-to-br from-[#7c6aff] to-[#5b4fcf] text-white rounded-br-sm" : "bg-[#1a1a26] border border-white/8 text-[#e0e0f0] rounded-bl-sm"}`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-white/60 text-right" : "text-[#68687d]"}`}>
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-5 py-4 border-t border-white/8 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_15px_rgba(124,106,255,0.3)] disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  <FaPaperPlane className="text-xs" />
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
