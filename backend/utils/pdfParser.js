import fs from "fs/promises";

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const uint8Array = new Uint8Array(dataBuffer);
        
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        
        const loadingTask = pdfjsLib.getDocument({ 
            data: uint8Array, 
            useWorkerFetch: false, 
            isEvalSupported: false, 
            useSystemFonts: true 
        });
        const pdfDocument = await loadingTask.promise;
        
        let fullText = '';
        const numPages = pdfDocument.numPages;
        
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return {
            text: fullText,
            numPages: numPages,
            info: {},
        };
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
};