import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeftCircle } from 'lucide-react';

// The component now accepts a 'user' prop to get the department
export default function NotesSection({ user }) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [noteData, setNoteData] = useState({
    title: '',
    file: null,
  });
  const [notes, setNotes] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const departments = [
    'All Departments',
    'School of Digital Humanities and Liberal Arts',
    'School of Informatics',
    'School of Electronic System and Automation',
    'School of Computer Science and Engineering',
    'School of Digital Sciences',
  ];

  // --- Fetch notes from the backend when the component loads ---
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token'); // Get the token from storage
        const response = await fetch('http://localhost:5000/api/notes', {
          headers: {
            'x-auth-token': token, // Send the token for authorization
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes.');
        }
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []); // The empty dependency array means this runs once on mount

  const handleUploadClick = () => {
    setShowUploadForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNoteData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  // --- Handle submitting a new note to the backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      // In a real app, you would first upload the file to a service (like AWS S3)
      // and get a URL. For this demo, we'll use a placeholder URL.
      const fileUrl = 'https://example.com/path/to/your/uploaded/file.pdf';

      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          title: noteData.title,
          department: user.department,
          fileUrl: fileUrl, // Use the URL from your file storage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish note.');
      }

      const newNoteFromServer = await response.json();
      setNotes([newNoteFromServer, ...notes]); // Add the new note to the list
      setShowUploadForm(false);
      setNoteData({ title: '', file: null });

    } catch (err) {
      setError(err.message);
    }
  };

  // Filter notes based on the selected department
  const filteredNotes = selectedDepartment === 'All Departments' 
    ? notes 
    : notes.filter(note => note.department === selectedDepartment);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-400">📝 Notes</h2>
        {!showUploadForm && (
            <button
              onClick={handleUploadClick}
              className="bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-2 px-4 rounded-lg shadow-md"
            >
              <Upload className="h-5 w-5 mr-2 inline" />
              Upload Note
            </button>
        )}
      </div>
      
      {showUploadForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Upload New Note</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Note Title</label>
              <input type="text" id="title" name="title" value={noteData.title} onChange={handleInputChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
              <p className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">{user.department}</p>
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-1">Choose File</label>
              <input type="file" id="file" name="file" onChange={handleInputChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600" required />
            </div>
            <div className="flex items-center space-x-4 pt-2">
                <button type="button" onClick={() => setShowUploadForm(false)} className="w-full py-3 bg-gray-600 text-white rounded-full font-bold text-lg hover:bg-gray-500">
                  <ArrowLeftCircle className="mr-2 h-5 w-5 inline" />
                  Cancel
                </button>
                <button type="submit" className="w-full py-3 bg-teal-500 text-gray-900 rounded-full font-bold text-lg hover:bg-teal-400">
                  Publish Note
                </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="mb-4 flex items-center space-x-4">
        <label htmlFor="department-filter" className="font-medium text-gray-300">Filter by Department:</label>
        <select id="department-filter" className="p-2 bg-gray-700 border border-gray-600 rounded-md" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
          {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
        </select>
      </div>
      
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p>Loading notes...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : filteredNotes.length === 0 ? (
          <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-500 border border-gray-700">
            <p>No notes found. Upload one to get started!</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note._id} className="p-4 border border-gray-700 rounded-lg bg-gray-800">
              <h3 className="font-semibold text-lg text-teal-400">{note.title}</h3>
              <p className="text-sm text-gray-400 mt-1">Department: {note.department}</p>
              <div className="mt-3">
                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm">
                  View Note File
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
