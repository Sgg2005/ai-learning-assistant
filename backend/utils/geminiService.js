import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

const generateWithRetry = async (prompt) => {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        return response.text || "";
      } catch (error) {
        lastError = error;

        const isUnavailable =
          error?.status === 503 ||
          error?.message?.includes("UNAVAILABLE") ||
          error?.message?.includes("high demand");

        if (isUnavailable && attempt < 3) {
          await sleep(1000 * attempt);
          continue;
        }
      }
    }
  }

  console.error("Gemini API error:", lastError);
  throw new Error("Gemini request failed");
};

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "----"

    Text:
    ${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);

    const flashcards = [];
    const cards = generatedText.split("----").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (
  text,
  numQuestions = 5,
  difficulty = "medium"
) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    All questions must be at ${difficulty} difficulty level.
    - Easy: basic recall and simple understanding
    - Medium: application and analysis of concepts
    - Hard: complex reasoning and critical thinking

    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: ${difficulty}]

    Separate questions with "----"

    Text:
    ${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);

    const questions = [];
    const questionBlocks = generatedText.split("----").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        diff = difficulty;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const d = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) diff = d;
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty: diff,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
    Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}`;

  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `You are a friendly and helpful study assistant.

    For general conversational questions (greetings, questions about what you can do, how you work, etc.), answer them naturally and helpfully.

    For questions about a specific topic or concept, answer using only the document context provided below. If the answer is not found in the document, say: "I couldn't find information about that in your document. Try asking something else from it."

    Context from the document:
    ${context}

    User question: ${question}

    Answer:`;

  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};

/**
 * Extract key terms from document
 * @param {string} text - Document text
 * @returns {Promise<Array<{term: string, definition: string}>>}
 */
export const extractKeyTerms = async (text) => {
  const prompt = `Extract the 10 most important key terms or concepts from the following text.
    For each term provide a clear and concise definition based on the text.

    Format each term as:
    T: [Term]
    D: [Definition - 1-2 sentences]

    Separate each term with "----"

    Text:
    ${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);

    const terms = [];
    const blocks = generatedText.split("----").filter((b) => b.trim());

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      let term = "",
        definition = "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("T:")) {
          term = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          definition = trimmed.substring(2).trim();
        }
      }

      if (term && definition) {
        terms.push({ term, definition });
      }
    }

    return terms;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to extract key terms");
  }
};

/**
 * Generate a day-by-day study plan
 * @param {string} text - Document text
 * @param {number} days - Number of days for the plan
 * @returns {Promise<string>}
 */
export const generateStudyPlan = async (text, days = 7) => {
  const prompt = `Create a day-by-day study plan based strictly on the document below.
    The plan should be ${days} days long.
    Each day should include:
    - Topics to focus on
    - Key tasks (reading/review/summary/questions)
    - Estimated time (e.g. 30–60 min)
    Format the output as Markdown with clear headings for each day.

    Document:
    ${text.substring(0, 20000)}`;

  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate study plan");
  }
};

/**
 * Generate written exam paper
 * @param {string} text - Document text
 * @param {number} questionCount - Number of main questions
 * @param {string} paperType - Paper format type
 * @returns {Promise<string>}
 */
export const generateWrittenExamPaper = async (
  text,
  questionCount = 5,
  paperType = "subparts"
) => {
  let formatInstructions = "";

  if (paperType === "subparts") {
    formatInstructions = `
Generate the paper in this exact format:

1.
(a) [question]
(b) [question]
(c) [question]

2.
(a) [question]
(b) [question]
(c) [question]

Rules:
- Each main question must have exactly 3 subparts: (a), (b), (c)
- Do not number subparts as 1, 2, 3
- Do not show answers in the student paper
- Keep the numbering exactly like 1, 2, 3 for main questions and letters for subparts
`;
  } else if (paperType === "short-answer") {
    formatInstructions = `
Generate short-answer questions in this exact format:

1. [question]
2. [question]
3. [question]
4. [question]

Rules:
- Do not show answers
- Keep the numbering exactly as 1, 2, 3, 4
`;
  } else if (paperType === "essay") {
    formatInstructions = `
Generate essay-style questions in this exact format:

1. [long-form question]
2. [long-form question]
3. [long-form question]

Rules:
- Do not show answers
- Keep the numbering exactly as 1, 2, 3
`;
  } else {
    formatInstructions = `
Generate a mixed-format written paper with clear numbering and subparts where appropriate.
Do not show answers.
`;
  }

  const prompt = `You are generating a written exam paper based strictly on the document below.

${formatInstructions}

Important rules:
- Follow the chosen format exactly
- Do not generate MCQ options
- Do not include answers in the student-facing paper
- Base the questions strictly on the document content

Document:
${text.substring(0, 20000)}`;

  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate written exam paper");
  }
};