# HomeCloud Frontend Integration Guide

This document describes the current implemented HomeCloud Spring Boot backend API contract for integration with the React/Vite frontend.

> **Important:** This guide describes the backend as it currently exists. Planned APIs from the HomeCloud research/design documents should not be treated as implemented endpoints.

---

# 1. Global Configuration

## 1.1 Base URL

The Spring Boot backend runs on port `8080`.

```text
http://localhost:8080
```

Health endpoint:

```http
GET http://localhost:8080/api/health
```

Expected response:

```text
HomeCloud Backend is running
```

For Vite, the frontend can use:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

# 2. CORS Configuration

The backend allows these frontend origins:

```text
http://localhost:3000
http://localhost:5173
```

The Vite frontend is therefore allowed:

```text
http://localhost:5173
```

Allowed methods:

```text
GET
POST
PUT
DELETE
OPTIONS
```

Allowed headers:

```text
*
```

Credentials:

```text
true
```

The effective configuration is:

```java
CorsConfiguration config = new CorsConfiguration();

config.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://localhost:5173"
));

config.setAllowedMethods(List.of(
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
));

config.setAllowedHeaders(List.of("*"));
config.setAllowCredentials(true);
```

The `Authorization` request header is therefore accepted.

The frontend should send:

```http
Authorization: Bearer <JWT>
```

### Response-header exposure

The current backend does not explicitly configure:

```java
config.setExposedHeaders(...)
```

If the React application needs to read the `Content-Disposition` response header for downloads, the backend should explicitly expose it:

```java
config.setExposedHeaders(List.of("Content-Disposition"));
```

That is not currently part of the backend configuration.

---

# 3. Authentication

The backend uses:

```text
JWT
+
Authorization: Bearer <token>
+
Spring Security
+
BCrypt password hashing
```

The JWT is returned in the login JSON response. It is not stored in an HTTP-only cookie.

The token contains the authenticated user's information and has a configured default expiration of approximately one hour.

---

# 4. Registration API

## Endpoint

```http
POST /api/auth/register
```

Full URL:

```text
http://localhost:8080/api/auth/register
```

## Request format

The current controller uses request parameters:

```java
@RequestParam String email
@RequestParam String password
```

Therefore the frontend should currently send:

```text
application/x-www-form-urlencoded
```

Do not send a JSON body for the current implementation.

### Request

```http
POST /api/auth/register
Content-Type: application/x-www-form-urlencoded
```

Body:

```text
email=mohit%40homecloud.com&password=Mohit%40123
```

Axios example:

```javascript
const params = new URLSearchParams();

params.append("email", email);
params.append("password", password);

const response = await axios.post(
    `${API_BASE_URL}/api/auth/register`,
    params
);
```

## Successful response

The user entity is returned without the password.

Example:

```json
{
  "id": 1,
  "email": "mohit@homecloud.com"
}
```

Status:

```text
200 OK
```

## Failed registration

If the email is already registered:

```json
{
  "error": "Email already registered"
}
```

Status:

```text
400 Bad Request
```

---

# 5. Login API

## Endpoint

```http
POST /api/auth/login
```

Full URL:

```text
http://localhost:8080/api/auth/login
```

## Request format

The current implementation also uses:

```text
application/x-www-form-urlencoded
```

Request:

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded
```

Body:

```text
email=mohit%40homecloud.com&password=Mohit%40123
```

Axios example:

```javascript
const params = new URLSearchParams();

params.append("email", email);
params.append("password", password);

const response = await axios.post(
    `${API_BASE_URL}/api/auth/login`,
    params
);
```

## Successful login response

The token is returned directly inside JSON:

```json
{
  "message": "Login successful",
  "userId": 1,
  "email": "mohit@homecloud.com",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

The important field is:

```json
{
  "token": "eyJ..."
}
```

The token is not returned through an HTTP-only cookie.

Example:

```javascript
const token = response.data.token;

localStorage.setItem("token", token);
```

The frontend can also store the user information:

```javascript
localStorage.setItem(
    "user",
    JSON.stringify({
        userId: response.data.userId,
        email: response.data.email
    })
);
```

## Failed login

The backend returns:

```json
{
  "error": "Invalid email or password"
}
```

Status:

```text
400 Bad Request
```

---

# 6. Protected Routes

The following endpoints are public:

```text
/api/health
/api/auth/register
/api/auth/login
```

Other endpoints require authentication.

The frontend must send:

```http
Authorization: Bearer <JWT>
```

Example:

```http
GET /api/files
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## Axios interceptor

A recommended frontend setup is:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
```

This automatically adds the JWT to protected requests.

---

# 7. JWT Failure

If the JWT is invalid or expired, the backend returns:

```text
401 Unauthorized
```

with an error such as:

```json
{
  "error": "Invalid or expired JWT token"
}
```

The frontend should generally clear the stored token and redirect the user to the login page:

```javascript
if (error.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
}
```

---

# 8. File Management API

The current implemented file API is:

```text
/api/files
```

The current MVP supports:

```text
UPLOAD
LIST
DOWNLOAD
RENAME
DELETE
```

---

# 9. Upload File

## Endpoint

```http
POST /api/files/upload
```

Full URL:

```text
http://localhost:8080/api/files/upload
```

Authentication:

```http
Authorization: Bearer <JWT>
```

## Request format

The endpoint expects:

```text
multipart/form-data
```

The exact form-data field is:

```text
file
```

Form-data:

| Key | Type | Required |
|---|---|---|
| `file` | File | Yes |

There is no `userId` parameter in the current implementation. The authenticated user is determined from the JWT.

### Postman

Select:

```text
Body → form-data
```

Then:

```text
file    File    test.txt
```

### Axios

```javascript
const formData = new FormData();

formData.append("file", selectedFile);

const response = await api.post(
    "/api/files/upload",
    formData
);
```

Do not manually set the multipart `Content-Type` when using browser `FormData`; the browser/Axios needs to generate the multipart boundary.

## Successful response

Example:

```json
{
  "filename": "text.txt",
  "storedFilename": "231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
  "storagePath": "C:\\Users\\Mohit\\Downloads\\HomeCloud_23_9_FileManagement_Completed\\HomeCloudStorage\\231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
  "size": 52,
  "contentType": "text/plain",
  "createdAt": "2026-09-28T19:37:07.89631",
  "id": 1,
  "updatedAt": "2026-09-28T19:37:07.89631"
}
```

Status:

```text
200 OK
```

---

# 10. List Files

## Endpoint

```http
GET /api/files
```

Full URL:

```text
http://localhost:8080/api/files
```

Authentication:

```http
Authorization: Bearer <JWT>
```

## Response

The backend returns files belonging to the authenticated user.

Example:

```json
[
  {
    "filename": "text.txt",
    "storedFilename": "231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
    "storagePath": "C:\\Users\\Mohit\\...\\HomeCloudStorage\\231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
    "size": 52,
    "contentType": "text/plain",
    "createdAt": "2026-09-28T19:37:07.89631",
    "id": 1,
    "updatedAt": "2026-09-28T19:37:07.89631"
  }
]
```

If there are no files:

```json
[]
```

Status:

```text
200 OK
```

The list is ordered newest-first by creation time.

---

# 11. Download File

## Endpoint

```http
GET /api/files/{fileId}/download
```

Example:

```text
GET http://localhost:8080/api/files/1/download
```

Authentication:

```http
Authorization: Bearer <JWT>
```

## Response

The download endpoint returns the actual binary file rather than JSON.

For example, a text file may return:

```text
Hello HomeCloud!
This is my first file upload test.
```

Typical response headers include:

```http
Content-Type: text/plain
Content-Disposition: attachment; filename="text.txt"
Content-Length: 52
```

## Axios

Use `responseType: "blob"`:

```javascript
const response = await api.get(
    `/api/files/${fileId}/download`,
    {
        responseType: "blob"
    }
);
```

Example browser download:

```javascript
const url = window.URL.createObjectURL(response.data);

const link = document.createElement("a");
link.href = url;
link.download = file.filename;
link.click();

window.URL.revokeObjectURL(url);
```

## Errors

If the file does not belong to the authenticated user or cannot be found:

```json
{
  "error": "File not found"
}
```

Status:

```text
404 Not Found
```

If the database record exists but the physical file is missing:

```json
{
  "error": "Physical file not found"
}
```

Status:

```text
404 Not Found
```

---

# 12. Rename File

## Endpoint

```http
PUT /api/files/{fileId}
```

Example:

```text
PUT http://localhost:8080/api/files/1
```

Authentication:

```http
Authorization: Bearer <JWT>
```

## Current request format

The current backend does not expect:

```json
{
  "newName": "doc.pdf"
}
```

Instead, it expects a request parameter named:

```text
filename
```

Use:

```text
application/x-www-form-urlencoded
```

Body:

```text
filename=document.pdf
```

Axios:

```javascript
const params = new URLSearchParams();

params.append("filename", "document.pdf");

const response = await api.put(
    `/api/files/${fileId}`,
    params
);
```

## Response

The updated `File` object is returned:

```json
{
  "filename": "document.pdf",
  "storedFilename": "231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
  "storagePath": "C:\\Users\\Mohit\\...\\HomeCloudStorage\\231d2c91-05f8-45c4-874d-46f862a5f8fc_text.txt",
  "size": 52,
  "contentType": "text/plain",
  "createdAt": "2026-09-28T19:37:07.89631",
  "id": 1,
  "updatedAt": "2026-09-28T19:45:00.00000"
}
```

### Important behavior

The current implementation changes the logical/display filename but does not necessarily rename the physical stored file.

For example:

```text
filename:
document.pdf

storedFilename:
UUID_text.txt
```

can coexist after a rename.

Empty filename:

```json
{
  "error": "File name cannot be empty"
}
```

Status:

```text
400 Bad Request
```

---

# 13. Delete File

## Endpoint

```http
DELETE /api/files/{fileId}
```

Example:

```text
DELETE http://localhost:8080/api/files/1
```

Authentication:

```http
Authorization: Bearer <JWT>
```

No request body is required.

## Successful response

```json
{
  "message": "File deleted successfully"
}
```

Status:

```text
200 OK
```

The operation deletes both:

1. The physical file.
2. The database metadata record.

## Error

Example:

```json
{
  "error": "File not found"
}
```

The current delete controller can return:

```text
400 Bad Request
```

for caught operation errors.

---

# 14. Complete API Contract

| Operation | Method | Endpoint | Auth | Request |
|---|---|---|---|---|
| Health | GET | `/api/health` | No | None |
| Register | POST | `/api/auth/register` | No | Form URL encoded |
| Login | POST | `/api/auth/login` | No | Form URL encoded |
| Upload | POST | `/api/files/upload` | Yes | `multipart/form-data` |
| List | GET | `/api/files` | Yes | None |
| Download | GET | `/api/files/{id}/download` | Yes | None |
| Rename | PUT | `/api/files/{id}` | Yes | Form URL encoded |
| Delete | DELETE | `/api/files/{id}` | Yes | None |

---

# 15. Recommended Frontend API Client

Create:

```text
src/api/api.js
```

Example:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ||
             "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
```

Then the frontend can use:

## Register

```javascript
const params = new URLSearchParams();

params.append("email", email);
params.append("password", password);

const response = await api.post(
    "/api/auth/register",
    params
);
```

## Login

```javascript
const params = new URLSearchParams();

params.append("email", email);
params.append("password", password);

const response = await api.post(
    "/api/auth/login",
    params
);

localStorage.setItem("token", response.data.token);
```

## List

```javascript
const response = await api.get("/api/files");

const files = response.data;
```

## Upload

```javascript
const formData = new FormData();

formData.append("file", selectedFile);

const response = await api.post(
    "/api/files/upload",
    formData
);
```

## Download

```javascript
const response = await api.get(
    `/api/files/${fileId}/download`,
    {
        responseType: "blob"
    }
);
```

## Rename

```javascript
const params = new URLSearchParams();

params.append("filename", newFilename);

const response = await api.put(
    `/api/files/${fileId}`,
    params
);
```

## Delete

```javascript
const response = await api.delete(
    `/api/files/${fileId}`
);
```

---

# 16. Error Handling

## 400 Bad Request

Typical format:

```json
{
  "error": "..."
}
```

Usually indicates invalid input or an operation-specific failure.

## 401 Unauthorized

```json
{
  "error": "Invalid or expired JWT token"
}
```

Frontend action:

```text
Clear JWT → redirect to Login
```

## 404 Not Found

Example:

```json
{
  "error": "File not found"
}
```

## 500 Internal Server Error

Potential generic response:

```json
{
  "error": "Internal server error"
}
```

---

# 17. Important Frontend Notes

### Do not send JSON for registration/login

Current implementation uses:

```text
application/x-www-form-urlencoded
```

not:

```json
{
  "email": "...",
  "password": "..."
}
```

### Do not send `userId` during upload

The current backend obtains the user from the authenticated JWT.

Upload only requires:

```text
file
```

### Do not use `newName` for rename

Current parameter:

```text
filename
```

not:

```text
newName
```

### Download is not JSON

Download returns:

```text
binary/blob
```

### Rename behavior

The current rename implementation changes the logical/display filename. The physical stored filename is not necessarily changed.

---

# 18. Current MVP Scope

The current implemented MVP is:

```text
Authentication
├── Register
└── Login

File Management
├── Upload
├── List
├── Download
├── Rename
└── Delete
```

Additional synchronization, folders, versioning, and related features described in the broader HomeCloud design should not be treated as current frontend endpoints unless they are implemented separately.

---

# 19. Quick Reference for Frontend Developer

```text
BASE URL
http://localhost:8080

PUBLIC
GET  /api/health
POST /api/auth/register
POST /api/auth/login

PROTECTED
POST   /api/files/upload
GET    /api/files
GET    /api/files/{id}/download
PUT    /api/files/{id}
DELETE /api/files/{id}

AUTH HEADER
Authorization: Bearer <JWT>

UPLOAD
Content-Type: multipart/form-data
field: file

RENAME
Content-Type: application/x-www-form-urlencoded
field: filename
```

This is the API contract to use when integrating the current Spring Boot backend with the React/Vite frontend.
