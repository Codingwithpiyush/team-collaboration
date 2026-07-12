import React, { useState, useRef, useEffect } from 'react';
import { BASE_API_URL } from '../config';

// ─── Message Component ─────────────────────────────────────────────────────
const ChatMessage = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isBot ? 'row' : 'row-reverse',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '12px',
      animation: 'fadeSlideUp 0.25s ease-out'
    }}>
      {/* Avatar */}
      {isBot && (
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
        }}>
          🤖
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '82%',
        padding: isBot ? '10px 14px' : '9px 14px',
        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isBot
          ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
          : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
        color: isBot ? '#1e293b' : '#ffffff',
        fontSize: '13px',
        lineHeight: '1.55',
        fontWeight: 500,
        border: isBot ? '1px solid #d1fae5' : 'none',
        boxShadow: isBot
          ? '0 2px 8px rgba(0,0,0,0.06)'
          : '0 2px 8px rgba(29,78,216,0.3)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {/* Page suggestion chip */}
        {isBot && msg.page && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: '#dcfce7', color: '#15803d',
            padding: '2px 8px', borderRadius: '20px',
            fontSize: '10px', fontWeight: 700,
            marginBottom: '6px', letterSpacing: '0.03em'
          }}>
            📍 {msg.page}
          </div>
        )}
        {msg.text}
        {/* Timestamp */}
        <div style={{
          fontSize: '10px',
          color: isBot ? '#94a3b8' : 'rgba(255,255,255,0.65)',
          marginTop: '4px',
          textAlign: 'right'
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
    <div style={{
      width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #10b981, #059669)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
    }}>
      🤖
    </div>
    <div style={{
      padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
      border: '1px solid #d1fae5',
      display: 'flex', alignItems: 'center', gap: '4px'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          backgroundColor: '#10b981',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  </div>
);

// ─── Quick Suggestion Pills ────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "📊 What is ESG score?",
  "🌿 Log carbon transaction",
  "🎮 How to join a challenge?",
  "📋 How to export reports?",
  "⚙️ Add a department",
  "🏆 View leaderboard",
];

// ─── Main ChatBot Widget ───────────────────────────────────────────────────
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Hi! I'm **EcoBot**, your EcoSphere ESG assistant.\n\nI can answer questions about carbon tracking, CSR activities, governance, gamification, reports, and settings — all without any external AI!\n\nTry a quick suggestion below or type your question.",
      page: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed, page: null, time: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          role: 'bot',
          text: data.response,
          page: data.page,
          time: formatTime()
        };
        setMessages(prev => [...prev, botMsg]);
        if (!isOpen) setHasNewMessage(true);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "⚠️ Sorry, I couldn't reach the server right now. Please make sure the Django backend is running at http://127.0.0.1:8000/",
        page: null,
        time: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      text: "🔄 Chat cleared! How can I help you with EcoSphere today?",
      page: null,
      time: formatTime()
    }]);
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70%  { transform: scale(1);   box-shadow: 0 0 0 10px rgba(16,185,129,0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .ecobot-input::placeholder { color: #94a3b8; }
        .ecobot-input:focus { outline: none; }
        .ecobot-pill:hover { background: #1d4ed8 !important; color: #fff !important; }
        .ecobot-msg-scroll::-webkit-scrollbar { width: 4px; }
        .ecobot-msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .ecobot-msg-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
      `}</style>

      {/* FAB Toggle Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="EcoBot – ESG Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #374151, #1f2937)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 4px 20px rgba(16,185,129,0.45)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: !isOpen ? 'pulseRing 2.5s infinite' : 'none',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? '✕' : '🤖'}
        {/* Unread badge */}
        {hasNewMessage && !isOpen && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '14px', height: '14px', borderRadius: '50%',
            backgroundColor: '#ef4444', border: '2px solid white',
            display: 'block'
          }} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 9998,
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'chatSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, #065f46, #059669)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', border: '2px solid rgba(255,255,255,0.4)'
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>EcoBot</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', opacity: 0.85 }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: '#4ade80', display: 'inline-block'
                  }} />
                  ESG Platform Assistant · Always Online
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
                color: '#fff', padding: '5px 9px', borderRadius: '8px',
                fontSize: '11px', fontWeight: 600
              }}
            >
              Clear
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="ecobot-msg-scroll"
            style={{
              flex: 1, overflowY: 'auto',
              padding: '16px 14px 8px',
              backgroundColor: '#fafafa',
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.03) 0%, transparent 60%)'
            }}
          >
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div style={{
              padding: '8px 14px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex', flexWrap: 'wrap', gap: '6px'
            }}>
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="ecobot-pill"
                  onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ''))}
                  style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                    fontWeight: 600, cursor: 'pointer',
                    backgroundColor: '#f1f5f9', color: '#475569',
                    border: '1px solid #e2e8f0', transition: 'all 0.2s'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex', alignItems: 'flex-end', gap: '8px',
            flexShrink: 0
          }}>
            <textarea
              ref={inputRef}
              className="ecobot-input"
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask EcoBot anything about ESG..."
              style={{
                flex: 1, resize: 'none', border: '1.5px solid #e2e8f0',
                borderRadius: '12px', padding: '10px 14px',
                fontSize: '13px', fontFamily: 'inherit', lineHeight: '1.5',
                backgroundColor: '#f8fafc', color: '#1e293b',
                transition: 'border-color 0.2s',
                maxHeight: '100px', overflowY: 'auto'
              }}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : '#e2e8f0',
                color: input.trim() && !isLoading ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
                transition: 'all 0.2s',
                boxShadow: input.trim() && !isLoading ? '0 2px 8px rgba(16,185,129,0.35)' : 'none'
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid #94a3b8', borderTopColor: 'transparent',
                  animation: 'typingBounce 0.8s linear infinite'
                }} />
              ) : '➤'}
            </button>
          </div>

          {/* Footer */}
          <div style={{
            padding: '6px 14px 8px',
            backgroundColor: '#fff',
            textAlign: 'center',
            fontSize: '10px',
            color: '#94a3b8',
            fontWeight: 500,
            borderTop: '1px solid #f8fafc'
          }}>
            EcoBot · Keyword-matching ESG assistant · No external AI
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
