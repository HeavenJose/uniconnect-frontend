import React, { useState } from 'react';

// Import each component
import ProfilePage from './ProfilePage';
import ProjectsReviewSection from './ProjectsReviewSection';
import NotesSection from './NotesSection';
import ChatBoxSection from './ChatBoxSection';
import ListingSection from './ListingSection';
import EventsSection from './EventsSection';
// --- 1. IMPORT THE NEW COMPONENT ---
import LostAndFoundSection from './LostAndFoundSection'; 

// Import icons
import {
  User,
  LogOut,
  Layers,
  Edit,
  MessageCircle,
  ClipboardList,
  Calendar,
  Search // --- IMPORT THE ICON FOR THE NEW FEATURE ---
} from 'lucide-react';

const DashboardLayout = ({ user, onSignOut }) => {
  const [currentPage, setCurrentPage] = useState('profile');

  const navItems = [
      { name: 'Profile', path: 'profile', icon: <User size={20} /> },
      { name: 'Projects & Reviews', path: 'projects', icon: <Layers size={20} /> },
      { name: 'Notes', path: 'notes', icon: <Edit size={20} /> },
      { name: 'Chat Box', path: 'chatbox', icon: <MessageCircle size={20} /> },
      { name: 'Listings', path: 'listings', icon: <ClipboardList size={20} /> },
      // --- 2. ADD THE NEW NAVIGATION ITEM ---
      { name: 'Lost & Found', path: 'lost-found', icon: <Search size={20} /> },
      { name: 'Events', path: 'events', icon: <Calendar size={20} /> },
  ];

  const renderDashboardContent = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage user={user} />;
      case 'projects':
        return <ProjectsReviewSection user={user} />; 
      case 'notes':
        return <NotesSection user={user} />;
      case 'chatbox':
        return <ChatBoxSection user={user} />;
      case 'listings':
        return <ListingSection user={user} />;
      // --- 3. ADD THE NEW CASE TO RENDER THE COMPONENT ---
      case 'lost-found':
        return <LostAndFoundSection user={user} />;
      case 'events':
        return <EventsSection user={user} />;
      default:
        return <ProfilePage user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col justify-between p-4 border-r border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 text-center py-4">UniConnect</h1>
          <nav className="mt-6 flex flex-col space-y-2">
            {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => setCurrentPage(item.path)}
                  className={`flex items-center space-x-3 p-3 rounded-lg font-medium w-full text-left ${
                    currentPage === item.path
                      ? 'bg-teal-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
            ))}
          </nav>
        </div>
        <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center space-x-3 p-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-500"
        >
            <LogOut size={20} />
            <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="pb-4 mb-8 border-b border-gray-700">
          <h2 className="text-4xl font-extrabold text-white">
              {navItems.find(item => item.path === currentPage)?.name || 'Dashboard'}
          </h2>
        </header>
        {renderDashboardContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;