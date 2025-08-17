import React, { useState } from 'react';

// --- Themed Login Page Component (Fully Connected to Backend) ---
const LoginPage = ({ onLogin, setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // --- 1. Send login credentials to the backend ---
      const loginResponse = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.msg || 'Login failed.');
      }

      // --- 2. If login is successful, save the token ---
      const token = loginData.token;
      localStorage.setItem('token', token);
      console.log('Login successful, token received.');

      // --- 3. Use the token to fetch the user's full profile data ---
      const profileResponse = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Send the token for authorization
        },
      });

      const userData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(userData.msg || 'Failed to fetch user profile.');
      }

      // --- 4. Pass the real user data to App.js to log in ---
      onLogin(userData); // This updates App.js state and shows the dashboard

    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans'>
      <div className='w-full max-w-md p-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700'>
        <h2 className='text-3xl font-extrabold text-center text-white mb-6'>
          Login to UniConnect
        </h2>
        {error && (
          <p className='text-red-400 text-center mb-4 font-medium'>{error}</p>
        )}
        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-gray-300 text-sm font-semibold mb-1'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400'
              required
            />
          </div>
          <div>
            <label className='block text-gray-300 text-sm font-semibold mb-1'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-lg'
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className='mt-6 text-center text-sm'>
          <p className='text-gray-400'>
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className='font-bold text-teal-400 hover:text-teal-300'
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
