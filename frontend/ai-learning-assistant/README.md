# AI Learning Assistant

An intelligent learning assistant web application powered by Google's Gemini AI. Built to help students learn more effectively by providing AI-powered explanations, answering questions, and supporting document-based learning.

## About The Project

The AI Learning Assistant is a full-stack web application designed for students who want a smarter way to study. Users can sign up, log in, and interact with an AI that can answer questions, explain concepts, and even read uploaded PDF documents to help with studying.

## Features

- User authentication (register, login, logout)
- AI-powered chat using Google Gemini
- PDF upload and parsing
- Flashcard generation
- Quiz generation
- Markdown and code syntax highlighting in responses

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- React Markdown + Syntax Highlighter

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JSON Web Tokens (JWT)
- Bcrypt
- Multer
- Google Generative AI SDK

## Getting Started

### Frontend
```bash
cd frontend/ai-learning-assistant
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder with:
```dotenv
PORT=8000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Author

Built by Simon Girma as a university side project.