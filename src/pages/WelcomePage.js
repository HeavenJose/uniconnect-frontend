import React, { useState, useEffect } from 'react';

// The WelcomePage component with Tailwind CSS styling and fade-in animation
// It receives a prop to change the parent's state.
function WelcomePage({ setCurrentPage }) {
  const [isVisible, setIsVisible] = useState(false);

  // useEffect to trigger the fade-in animation after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-sans p-4 sm:p-6">
      <main className="w-full max-w-4xl p-8 sm:p-12 md:p-16 bg-gray-800 rounded-3xl shadow-2xl backdrop-filter backdrop-blur-lg bg-opacity-70 border border-gray-700">
        <div
          className={`
            flex flex-col items-center text-center
            transition-all duration-1000 ease-out
            transform
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Welcome to <span className="text-teal-400">UniConnect!</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mb-8 sm:mb-10">
            Connect, collaborate, and share within your university community. Access notes, discover events, showcase projects, and buy/sell items – all in one place.
          </p>
          <div className="welcome-actions">
            <button
              // This button now correctly updates the parent's state to navigate to the register page.
              onClick={() => setCurrentPage('register')}
              className="
                px-8 py-3 sm:px-10 sm:py-4
                text-lg sm:text-xl font-semibold
                bg-teal-500 hover:bg-teal-400
                text-gray-900
                rounded-full
                transition-all duration-300
                transform hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50
              "
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WelcomePage;
