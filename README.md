

# CodeMeet - Real-Time Collaborative Coding & Video Meeting Platform

CodeMeet is a modern web application built on the MERN stack, designed to provide seamless virtual collaboration through real-time video meetings and collaborative coding environments. It integrates video conferencing, live chat, and a shared online compiler into a single platform.

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Authentication**: Secure login/logout system.
- **Room Management**: Create or join virtual rooms for collaboration.
- **Video Sharing**: Real-time video sharing for team communication.
- **Live Chat**: Instant messaging for text communication within rooms.
- **Participant Management**: Displays the list of participants in a room.
- **Shared Compiler**: Real-time code editing and execution in a collaborative coding environment.

---

## Technologies

- **Frontend**: 
  - React.js
  - React Router DOM
  - Vite (Build tool)
  - UUID (For unique identifiers)
  
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (Database)
  - JWT (Authentication)
  - Socket.IO (Real-time communication)
  - Bcrypt.js (Password hashing)

---

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js**: [Install Node.js](https://nodejs.org/)
- **MongoDB**: [Install MongoDB](https://www.mongodb.com/try/download/community)

### Backend Setup

1. Clone the repository:
   ```

2. Navigate to the backend directory:

   ```bash
   cd codesync/server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file to store your environment variables:

   ```bash
   touch .env
   ```

   Add the following variables to the `.env` file:

   ```
   PORT = 5000
   CORS_ORIGIN = http://localhost:5173
   MONGODB_URI=<your-mongodb-connection-string>


   ACCESS_TOKEN_SECRET = access-token-key
   ACCESS_TOKEN_EXPIRY = 1d
   REFRESH_TOKEN_SECRET = refresh-token-key
   REFRESH_TOKEN_EXPIRY = 10d
   ```

5. Start the backend server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file to store your environment variables:
    ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend server:

   ```bash
   npm run dev
   ```

Your application should now be running locally at `http://localhost:5173` 
(by default you can change that but you also have to change that in you server .env).

---

## Usage

- **Create an Account**: Use the login or signup page to create a new user account.
- **Join a Room**: After logging in, you can either join an existing room or create a new room.
- **Collaborate**: Use the shared compiler to write and run code together in real-time while communicating through video and chat.

---

## API Endpoints

### Authentication

- `POST /user/register`: Registers a new user.
- `POST /user/login`: Logs in a user and returns a JWT token.
- `POST /user/logout`: Logs out a user and invalidates the JWT token.

---

## Testing

- **Frontend Testing**: For local testing, you can use the browser to test the UI behavior and user interactions.
  - Tools: React Testing Library
  - Approach: Test interactions between components and UI behavior.
  
- **Backend Testing**: Test API endpoints using Postman to ensure they work correctly.
  - Tools: Postman
  - Approach: Verify API responses, status codes, and data integrity.

---

## Deployment

- **Backend**: Deploy on platforms like Heroku, AWS, or DigitalOcean.
- **Frontend**: Host the frontend on services like Netlify or Vercel.
- **Database**: Use MongoDB Atlas for a managed database solution.

---

## Future Enhancements

- **Code Splitting**: Implement lazy loading to improve performance.
- **State Management**: Introduce more efficient state management using Redux or Context API.
- **Scalability**: Implement horizontal scaling on cloud platforms and optimize the backend for high traffic.
- **API Rate Limiting**: Prevent server overload by rate-limiting API requests.

---



