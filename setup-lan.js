const os = require('os');
const fs = require('fs');
const path = require('path');

// Step 1: Detect Local IP
let localIp = '127.0.0.1';
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            localIp = iface.address;
            break;
        }
    }
    if (localIp !== '127.0.0.1') break;
}

console.log(`[START] Detected LAN IP: ${localIp}`);

const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendApiTsPath = path.join(__dirname, 'frontend', 'src', 'api', 'api.ts');
const backendPropsPath = path.join(__dirname, 'backend', 'src', 'main', 'resources', 'application.properties');
const backendJavaPath = path.join(__dirname, 'backend', 'src', 'main', 'java');

// Step 2: Frontend Configuration
try {
    fs.mkdirSync(path.dirname(frontendEnvPath), { recursive: true });
    fs.writeFileSync(frontendEnvPath, `VITE_API_BASE_URL=http://${localIp}:8080\n`);
    console.log(`- Created/Updated: ${frontendEnvPath}`);
} catch (e) {
    console.error(`- Error writing ${frontendEnvPath}: ${e.message}`);
}

try {
    if (fs.existsSync(frontendApiTsPath)) {
        let apiTs = fs.readFileSync(frontendApiTsPath, 'utf8');
        apiTs = apiTs.replace(/baseURL:\s*['"`]http:\/\/localhost:8080['"`]/, 'baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"');
        fs.writeFileSync(frontendApiTsPath, apiTs);
        console.log(`- Updated: ${frontendApiTsPath}`);
    } else {
        console.log(`- File not found: ${frontendApiTsPath}`);
    }
} catch (e) {
    console.error(`- Error updating ${frontendApiTsPath}: ${e.message}`);
}

// Step 3: Backend Configuration
try {
    if (fs.existsSync(backendPropsPath)) {
        let props = fs.readFileSync(backendPropsPath, 'utf8');
        if (!props.includes('server.address=')) {
            props = props.replace(/\n*$/, '') + `\nserver.address=0.0.0.0`;
        }
        if (!props.includes('server.port=')) {
            props = props.replace(/\n*$/, '') + `\nserver.port=8080`;
        }
        if (!props.endsWith('\n')) {
            props += '\n';
        }
        fs.writeFileSync(backendPropsPath, props);
        console.log(`- Updated: ${backendPropsPath}`);
    } else {
        console.log(`- File not found: ${backendPropsPath}`);
    }
} catch (e) {
    console.error(`- Error updating ${backendPropsPath}: ${e.message}`);
}

function findSecurityConfig(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const found = findSecurityConfig(fullPath);
            if (found) return found;
        } else if (file === 'SecurityConfig.java') {
            return fullPath;
        }
    }
    return null;
}

try {
    if (fs.existsSync(backendJavaPath)) {
        const secConfigPath = findSecurityConfig(backendJavaPath);
        if (secConfigPath) {
            let secConfig = fs.readFileSync(secConfigPath, 'utf8');
            if (!secConfig.includes(`http://${localIp}:5173`)) {
                // Find "http://localhost:5173" and append the LAN IP next to it
                secConfig = secConfig.replace(/"http:\/\/localhost:5173"/, `"http://localhost:5173", "http://${localIp}:5173"`);
                fs.writeFileSync(secConfigPath, secConfig);
                console.log(`- Updated: ${secConfigPath}`);
            } else {
                console.log(`- No changes needed (already contains LAN IP): ${secConfigPath}`);
            }
        } else {
            console.log(`- SecurityConfig.java not found in ${backendJavaPath}`);
        }
    } else {
        console.log(`- Backend java path not found: ${backendJavaPath}`);
    }
} catch (e) {
    console.error(`- Error updating SecurityConfig.java: ${e.message}`);
}

console.log(`[DONE] Configuration complete.`);
