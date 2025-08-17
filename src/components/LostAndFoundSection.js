import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, ArrowLeft, Send, Bell } from 'lucide-react';

export default function LostAndFoundSection({ user }) {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newItem, setNewItem] = useState({ status: 'Lost', itemName: '', description: '', location: '', imageUrl: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [conversation, setConversation] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const itemsResponse = await fetch('http://localhost:5000/api/lost-items', { headers: { 'x-auth-token': token } });
        if (!itemsResponse.ok) throw new Error('Failed to fetch items.');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);

        const notificationsResponse = await fetch('http://localhost:5000/api/lost-item-conversations/notifications', { headers: { 'x-auth-token': token } });
        if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications.');
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleInputChange = (e) => { const { name, value } = e.target; setNewItem({ ...newItem, [name]: value }); };
  const handlePostItem = async (e) => {
    e.preventDefault();
    try {
      const placeholderImageUrl = "https://placehold.co/400x300/1f2937/9ca3af?text=Item+Photo";
      const itemPayload = { ...newItem, imageUrl: placeholderImageUrl };
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(itemPayload),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.msg || 'Failed to post item.'); }
      const newItemFromServer = await response.json();
      setItems([newItemFromServer, ...items]);
      setNewItem({ status: 'Lost', itemName: '', description: '', location: '', imageUrl: '' });
      setView('list');
    } catch (err) { setError(err.message); }
  };

  const handleMessagePosterClick = async (item) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/lost-item-conversations/item/${item._id}`, { headers: { 'x-auth-token': token } });
        if (!response.ok) throw new Error('Failed to load conversation.');
        const data = await response.json();
        setConversation(data);

        const notification = notifications.find(n => n.item._id === item._id);
        if (notification) {
            await fetch(`http://localhost:5000/api/lost-item-conversations/read/${notification._id}`, {
                method: 'PUT', headers: { 'x-auth-token': token }
            });
            setNotifications(notifications.filter(n => n._id !== notification._id));
        }
        setView('chat');
    } catch (err) { setError(err.message); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/lost-item-conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ itemId: selectedItem._id, text: newMessageText })
        });
        if (!response.ok) throw new Error('Failed to send message.');
        const updatedConversation = await response.json();
        setConversation(updatedConversation);
        setNewMessageText('');
    } catch (err) { console.error(err); }
  };

  const renderView = () => {
    switch (view) {
      case 'notifications':
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-teal-400">Your Unread Messages</h2><button onClick={() => setView('list')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500">Back</button></div>
                {notifications.length > 0 ? (<div className="space-y-4">{notifications.map(notif => (<div key={notif._id} onClick={() => { const fullItem = items.find(i => i._id === notif.item._id); if (fullItem) { setSelectedItem(fullItem); handleMessagePosterClick(fullItem); } }} className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-700"><p className="font-bold text-white">New message for: {notif.item.itemName}</p><p className="text-sm text-gray-400">Click to view chat</p></div>))}</div>) : (<p className="text-gray-400">You have no new messages.</p>)}
            </div>
        );
      case 'post-form': return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-teal-400">Post a Lost or Found Item</h2><button onClick={() => setView('list')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500 flex items-center"><ArrowLeft size={16} className="mr-2"/> Back</button></div>
            <form onSubmit={handlePostItem} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300">Status</label><select name="status" value={newItem.status} onChange={handleInputChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"><option value="Lost">I Lost Something</option><option value="Found">I Found Something</option></select></div>
              <input type="text" name="itemName" value={newItem.itemName} onChange={handleInputChange} placeholder="Item Name" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              <textarea name="description" value={newItem.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required></textarea>
              <input type="text" name="location" value={newItem.location} onChange={handleInputChange} placeholder="Location" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              <button type="submit" className="w-full bg-teal-500 text-gray-900 font-bold py-3 rounded-lg">Post Item</button>
              {error && <p className="text-red-400 text-center mt-2">{error}</p>}
            </form>
          </div>
      );

      case 'item-details':
        if (!selectedItem) return null;
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <button onClick={() => setView('list')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500 mb-6 flex items-center"><ArrowLeft size={16} className="mr-2"/> Back</button>
            <img src={selectedItem.imageUrl || 'https://placehold.co/600x400/1f2937/9ca3af?text=No+Image'} alt={selectedItem.itemName} className="w-full h-64 object-cover rounded-lg mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.itemName}</h2>
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4 ${selectedItem.status === 'Lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{selectedItem.status}</span>
            <p className="text-gray-300 mb-4">{selectedItem.description}</p>
            <div className="text-sm text-gray-400 mb-4"><p><strong>Location:</strong> {selectedItem.location}</p><p><strong>Posted by:</strong> {selectedItem.user?.fullName || 'Unknown'}</p></div>
            {user._id !== selectedItem.user?._id && (<button onClick={() => handleMessagePosterClick(selectedItem)} className="w-full bg-teal-500 text-gray-900 font-bold py-3 rounded-lg">Message Poster</button>)}
          </div>
        );
      
      case 'chat':
        if (!selectedItem) return null;
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col h-[75vh]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4"><h2 className="text-2xl font-bold text-teal-400">Chat for "{selectedItem.itemName}"</h2><button onClick={() => setView('item-details')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500">Back</button></div>
            <div className="flex-1 overflow-y-auto bg-gray-900 p-4 rounded-lg mb-4">{conversation?.messages?.map(msg => (<div key={msg._id} className={`flex my-2 ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-lg max-w-sm ${msg.sender?._id === user._id ? 'bg-teal-600' : 'bg-gray-700'}`}><p className="font-semibold block text-white">{msg.sender?.fullName}</p><p className="text-white break-words">{msg.text}</p></div></div>))}{!conversation?.messages?.length && <p className="text-center text-gray-500">No messages yet.</p>}<div ref={chatEndRef} /></div>
            <form onSubmit={handleSendMessage} className="flex space-x-2"><input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder="Type your message..." className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg" /><button type="submit" className="bg-teal-500 text-gray-900 font-semibold py-3 px-6 rounded-lg">Send</button></form>
          </div>
        );

      case 'list':
      default:
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-400">🔍 Lost & Found</h2>
              {/* --- NOTIFICATION BUTTON IS BACK --- */}
              <div className="flex items-center space-x-4">
                  <button onClick={() => setView('notifications')} className="relative bg-gray-700 py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center">
                      <Bell size={20} />
                      {notifications.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {notifications.length}
                          </span>
                      )}
                  </button>
                  <button onClick={() => setView('post-form')} className="bg-teal-500 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center"><PlusCircle size={16} className="mr-2"/> Post an Item</button>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading && <p>Loading items...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {items.map((item) => (<div key={item._id} onClick={() => { setSelectedItem(item); setView('item-details'); }} className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:shadow-xl border border-gray-700"><img src={item.imageUrl || 'https://placehold.co/400x300/1f2937/9ca3af?text=No+Image'} alt={item.itemName} className="w-full h-48 object-cover rounded-md mb-3" /><h3 className="text-lg font-bold text-white truncate">{item.itemName}</h3><span className={`text-sm font-semibold ${item.status === 'Lost' ? 'text-red-400' : 'text-green-400'}`}>{item.status}</span></div>))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-full font-sans">
      {renderView()}
    </div>
  );
}