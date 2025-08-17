import React, { useState, useEffect } from 'react';

export default function EventsSection() {
  const [view, setView] = useState('events-list');
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    media: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Fetch events from the backend ---
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/events', {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events.');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleMediaUpload = (e) => {
    // This part remains the same for local preview generation
    const files = Array.from(e.target.files);
    // ... validation logic ...
    setNewEvent({ ...newEvent, media: files });
    setMediaPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeMedia = (index) => {
    const newFiles = newEvent.media.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setNewEvent({ ...newEvent, media: newFiles });
    setMediaPreviews(newPreviews);
  };

  // --- Handle submitting a new event to the backend ---
  const handlePublishEvent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      // In a real app, you would upload files to a service and get back URLs.
      // For this demo, we'll just send placeholder URLs.
      const mediaUrls = newEvent.media.map(file => `https://example.com/uploads/${file.name}`);

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          location: newEvent.location,
          media: mediaUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish event.');
      }

      const newEventFromServer = await response.json();
      setEvents([newEventFromServer, ...events]);
      setNewEvent({ title: '', description: '', date: '', location: '', media: [] });
      setMediaPreviews([]);
      setView('events-list');

    } catch (err) {
      setError(err.message);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'post-form':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-full overflow-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-400">Upload New Event</h2>
              <button onClick={() => setView('events-list')} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
                ← Back to Events
              </button>
            </div>
            <form onSubmit={handlePublishEvent} className="space-y-4">
              {/* Form inputs remain the same */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Event Title</label>
                <input type="text" name="title" value={newEvent.title} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Event Description</label>
                <textarea name="description" value={newEvent.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Location</label>
                <input type="text" name="location" value={newEvent.location} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Upload Media</label>
                <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600" />
                {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mediaPreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <img src={src} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                      <button type="button" onClick={() => removeMedia(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-3 px-4 rounded-lg">
                Publish Event
              </button>
            </form>
          </div>
        );
      
      case 'event-details':
        if (!selectedEvent) return null;
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-full overflow-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setView('events-list')} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
                ← Back to Events
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {selectedEvent.media.map((mediaSrc, index) => (
                    <div key={index} className="relative">
                        <img src={mediaSrc} alt={`${selectedEvent.title} - ${index + 1}`} className="w-full h-auto rounded-lg object-cover" />
                    </div>
                ))}
              </div>
              <p className="text-xl font-semibold text-teal-400 mb-4">{selectedEvent.location}</p>
              <p className="text-gray-300 mb-4">{selectedEvent.description}</p>
              <div className="text-sm text-gray-400 mb-4">
                <p>Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );

      case 'events-list':
      default:
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-400">🎉 University Events</h2>
              <button onClick={() => setView('post-form')} className="bg-teal-500 text-gray-900 font-bold py-2 px-4 rounded-lg">
                Publish Event
              </button>
            </div>
            <input type="text" placeholder="Search events..." className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-6 focus:ring-teal-400" />
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? <p>Loading events...</p> : error ? <p className="text-red-400">{error}</p> : events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setView('event-details');
                  }}
                  className="bg-gray-900 p-4 rounded-lg shadow-sm hover:shadow-xl cursor-pointer border border-gray-700"
                >
                  <img src={event.media[0]} alt={event.title} className="w-full h-48 object-cover rounded-md mb-3" />
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="text-teal-400 font-semibold mt-1">{event.location}</p>
                  <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))}
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
