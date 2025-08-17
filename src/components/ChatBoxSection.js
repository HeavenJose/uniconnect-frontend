import React, { useState, useEffect, useRef } from 'react';

// This component now receives the full 'user' object
export default function ChatBoxSection({ user }) {
  const [activeChat, setActiveChat] = useState('Public'); // 'Public' or the department name
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // A ref to the end of the chat messages to enable auto-scrolling
  const chatEndRef = useRef(null);

  const emojis = ['😀', '😂', '🥳', '😎', '👍', '❤️'];

  // This effect runs whenever the active chat room changes
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/messages/${activeChat}`, {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Failed to fetch messages.');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Only fetch if the user data is available
        fetchMessages();
    }
  }, [activeChat, user]);

  // This effect auto-scrolls to the bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ text: message, room: activeChat }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Failed to send message.');
      }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]); // Add the new message to the list
      setMessage('');
      setShowEmojiPicker(false);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const renderMessages = () => {
    if (isLoading) return <p className="text-center text-gray-400">Loading messages...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;
    if (messages.length === 0) return <p className="text-center text-gray-500">No messages yet. Be the first to say hello!</p>;

    return messages.map((msg) => (
      <div key={msg._id} className={`flex ${msg.user?._id === user._id ? 'justify-end' : 'justify-start'}`}>
          <div className={`p-3 rounded-lg max-w-sm ${msg.user?._id === user._id ? 'bg-teal-600' : 'bg-gray-700'}`}>
            <span className={`font-semibold ${msg.user?._id === user._id ? 'text-white' : 'text-teal-400'}`}>
                {msg.user?.fullName || 'User'}
            </span>
            <p className="text-white">{msg.text}</p>
            <span className="text-xs text-gray-400 float-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
      </div>
    ));
  };
  
  return (
    <div className="p-4 bg-gray-900 text-white min-h-full font-sans">
      <h2 className="text-3xl font-bold mb-6 text-teal-400">💬 Chat Box</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveChat('Public')}
          className={`px-4 py-2 rounded-lg font-medium ${activeChat === 'Public' ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Public Chat
        </button>
        <button
          onClick={() => setActiveChat(user.department)}
          className={`px-4 py-2 rounded-lg font-medium ${activeChat === user.department ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {/* The button now shows the user's actual department */}
          {user.department}
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-[60vh] border border-gray-700">
        <div className="flex-grow overflow-y-auto space-y-4 p-4 mb-4 border-b border-gray-700">
          {renderMessages()}
          {/* This empty div is the target for our auto-scroll */}
          <div ref={chatEndRef} />
        </div>
        
        <div className="relative flex items-center p-4 bg-gray-900 rounded-b-lg">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl p-2 rounded-full hover:bg-gray-700">
            😊
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 p-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg flex space-x-2">
              {emojis.map((emoji, index) => (
                <button key={index} onClick={() => handleEmojiSelect(emoji)} className="text-2xl hover:bg-gray-600 p-1 rounded">
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Type your message for ${activeChat} chat...`}
            className="flex-grow p-3 mx-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          
          <button onClick={handleSendMessage} className="ml-3 bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-md">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}