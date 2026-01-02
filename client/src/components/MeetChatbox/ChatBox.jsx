import React, { useEffect, useRef } from 'react';
import IconSend from '../../icons/IconSend';

function ChatBox({ messages, newMessage, setNewMessage, handleSendMessage }) {
  const messageEndRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-base font-semibold text-slate-200">Messages</h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-slate-600">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className="flex flex-col bg-slate-800 p-3.5 rounded-lg shadow-md hover:bg-slate-750 transition-all duration-200 animate__animated animate__fadeInUp animate__faster"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-400 font-semibold text-sm">{message.username}</p>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{message.time}</span>
              </div>
              <p className="text-slate-200 text-sm break-words leading-relaxed">{message.text}</p>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      {/* New Message Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 text-slate-200 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none"
          >
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );

}

export default ChatBox;
