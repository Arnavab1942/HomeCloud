const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Home Cloud CLI', 'frontend', 'src', 'pages', 'Dashboard.tsx');

const content = "import React, { useState, useEffect, useRef } from 'react';\n" +
"import { useNavigate } from 'react-router-dom';\n" +
"import api from '../api/api';\n" +
"\n" +
"interface FileItem {\n" +
"  id: number;\n" +
"  filename: string;\n" +
"  size: number;\n" +
"}\n" +
"\n" +
"const formatSize = (bytes: number) => {\n" +
"  if (bytes === 0) return '0 B';\n" +
"  const k = 1024;\n" +
"  const sizes = ['B', 'KB', 'MB', 'GB'];\n" +
"  const i = Math.floor(Math.log(bytes) / Math.log(k));\n" +
"  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];\n" +
"};\n" +
"\n" +
"const Dashboard = () => {\n" +
"  const [files, setFiles] = useState<FileItem[]>([]);\n" +
"  const [email, setEmail] = useState<string>('');\n" +
"  const navigate = useNavigate();\n" +
"  const fileInputRef = useRef<HTMLInputElement>(null);\n" +
"\n" +
"  useEffect(() => {\n" +
"    const storedEmail = localStorage.getItem('email') || localStorage.getItem('user') || 'User';\n" +
"    setEmail(storedEmail);\n" +
"    fetchFiles();\n" +
"  }, []);\n" +
"\n" +
"  const fetchFiles = async () => {\n" +
"    try {\n" +
"      const response = await api.get('/api/files');\n" +
"      setFiles(response.data || []);\n" +
"    } catch (error: any) {\n" +
"      console.error('Failed to fetch files:', error);\n" +
"      if (error.response?.status === 401) {\n" +
"        handleLogout();\n" +
"      }\n" +
"    }\n" +
"  };\n" +
"\n" +
"  const handleLogout = () => {\n" +
"    localStorage.removeItem('token');\n" +
"    localStorage.removeItem('user');\n" +
"    localStorage.removeItem('email');\n" +
"    navigate('/login');\n" +
"  };\n" +
"\n" +
"  const handleUploadClick = () => {\n" +
"    fileInputRef.current?.click();\n" +
"  };\n" +
"\n" +
"  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {\n" +
"    const file = e.target.files?.[0];\n" +
"    if (!file) return;\n" +
"\n" +
"    const formData = new FormData();\n" +
"    formData.append('file', file);\n" +
"\n" +
"    try {\n" +
"      await api.post('/api/files/upload', formData);\n" +
"      fetchFiles();\n" +
"    } catch (error: any) {\n" +
"      console.error('Upload failed:', error);\n" +
"      alert('Failed to upload file');\n" +
"      if (error.response?.status === 401) {\n" +
"        handleLogout();\n" +
"      }\n" +
"    } finally {\n" +
"      if (fileInputRef.current) {\n" +
"        fileInputRef.current.value = '';\n" +
"      }\n" +
"    }\n" +
"  };\n" +
"\n" +
"  const handleDownload = async (file: FileItem) => {\n" +
"    try {\n" +
"      const response = await api.get(`/api/files/${file.id}/download`, { responseType: 'blob' });\n" +
"      const url = window.URL.createObjectURL(response.data);\n" +
"      const a = document.createElement('a');\n" +
"      a.href = url;\n" +
"      a.download = file.filename;\n" +
"      document.body.appendChild(a);\n" +
"      a.click();\n" +
"      document.body.removeChild(a);\n" +
"      window.URL.revokeObjectURL(url);\n" +
"    } catch (error) {\n" +
"      console.error('Failed to download file:', error);\n" +
"      alert('Failed to download file');\n" +
"    }\n" +
"  };\n" +
"\n" +
"  const handleRename = async (file: FileItem) => {\n" +
"    const newName = window.prompt('Enter new filename:', file.filename);\n" +
"    if (newName && newName !== file.filename) {\n" +
"      try {\n" +
"        await api.put(`/api/files/${file.id}`, null, { params: { filename: newName } });\n" +
"        fetchFiles();\n" +
"      } catch (error) {\n" +
"        console.error('Failed to rename file:', error);\n" +
"        alert('Failed to rename file');\n" +
"      }\n" +
"    }\n" +
"  };\n" +
"\n" +
"  const handleDelete = async (file: FileItem) => {\n" +
"    if (window.confirm(`Are you sure you want to delete \"${file.filename}\"?`)) {\n" +
"      try {\n" +
"        await api.delete(`/api/files/${file.id}`);\n" +
"        setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));\n" +
"      } catch (error) {\n" +
"        console.error('Failed to delete file:', error);\n" +
"        alert('Failed to delete file');\n" +
"      }\n" +
"    }\n" +
"  };\n" +
"\n" +
"  return (\n" +
"    <div className=\"dashboard-container\">\n" +
"      <header className=\"dashboard-header\">\n" +
"        <h1>HomeCloud</h1>\n" +
"        <div className=\"user-info\">\n" +
"          <span>Logged in as: {email}</span>\n" +
"          <button className=\"logout-button\" onClick={handleLogout}>Logout</button>\n" +
"        </div>\n" +
"      </header>\n" +
"      \n" +
"      <main className=\"dashboard-main\">\n" +
"        <h2>My Files</h2>\n" +
"        \n" +
"        {files.length === 0 ? (\n" +
"          <p className=\"empty-state\">No files uploaded yet. Upload your first file below!</p>\n" +
"        ) : (\n" +
"          <ul className=\"file-list\">\n" +
"            {files.map(file => (\n" +
"              <li key={file.id} className=\"file-item\">\n" +
"                <div className=\"file-name-container\">\n" +
"                  <span className=\"file-name\">{file.filename}</span>\n" +
"                  <span className=\"file-meta\">({formatSize(file.size)})</span>\n" +
"                </div>\n" +
"                <div className=\"file-actions\">\n" +
"                  <button onClick={() => handleDownload(file)}>Download</button>\n" +
"                  <button onClick={() => handleRename(file)}>Rename</button>\n" +
"                  <button onClick={() => handleDelete(file)}>Delete</button>\n" +
"                </div>\n" +
"              </li>\n" +
"            ))}\n" +
"          </ul>\n" +
"        )}\n" +
"\n" +
"        <div className=\"upload-section\">\n" +
"          <input \n" +
"            type=\"file\" \n" +
"            ref={fileInputRef} \n" +
"            onChange={handleFileChange} \n" +
"            style={{ display: 'none' }} \n" +
"          />\n" +
"          <button className=\"upload-button\" onClick={handleUploadClick}>Upload File</button>\n" +
"        </div>\n" +
"      </main>\n" +
"    </div>\n" +
"  );\n" +
"};\n" +
"\n" +
"export default Dashboard;\n";

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard.tsx updated successfully.');
