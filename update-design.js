const fs = require('fs');
const path = require('path');

const frontendDir = path.join('C:', 'Home Cloud CLI', 'frontend');

// 1. Update index.html
const indexHtmlPath = path.join(frontendDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const fontLink = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
`;
if (!indexHtml.includes('fonts.googleapis.com')) {
  indexHtml = indexHtml.replace('</head>', `${fontLink}  </head>`);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
}

// 2. Overwrite App.css
const appCssPath = path.join(frontendDir, 'src', 'App.css');
const appCssContent = `
:root {
  --canvas: #fafafa;
  --ink: #171717;
  --canvas-elevated: #ffffff;
  --hairline: #ebebeb;
  --link: #0070f3;
  --body: #4d4d4d;
}

body {
  margin: 0;
  font-family: 'Geist', sans-serif;
  background-color: var(--canvas);
  color: var(--body);
}

.app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 50px;
}

.page-container {
  background: var(--canvas-elevated);
  padding: 2rem;
  border: 1px solid var(--hairline);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.form-container input {
  padding: 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 6px;
  background: var(--canvas-elevated);
  color: var(--ink);
}

.form-container input::placeholder {
  color: var(--body);
}

.dashboard-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--body);
}

.file-name-container {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.file-meta {
  color: var(--body);
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  color: var(--body);
  margin: 2rem 0;
}

.dashboard-main {
  padding: 1rem 2rem;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.file-name {
  font-weight: 500;
  color: var(--ink);
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

a {
  color: var(--link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;
fs.writeFileSync(appCssPath, appCssContent, 'utf8');

// Also update index.css to avoid conflicts
const indexCssPath = path.join(frontendDir, 'src', 'index.css');
fs.writeFileSync(indexCssPath, appCssContent, 'utf8');

// 3. Update Dashboard.tsx
const dashboardPath = path.join(frontendDir, 'src', 'pages', 'Dashboard.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

dashboardContent = dashboardContent
  .replace(/<div className="dashboard-container">/, '<div className="dashboard-container" style={{ background: "var(--canvas)", minHeight: "100vh" }}>')
  .replace(/<h1>/, '<h1 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>')
  .replace(/<h2>/, '<h2 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>')
  .replace(/<li key=\{file\.id\} className="file-item">/g, '<li key={file.id} className="file-item" style={{ background: "var(--canvas-elevated)", border: "1px solid var(--hairline)", borderRadius: "12px", boxShadow: "none" }}>')
  .replace(/<button onClick=\{\(\) => handleDownload\(file\)\}>Download<\/button>/g, '<button onClick={() => handleDownload(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Download</button>')
  .replace(/<button onClick=\{\(\) => handleRename\(file\)\}>Rename<\/button>/g, '<button onClick={() => handleRename(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Rename</button>')
  .replace(/<button onClick=\{\(\) => handleDelete\(file\)\}>Delete<\/button>/g, '<button onClick={() => handleDelete(file)} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px" }}>Delete</button>')
  .replace(/<button className="logout-button" onClick=\{handleLogout\}>Logout<\/button>/, '<button className="logout-button" onClick={handleLogout} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: "6px", padding: "0.5rem 1rem" }}>Logout</button>')
  .replace(/<button className="upload-button" onClick=\{handleUploadClick\}>Upload File<\/button>/, '<button className="upload-button" onClick={handleUploadClick} style={{ background: "var(--ink)", color: "white", borderRadius: "6px", border: "none", padding: "0.75rem 1.5rem", fontWeight: 500 }}>Upload File</button>');

fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');

// 4. Update Login.tsx
const loginPath = path.join(frontendDir, 'src', 'pages', 'Login.tsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');
loginContent = loginContent
  .replace(/<h2>/, '<h2 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>')
  .replace(/<button type="submit">/, '<button type="submit" style={{ background: "var(--ink)", color: "white", borderRadius: "6px", border: "none", padding: "0.75rem", fontWeight: 500 }}>');
fs.writeFileSync(loginPath, loginContent, 'utf8');

// 5. Update Register.tsx
const registerPath = path.join(frontendDir, 'src', 'pages', 'Register.tsx');
let registerContent = fs.readFileSync(registerPath, 'utf8');
registerContent = registerContent
  .replace(/<h2>/, '<h2 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>')
  .replace(/<button type="submit">/, '<button type="submit" style={{ background: "var(--ink)", color: "white", borderRadius: "6px", border: "none", padding: "0.75rem", fontWeight: 500 }}>');
fs.writeFileSync(registerPath, registerContent, 'utf8');

console.log('Files updated successfully.');
