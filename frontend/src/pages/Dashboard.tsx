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
      console.error('Failed to fetch files:', error);
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
      console.error('Upload failed:', error);
      alert('Failed to upload file');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await api.get(`/api/files/${file.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const handleRename = async (file: FileItem) => {
    const newName = window.prompt('Enter new filename:', file.filename);
    if (newName && newName !== file.filename) {
      try {
        await api.put(`/api/files/${file.id}`, null, { params: { filename: newName } });
        fetchFiles();
      } catch (error) {
        console.error('Failed to rename file:', error);
        alert('Failed to rename file');
      }
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (window.confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      try {
        await api.delete(`/api/files/${file.id}`);
        setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file');
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ background: "var(--canvas)", minHeight: "100vh" }}>
      <header className="dashboard-header">
        <h1 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>HomeCloud</h1>
        <div className="user-info">
          <span>Logged in as: {email}</span>
          <button className="logout-button" onClick={handleLogout} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px", padding: "0.5rem 1rem" }}>Logout</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <h2 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>My Files</h2>
        
        {files.length === 0 ? (
          <p className="empty-state">No files uploaded yet. Upload your first file below!</p>
        ) : (
          <ul className="file-list">
            {files.map(file => (
              <li key={file.id} className="file-item" style={{ background: "var(--canvas-elevated)", border: "1px solid var(--hairline)", borderRadius: "12px", boxShadow: "none" }}>
                <div className="file-name-container">
                  <span className="file-name">{file.filename}</span>
                  <span className="file-meta">({formatSize(file.size)})</span>
                </div>
                <div className="file-actions">
                  <button onClick={() => handleDownload(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Download</button>
                  <button onClick={() => handleRename(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Rename</button>
                  <button onClick={() => handleDelete(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Delete</button>
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
          <button className="upload-button" onClick={handleUploadClick} style={{ background: "var(--ink)", color: "white", borderRadius: "6px", border: "none", padding: "0.75rem 1.5rem", fontWeight: 500 }}>Upload File</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
