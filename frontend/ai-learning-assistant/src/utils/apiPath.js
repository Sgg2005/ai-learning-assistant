export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
   AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    VERIFY_EMAIL: "/api/auth/verify-email",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
    UPDATE_DOCUMENT: (id) => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/api/documents/${id}`,
    UPDATE_NOTES: (id) => `/api/documents/${id}/notes`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_SESSIONS: (documentId) => `/api/ai/chat-sessions?documentId=${documentId}`,
    GET_CHAT_SESSION: (sessionId) => `/api/ai/chat-sessions/${sessionId}`,
    RENAME_CHAT_SESSION: (sessionId) => `/api/ai/chat-sessions/${sessionId}`,
    DELETE_CHAT_SESSION: (sessionId) => `/api/ai/chat-sessions/${sessionId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) => `/api/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id) => `/api/flashcards/${id}`,
    RENAME_FLASHCARD_SET: (id) => `/api/flashcards/${id}/rename`,
  },

  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (id) => `/api/quizzes/quiz/${id}`,
    SUBMIT_QUIZ: (id) => `/api/quizzes/${id}/submit`,
    GET_QUIZ_RESULTS: (id) => `/api/quizzes/${id}/results`,
    DELETE_QUIZ: (id) => `/api/quizzes/${id}`,
    RENAME_QUIZ: (id) => `/api/quizzes/${id}/rename`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/api/progress/dashboard",
  },
};