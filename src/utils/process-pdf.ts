import pdfParse from "pdf-parse/lib/pdf-parse.js";

const MAX_RESUME_TEXT_LENGTH = 10000; // Limit the resume text length to avoid excessive input size

export const processPDF = async (resume: File): Promise<string> => {
  try {
    const buffer = Buffer.from(await resume.arrayBuffer());
    const parsed = await pdfParse(buffer);

    if (!parsed.text || parsed.text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    return parsed.text.slice(0, MAX_RESUME_TEXT_LENGTH);
  } catch (error) {
    throw new Error(
      `Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
