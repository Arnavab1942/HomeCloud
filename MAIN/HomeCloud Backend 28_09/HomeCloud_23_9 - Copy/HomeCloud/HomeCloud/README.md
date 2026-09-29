# HomeCloud Backend

HomeCloud backend using Java 21, Spring Boot 4.1.1, PostgreSQL 17, Spring Data JPA and JWT authentication.

## Current file-management features

- User registration and login
- JWT authentication
- Upload a file to local `HomeCloudStorage`
- List files belonging to the logged-in user
- Download a file
- Rename a file
- Delete a file
- File metadata stored in PostgreSQL
- Each file is linked to its owner
- Users cannot access another user's files through the file-management endpoints

## Project structure

```text
HomeCloud/
└── backend/
    ├── src/main/java/com/homecloud/backend/
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/
    │   ├── repository/
    │   ├── security/
    │   └── service/
    ├── src/main/resources/application.properties
    └── HomeCloudStorage/       # created automatically when the app runs
```

## Run

1. Make sure PostgreSQL is running and the database `homecloud` exists.
2. In `application.properties`, set the PostgreSQL password to the password of the `homecloud` role.
3. Open the `backend` folder in IntelliJ IDEA.
4. Run `HomecloudBackendApplication`.
5. The server runs on `http://localhost:8080`.

## Authentication flow

### Register

`POST /api/auth/register`

Form parameters:

```text
email=your@email.com
password=yourPassword
```

### Login

`POST /api/auth/login`

Form parameters:

```text
email=your@email.com
password=yourPassword
```

The response contains a JWT token. Copy the token and send it on protected requests as:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

## File API

All file endpoints require a valid JWT token.

### 1. Upload

`POST /api/files/upload`

Body: `multipart/form-data`

```text
file = <select a file>
```

Do not send `userId`; the backend gets the user from the JWT.

### 2. List files

`GET /api/files`

Returns only files owned by the authenticated user.

### 3. Download

`GET /api/files/{fileId}/download`

Downloads the requested file if it belongs to the authenticated user.

### 4. Rename

`PUT /api/files/{fileId}?filename=new-name.txt`

### 5. Delete

`DELETE /api/files/{fileId}`

The database metadata and the physical file are both removed.

## Storage

Uploaded files are stored in:

```text
backend/HomeCloudStorage/
```

The folder is created automatically. PostgreSQL stores the file metadata, while the actual file bytes remain on disk.
