import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      { documentId, ...options }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate flashcards" };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUIZ,
      { documentId, ...options }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate quiz" };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_SUMMARY,
      { documentId }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate summary" };
  }
};

const chat = async (documentId, message, sessionId = null) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      message,
      sessionId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Chat request failed" };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.EXPLAIN_CONCEPT,
      { documentId, concept }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to explain concept" };
  }
};

const extractKeyTerms = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.EXTRACT_KEY_TERMS,
      { documentId }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to extract key terms" };
  }
};

const generateStudyPlan = async (documentId, days = 7) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_STUDY_PLAN,
      { documentId, days }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate study plan" };
  }
};

const getChatSessions = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_SESSIONS(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch chat sessions" };
  }
};

const getChatSession = async (sessionId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_SESSION(sessionId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch chat session" };
  }
};

const renameChatSession = async (sessionId, sessionName) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AI.RENAME_CHAT_SESSION(sessionId),
      { sessionName }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to rename session" };
  }
};

const deleteChatSession = async (sessionId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.AI.DELETE_CHAT_SESSION(sessionId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete session" };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  extractKeyTerms,
  generateStudyPlan,
  getChatSessions,
  getChatSession,
  renameChatSession,
  deleteChatSession,
};

export default aiService;