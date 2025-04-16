#!/bin/bash

# ChatHub Deployment Script
echo "Starting ChatHub deployment..."

# Variables
REPO_URL="https://github.com/NayanPrajpati1323/ChatHub.git"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Check environment files
check_env_files() {
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${YELLOW}Warning: .env file not found in $BACKEND_DIR directory.${NC}"
        echo -e "Please create a .env file with the following variables:"
        echo -e "MONGODB_URI=your_mongodb_connection_string"
        echo -e "PORT=5000"
        echo -e "JWT_SECRET=your_jwt_secret"
        echo -e "NODE_ENV=production"
        echo -e "CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name"
        echo -e "CLOUDINARY_API_KEY=your_cloudinary_api_key"
        echo -e "CLOUDINARY_API_SECRET=your_cloudinary_api_secret"
        echo -e "FRONTEND_URL=your_frontend_url_for_cors"
        exit 1
    fi

    if [ ! -f "$FRONTEND_DIR/.env" ]; then
        echo -e "${YELLOW}Warning: .env file not found in $FRONTEND_DIR directory.${NC}"
        echo -e "Please create a .env file with the following variables:"
        echo -e "VITE_API_BASE_URL=your_backend_api_url"
        exit 1
    fi
}

# Build backend
build_backend() {
    echo -e "${GREEN}Building backend...${NC}"
    cd $BACKEND_DIR
    npm install
    cd ..
    echo -e "${GREEN}Backend build complete!${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${GREEN}Building frontend...${NC}"
    cd $FRONTEND_DIR
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}Frontend build complete!${NC}"
}

# Start application
start_app() {
    echo -e "${GREEN}Starting the application...${NC}"
    # Start backend in the background
    cd $BACKEND_DIR
    echo -e "${GREEN}Starting backend server...${NC}"
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # Start frontend
    cd $FRONTEND_DIR
    echo -e "${GREEN}Starting frontend server...${NC}"
    npm run dev

    # Kill the backend server when the script exits
    trap "kill $BACKEND_PID" EXIT
}

# Main deployment process
main() {
    echo -e "${GREEN}Checking environment files...${NC}"
    check_env_files

    echo -e "${GREEN}Building application...${NC}"
    build_backend
    build_frontend

    echo -e "${GREEN}Deployment complete!${NC}"
    
    # Ask if the user wants to start the application
    read -p "Do you want to start the application now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_app
    else
        echo -e "${GREEN}To start the application, run the following commands:${NC}"
        echo -e "  cd $BACKEND_DIR && npm run dev"
        echo -e "  cd $FRONTEND_DIR && npm run dev"
    fi
}

# Run the main function
main 