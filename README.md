# Medical Pager Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time communication features.

## Features

- Real-time messaging with Socket.io
- User authentication with JWT
- Real-time typing indicators
- Image sharing in chat
- Profile picture upload with Cloudinary
- Online/offline user status
- Theme customization
- Responsive UI design

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Zustand for state management
- Socket.io client for real-time communication
- Tailwind CSS & DaisyUI for styling
- Vite as the build tool

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time features
- Cloudinary for image storage

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB database
- Cloudinary account

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/medical-pager.git
cd medical-pager
```

2. Install dependencies
```
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
- Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Run the application
```
# Run backend
cd backend
npm run dev

# Run frontend (in a new terminal)
cd frontend
npm run dev
```

## Deployment

- Backend: Deployable to services like Render, Railway, or Heroku
- Frontend: Deployable to services like Vercel, Netlify, or GitHub Pages
- For full-stack deployment, consider services like Render or Railway that support both frontend and backend

## License

This project is licensed under the MIT License - see the LICENSE file for details. 