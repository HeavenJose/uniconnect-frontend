import React, { useState } from 'react';

// Import pages from the 'pages' folder
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Import the main DashboardLayout component
import DashboardLayout from './components/DashboardLayout';

// The main application component
const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('welcome');

  // This function simulates a successful authentication
  const handleAuth = (userData) => {
    setUser(userData);
    // After login/register, the DashboardLayout will take over navigation
  };

  // This function simulates signing out
  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('welcome'); // Go back to the welcome page
  };

  // This function decides which main view to show
  const renderPage = () => {
    if (user) {
      // If a user is logged in, show the entire Dashboard application
      return <DashboardLayout user={user} onSignOut={handleSignOut} />;
    }

    // If no user, show the correct public-facing page
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage onLogin={handleAuth} setCurrentPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage onRegister={handleAuth} setCurrentPage={setCurrentPage} />;
      default:
        return <WelcomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

// Export the App component to be used by index.js
export default App;
