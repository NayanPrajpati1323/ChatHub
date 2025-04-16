# ChatHub - Real-time Chat Application

A full-stack real-time chat application built with MERN stack and Socket.io.

## Features

- Real-time messaging using Socket.io
- User authentication and authorization
- Image sharing in messages
- User presence (online/offline status)
- Typing indicators
- Profile picture upload using Cloudinary
- Dark/Light mode theme switching
- Mobile responsive design

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- DaisyUI
- Zustand (State Management)
- Socket.io Client
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Cloudinary (Image Storage)

## Installation and Setup

### Prerequisites
- Node.js (v16+)
- MongoDB database
- Cloudinary account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=your_frontend_url_for_cors
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_BASE_URL=your_backend_api_url
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment (Using Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
4. Add all your environment variables
5. Deploy the service

### Frontend Deployment (Using Vercel or Netlify)

1. Connect your GitHub repository
2. Set the build command to `npm run build`
3. Set the output directory to `dist`
4. Add your environment variables
5. Deploy the site

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check if user is authenticated
- `PUT /api/auth/update-profile` - Update user profile

### Message Endpoints

- `GET /api/messages/:userId` - Get messages with a specific user
- `POST /api/messages/send/:receiverId` - Send a message to a user

## License

This project is licensed under the MIT License. 