import fs from "fs/promises";
import { pdfParse } from "pdf-parse";

/**
 * Extracting text from PDF file
 * @param {string} filePath - The path to the PDF file
 * @return {Promise<{text: string, numPages: number}>} - An object containing the extracted text and the number of pages
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParser(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
};
