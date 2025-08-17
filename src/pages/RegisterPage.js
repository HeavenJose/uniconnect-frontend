import React, { useState } from 'react';

// --- Themed Register Page (Corrected to Redirect to Login) ---
const RegisterPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    'School of Digital Humanities and Liberal Arts',
    'School of Informatics',
    'School of Electronic System and Automation',
    'School of Computer Science and Engineering',
    'School of Digital Sciences',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Error: Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          department: formData.department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed.');
      }

      setSuccess('Registration successful! Please log in.');
      
      // After 2 seconds, automatically switch to the login page
      setTimeout(() => {
        setCurrentPage('login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-extrabold text-center text-white mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-gray-400 mb-6">Join the UniConnect community.</p>
        
        {error && <p className="text-red-400 text-center mb-4 font-medium">{error}</p>}
        {success && <p className="text-green-400 text-center mb-4 font-medium">{success}</p>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-400" required />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-400" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-400" required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-400" required />
          <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-400" required>
            <option value="" disabled>Select your department</option>
            {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
          </select>
          <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-3 px-4 rounded-lg" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button onClick={() => setCurrentPage('login')} className="font-bold text-teal-400 hover:text-teal-300">
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;