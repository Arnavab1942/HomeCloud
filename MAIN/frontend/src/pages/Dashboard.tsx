import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

interface FileItem {
  id: number;
  filename: string;
  size: number;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Dashboard = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email') || localStorage.getItem('user') || 'User';
    setEmail(storedEmail);
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/api/files');
      setFiles(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/files/upload', formData);
      fetchFiles();
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        console.error('Upload failed');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>HomeCloud</h1>
        <div className="user-info">
          <span>Logged in as: {email}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <h2>My Files</h2>
        
        {files.length === 0 ? (
          <p className="empty-state">No files uploaded yet. Upload your first file below!</p>
        ) : (
          <ul className="file-list">
            {files.map(file => (
              <li key={file.id} className="file-item">
                <div className="file-name-container">
                  <span className="file-name">{file.filename}</span>
                  <span className="file-meta">({formatSize(file.size)})</span>
                </div>
                <div className="file-actions">
                  <button>Download</button>
                  <button>Rename</button>
                  <button>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="upload-section">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button className="upload-button" onClick={handleUploadClick}>Upload File</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
