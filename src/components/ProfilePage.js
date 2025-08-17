import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

// This component now receives the logged-in 'user' object as a prop
export default function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // This state will hold the profile data, initialized from the user prop
  const [userData, setUserData] = useState(user);
  
  // This temporary state holds changes while in edit mode
  const [tempUserData, setTempUserData] = useState(user);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // This ensures the profile page updates if the user prop changes
  useEffect(() => {
    setUserData(user);
    setTempUserData(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow the bio to be changed
    if (name === 'bio') {
      setTempUserData({ ...tempUserData, [name]: value });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we just show a preview. Real upload will be a future step.
      setImagePreview(URL.createObjectURL(file));
      // In a real app, you'd prepare the file for upload here.
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSaveClick = async () => {
    setError('');
    setSuccess('');
    try {
        const token = localStorage.getItem('token');
        // In a real app, you'd upload the image first and get a URL.
        // For now, we'll use a placeholder.
        const profilePictureUrl = imagePreview ? "https://example.com/new-profile-pic.jpg" : userData.profilePictureUrl;

        const response = await fetch('http://localhost:5000/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                bio: tempUserData.bio,
                profilePictureUrl: profilePictureUrl,
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.msg || 'Failed to update profile.');
        }

        const updatedUser = await response.json();
        setUserData(updatedUser); // Update the main state with data from the server
        setTempUserData(updatedUser);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');

    } catch (err) {
        setError(err.message);
    }
  };

  const handleCancelClick = () => {
    setTempUserData(userData); // Revert changes
    setImagePreview(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-full font-sans">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-400">Your Profile</h2>
          {!isEditing ? (
            <button onClick={handleEditClick} className="bg-teal-500 text-gray-900 py-2 px-4 rounded-lg shadow-md hover:bg-teal-400 font-semibold">
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={handleSaveClick} className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-400 font-semibold">
                Save
              </button>
              <button onClick={handleCancelClick} className="bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 font-semibold">
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {success && <p className="text-green-400 text-center mb-4">{success}</p>}

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={imagePreview || userData?.profilePictureUrl || `https://placehold.co/128x128/1f2937/9ca3af?text=${userData?.fullName?.charAt(0)}&font=sans`}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-teal-500 object-cover"
            />
            {isEditing && (
              <button onClick={handleImageClick} className="absolute bottom-0 right-0 bg-teal-500 text-gray-900 p-2 rounded-full hover:bg-teal-400 shadow-md">
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Full Name</label>
            <input type="text" value={userData?.fullName || ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-md cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Department</label>
            <input type="text" value={userData?.department || ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-md cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Email</label>
            <input type="email" value={userData?.email || ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-md cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Bio</label>
            <textarea
              name="bio"
              rows="3"
              value={tempUserData?.bio || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md ${!isEditing ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-gray-700 text-white focus:ring-2 focus:ring-teal-400'}`}
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  );
}