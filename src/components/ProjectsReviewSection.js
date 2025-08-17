import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, X, UploadCloud, ArrowLeftCircle, FileText, Video, Image as ImageIcon } from 'lucide-react';

export default function ProjectsReviewSection({ user }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [newProjectData, setNewProjectData] = useState({ title: '', description: '', photos: [], videos: [], pdf: null });
  const [previews, setPreviews] = useState({ photos: [], videos: [], pdf: null });
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const departments = [
    'All Departments', 'School of Digital Humanities and Liberal Arts', 'School of Informatics', 
    'School of Electronic System and Automation', 'School of Computer Science and Engineering', 'School of Digital Sciences'
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/projects', { headers: { 'x-auth-token': token } });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Failed to fetch projects.');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Upload form logic (unchanged)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); setUploadError('');
    const currentPhotos = [...newProjectData.photos], currentVideos = [...newProjectData.videos]; let currentPdf = newProjectData.pdf;
    const photoPreviewsArr = [...previews.photos], videoPreviewsArr = [...previews.videos]; let pdfPreviewName = previews.pdf;
    for (const file of files) {
      if (file.size > 1073741824) { setUploadError(`File ${file.name} is too large (max 1GB).`); continue; }
      if (file.type.startsWith('image/')) { if (currentPhotos.length < 5) { currentPhotos.push(file); photoPreviewsArr.push(URL.createObjectURL(file)); } else setUploadError('Max 5 photos.'); }
      else if (file.type.startsWith('video/')) { if (currentVideos.length < 5) { currentVideos.push(file); videoPreviewsArr.push(URL.createObjectURL(file)); } else setUploadError('Max 5 videos.'); }
      else if (file.type === 'application/pdf') { if (!currentPdf) { currentPdf = file; pdfPreviewName = file.name; } else setUploadError('Only one PDF.'); }
    }
    setNewProjectData({ ...newProjectData, photos: currentPhotos, videos: currentVideos, pdf: currentPdf });
    setPreviews({ photos: photoPreviewsArr, videos: videoPreviewsArr, pdf: pdfPreviewName });
  };
  const handleInputChange = (e) => setNewProjectData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUploadProject = async (e) => {
    e.preventDefault(); setIsUploading(true); setUploadError('');
    const placeholderUrl = "https://example.com/file-url";
    const projectPayload = {
      title: newProjectData.title, description: newProjectData.description, department: user?.department,
      photos: newProjectData.photos.map(p => placeholderUrl), videos: newProjectData.videos.map(v => placeholderUrl),
      pdf: newProjectData.pdf ? placeholderUrl : '',
    };
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(projectPayload),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.msg || 'Failed to publish project.'); }
      const newProjectFromServer = await response.json();
      newProjectFromServer.user = { _id: user._id, fullName: user.fullName };
      setProjects([newProjectFromServer, ...projects]);
      resetUploadForm();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };
  const resetUploadForm = () => { setShowUploadModal(false); setNewProjectData({ title: '', description: '', photos: [], videos: [], pdf: null }); setPreviews({ photos: [], videos: [], pdf: null }); setUploadError(''); };
  
  // --- THIS IS THE UPGRADED REVIEW FUNCTION ---
  const handlePostReview = async (e, projectId) => {
    e.preventDefault();
    setReviewError('');
    if (!newReviewText.trim()) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/projects/review/${projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ text: newReviewText }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.msg || 'Failed to post review.');
        }
        const updatedProject = await response.json();
        // Find the project in state and replace it with the updated version
        setProjects(projects.map(p => p._id === projectId ? updatedProject : p));
        setNewReviewText('');
    } catch (err) {
        setReviewError(err.message);
    }
  };

  const filteredProjects = selectedDepartment === 'All Departments' ? projects : projects.filter(project => project.department === selectedDepartment);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-full font-sans">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold flex items-center"><MessageSquare className="mr-3 text-teal-400" />Projects & Reviews</h2>
        <button onClick={() => setShowUploadModal(true)} className="px-6 py-3 bg-teal-500 text-gray-900 rounded-full font-semibold text-lg shadow-lg hover:bg-teal-400">Upload Project</button>
      </header>

      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="department-filter" className="font-medium text-gray-300">Filter by Department:</label>
        <select id="department-filter" className="p-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
          {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
        </select>
      </div>

      {showUploadModal && ( /* Upload modal is unchanged */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-white">Upload a New Project</h3><button onClick={resetUploadForm} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={handleUploadProject} className="space-y-4">
              <input type="text" name="title" value={newProjectData.title} placeholder="Project Title" onChange={handleInputChange} className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg" required />
              <textarea name="description" value={newProjectData.description} placeholder="Project Description" onChange={handleInputChange} className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg" rows="3" required></textarea>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Department</label><p className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">{user?.department || 'N/A'}</p></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Upload Files</label><input type="file" multiple onChange={handleFileChange} accept="image/*,video/*,.pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600" />{uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}</div>
              <div className="grid grid-cols-3 gap-2 min-h-[5rem]">{previews.photos.map((src, i) => <img key={i} src={src} alt="preview" className="w-full h-20 object-cover rounded" />)}{previews.videos.map((src, i) => <video key={i} src={src} className="w-full h-20 object-cover rounded" />)}{previews.pdf && <div className="flex items-center justify-center bg-gray-700 rounded h-20 text-xs p-1 text-center"><FileText className="w-6 h-6 mr-1" />{previews.pdf}</div>}</div>
              <div className="flex items-center space-x-4 pt-2"><button type="button" onClick={resetUploadForm} className="w-full py-3 bg-gray-600 text-white rounded-full font-bold text-lg hover:bg-gray-500 flex items-center justify-center"><ArrowLeftCircle className="mr-2" />Cancel</button><button type="submit" className="w-full py-3 bg-teal-500 text-gray-900 rounded-full font-bold text-lg hover:bg-teal-400 flex items-center justify-center" disabled={isUploading}><UploadCloud className="mr-2" />{isUploading ? 'Submitting...' : 'Submit Project'}</button></div>
            </form>
          </div>
        </div>
      )}

      {viewingProject && ( /* View modal is unchanged */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold text-white">{viewingProject.title}</h3><button onClick={() => setViewingProject(null)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <p className="text-gray-300 mb-4">{viewingProject.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-700 p-4 rounded-lg"><h4 className="font-semibold mb-2 text-teal-400">Photos</h4><p className="text-gray-400 text-sm">Photo viewer will be implemented here.</p></div><div className="bg-gray-700 p-4 rounded-lg"><h4 className="font-semibold mb-2 text-teal-400">Videos</h4><p className="text-gray-400 text-sm">Video player will be implemented here.</p></div><div className="bg-gray-700 p-4 rounded-lg md:col-span-2"><h4 className="font-semibold mb-2 text-teal-400">PDF Document</h4><p className="text-gray-400 text-sm">PDF viewer will be implemented here.</p></div></div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading && <p className="text-center text-gray-400">Loading projects...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {!isLoading && !error && filteredProjects.length === 0 && (<div className="p-4 bg-gray-800 rounded-lg text-center text-gray-500 border border-gray-700"><p>No projects found for this department.</p></div>)}
        
        {!isLoading && !error && filteredProjects.map(project => (
          <div key={project._id} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white">{project.title}</h3>
            <p className="text-gray-400 text-sm mb-2">Creator: <span className="font-medium text-gray-300">{project.user?.fullName || '...'}</span> | Department: {project.department}</p>
            <p className="text-gray-300 mb-4">{project.description}</p>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => setViewingProject(project)} className="inline-block px-5 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500">View Project Details</button>
              {user._id !== project.user?._id && (
                <button onClick={() => setActiveReviewId(activeReviewId === project._id ? null : project._id)} className="flex items-center px-5 py-2 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600">
                  {/* The review count is now real */}
                  <span>Reviews ({project.reviews?.length || 0})</span>
                  {activeReviewId === project._id ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
                </button>
              )}
            </div>

            {activeReviewId === project._id && user._id !== project.user?._id && (
              <div className="mt-6 border-t border-gray-700 pt-4">
                {/* This now displays the real reviews */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                  {project.reviews && project.reviews.length > 0 ? (
                    project.reviews.map(review => (
                      <div key={review._id} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-white">{review.user?.fullName || 'User'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-gray-300 mt-1">{review.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center">No reviews yet.</p>
                  )}
                </div>
                {reviewError && <p className="text-red-400 text-sm text-center mb-2">{reviewError}</p>}
                <form onSubmit={(e) => handlePostReview(e, project._id)} className="flex items-center space-x-3">
                  <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Write a review..." className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-lg" rows="1"></textarea>
                  <button type="submit" className="p-3 bg-teal-500 text-gray-900 rounded-full hover:bg-teal-400 shadow-lg"><Send size={20} /></button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};