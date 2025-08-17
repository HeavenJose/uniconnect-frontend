import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, Send } from 'lucide-react';

export default function ListingSection({ user }) {
  const [view, setView] = useState('listings');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newItem, setNewItem] = useState({ title: '', description: '', price: '', imageUrls: [], isNegotiable: false });
  const [selectedListing, setSelectedListing] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadError, setUploadError] = useState('');
  
  const [conversation, setConversation] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const chatEndRef = useRef(null);

  const [previousView, setPreviousView] = useState('listings');

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
            const listingsResponse = await fetch('http://localhost:5000/api/listings', { headers: { 'x-auth-token': token } });
            if (!listingsResponse.ok) throw new Error('Failed to fetch listings.');
            const listingsData = await listingsResponse.json();
            setListings(listingsData);
            
            const notificationsResponse = await fetch('http://localhost:5000/api/conversations/notifications', { headers: { 'x-auth-token': token } });
            if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications.');
            const notificationsData = await notificationsResponse.json();
            setNotifications(notificationsData);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
    };
    if (user) {
        fetchData();
    }
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleInputChange = (e) => { const { name, value, type, checked } = e.target; setNewItem({ ...newItem, [name]: type === 'checkbox' ? checked : value }); };
  const handleImageUpload = (e) => { const files = Array.from(e.target.files); if (files.length + imagePreviews.length > 5) { setUploadError('Maximum of 5 images allowed.'); return; } const newPreviews = [...imagePreviews]; files.forEach(file => newPreviews.push(URL.createObjectURL(file))); setImagePreviews(newPreviews); };
  const removeImage = (index) => setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  const handlePostListing = async (e) => {
    e.preventDefault(); setUploadError('');
    try {
        const placeholderImageUrl = "https://placehold.co/400x300/1f2937/9ca3af?text=Item";
        const listingPayload = { ...newItem, imageUrls: imagePreviews.length > 0 ? imagePreviews.map(() => placeholderImageUrl) : [placeholderImageUrl] };
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/listings', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(listingPayload),
        });
        if (!response.ok) { const errData = await response.json(); throw new Error(errData.msg || 'Failed to post listing.'); }
        const newListingFromServer = await response.json();
        setListings([newListingFromServer, ...listings]);
        setNewItem({ title: '', description: '', price: '', imageUrls: [], isNegotiable: false });
        setImagePreviews([]);
        setView('listings');
    } catch (err) { setUploadError(err.message); }
  };
  
  const handleMessageSellerClick = async (listing) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/conversations/listing/${listing._id}`, { headers: { 'x-auth-token': token } });
        if (!response.ok) throw new Error('Failed to load conversation.');
        const data = await response.json();
        setConversation(data);
        
        const notification = notifications.find(n => n.listing._id === listing._id);
        if (notification) {
            await fetch(`http://localhost:5000/api/conversations/read/${notification._id}`, {
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
        const response = await fetch('http://localhost:5000/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ listingId: selectedListing._id, text: newMessageText })
        });
        if (!response.ok) throw new Error('Failed to send message.');
        const updatedConversation = await response.json();
        setConversation(updatedConversation);
        setNewMessageText('');
    } catch (err) { console.error(err); }
  };

  const renderView = () => {
    switch (view) {
      case 'notifications': return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-teal-400">Your Unread Messages</h2><button onClick={() => setView('listings')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500">Back</button></div>
                {notifications.length > 0 ? (<div className="space-y-4">{notifications.map(notif => (
                    <div key={notif._id} onClick={() => { 
                        const fullListing = listings.find(l => l._id === notif.listing._id); 
                        if (fullListing) { 
                            setSelectedListing(fullListing);
                            setPreviousView('notifications');
                            handleMessageSellerClick(fullListing);
                        } 
                    }} className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
                        <p className="font-bold text-white">New message for: {notif.listing.title}</p>
                        <p className="text-sm text-gray-400">Click to view chat</p>
                    </div>))}</div>) : (<p className="text-gray-400">You have no new messages.</p>)}
            </div>
      );

      case 'post-form': return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-teal-400">Post New Item</h2><button onClick={() => setView('listings')} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500">Back</button></div>
          <form onSubmit={handlePostListing} className="space-y-4">
            <input type="text" name="title" value={newItem.title} onChange={handleInputChange} placeholder="Item Title" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
            <textarea name="description" value={newItem.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required></textarea>
            <input type="text" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price (e.g., ₹500)" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
            <div><label className="block text-sm text-gray-300">Images (Max 5)</label><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-700 file:text-teal-400" />{uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}<div className="mt-4 grid grid-cols-3 gap-4">{imagePreviews.map((src, index) => (<div key={index} className="relative group"><img src={src} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" /><button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={12} /></button></div>))}</div></div>
            <div className="flex items-center"><input type="checkbox" id="isNegotiable" name="isNegotiable" checked={newItem.isNegotiable} onChange={handleInputChange} className="h-4 w-4 text-teal-500 bg-gray-700 border-gray-500 rounded" /><label htmlFor="isNegotiable" className="ml-2 text-gray-300">Negotiable</label></div>
            <button type="submit" className="w-full bg-teal-500 text-gray-900 font-bold py-3 rounded-lg">Post Listing</button>
          </form>
        </div>
      );
      
      case 'item-details':
        if (!selectedListing) return null;
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <button onClick={() => setView(previousView)} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500 mb-6">Back</button>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedListing.title}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">{(selectedListing.imageUrls || []).map((imgSrc, index) => (<img key={index} src={imgSrc} alt={`${selectedListing.title}`} className="w-full h-auto rounded-lg" />))}</div>
            <p className="text-xl font-semibold text-teal-400 mb-4">₹{selectedListing.price}</p>
            <p className="text-gray-300 mb-4">{selectedListing.description}</p>
            <div className="text-sm text-gray-400 mb-4"><p>Seller: {selectedListing.user.fullName}</p>{selectedListing.isNegotiable && <p className="font-semibold">Price is Negotiable</p>}</div>
            {user._id !== selectedListing.user._id && (<button onClick={() => { setPreviousView('item-details'); handleMessageSellerClick(selectedListing); }} className="w-full bg-teal-500 text-gray-900 font-bold py-3 rounded-lg">Message Seller</button>)}
          </div>
        );

      case 'chat':
        if (!selectedListing) return null;
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col h-[75vh]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-teal-400">Chat for "{selectedListing.title}"</h2>
              <button onClick={() => setView(previousView)} className="bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-500">Back</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-900 p-4 rounded-lg mb-4">{conversation?.messages?.map(msg => (<div key={msg._id} className={`flex my-2 ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-lg max-w-sm ${msg.sender?._id === user._id ? 'bg-teal-600' : 'bg-gray-700'}`}><p className="font-semibold block text-white">{msg.sender?.fullName}</p><p className="text-white break-words">{msg.text}</p></div></div>))}{!conversation?.messages?.length && <p className="text-center text-gray-500">No messages yet.</p>}<div ref={chatEndRef} /></div>
            <form onSubmit={handleSendMessage} className="flex space-x-2"><input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder="Type your message..." className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg" /><button type="submit" className="bg-teal-500 text-gray-900 font-semibold py-3 px-6 rounded-lg">Send</button></form>
          </div>
        );

      case 'listings':
      default:
        return (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-400">🛍 Student Marketplace</h2>
              <div className="flex items-center space-x-4">
                  <button onClick={() => setView('notifications')} className="relative bg-gray-700 py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center"><Bell size={20} />{notifications.length > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{notifications.length}</span>)}</button>
                  <button onClick={() => setView('post-form')} className="bg-teal-500 text-gray-900 font-bold py-2 px-4 rounded-lg">Post Item</button>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading && <p>Loading...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {listings.map((listing) => {
                  const hasNotification = notifications.some(n => n.listing._id === listing._id);
                  return (
                    <div key={listing._id} onClick={() => { 
                        setSelectedListing(listing);
                        setPreviousView('listings');
                        setView('item-details'); 
                    }} className="relative bg-gray-900 p-4 rounded-lg cursor-pointer hover:shadow-xl border border-gray-700">
                        {hasNotification && (<div className="absolute top-2 right-2 text-yellow-400"><Bell size={20} fill="currentColor" /></div>)}
                        <img src={(listing.imageUrls && listing.imageUrls.length > 0) ? listing.imageUrls[0] : 'https://placehold.co/400x300/1f2937/9ca3af?text=No+Image'} alt={listing.title} className="w-full h-48 object-cover rounded-md mb-3" />
                        <h3 className="text-lg font-bold text-white truncate">{listing.title}</h3>
                        <p className="text-teal-400 font-semibold mt-1">₹{listing.price}</p>
                    </div>
                  );
              })}
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
