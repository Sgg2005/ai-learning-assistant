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

> You will need **two terminals** open at the same time to run both the frontend and backend.

### Frontend
```bash
cd frontend/ai-learning-assistant
npm install
npm run dev
```

Then open your browser at `http://localhost:5173`

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:8000`

## Running The App
Open **two terminals** side by side:

- **Terminal 1** → run the backend
- **Terminal 2** → run the frontend

Both must be running at the same time for the app to work.

## Environment Variables
Create a `.env` file in the backend folder with:
```dotenv
PORT=8000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CLIENT_URL=http://localhost:5173
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=no-reply@example.com
```

### Password Reset (Forgot Password) local testing
1. Go to `/forgot-password` and submit your account email.
2. In development mode, the backend logs the reset link to the console.
3. Open the logged URL (`/reset-password/:token`), set a new password, then log in with it.
4. If SMTP env variables are configured, a reset email is also sent.

## Author
Built by Simon Girma.
