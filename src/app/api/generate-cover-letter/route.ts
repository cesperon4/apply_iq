import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { coverLetterPrompt } from "@/lib/prompts/cover-letter-prompt";

// Ensure this runs in Node.js (not Edge)
export const runtime = "nodejs";

// Helper: Extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const extractedText = data.text.trim();

    if (!extractedText) throw new Error("No text found in PDF");

    console.log(
      `✅ Extracted ${extractedText.length} characters from ${file.name}`
    );
    return extractedText;
  } catch (error) {
    console.error("❌ Error extracting text from PDF:", error);
    const fileSize = (file.size / 1024).toFixed(1);
    return `PDF Resume: ${file.name} (${fileSize} KB)

      PDF text extraction failed. Possible reasons:
      - Image-based or scanned document
      - Encrypted or protected PDF
      - Complex layout

      Please convert it to plain text for best results.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required." },
        { status: 400 }
      );
    }

    // Extract resume text
    let resumeText = "";
    if (resumeFile.type === "text/plain") {
      resumeText = await resumeFile.text();
    } else if (resumeFile.type === "application/pdf") {
      resumeText = await extractTextFromPDF(resumeFile);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or text file." },
        { status: 400 }
      );
    }

    // Clean and limit resume text length
    const cleanResume = resumeText.replace(/\s+/g, " ").trim();

    // Build AI prompt
    const prompt = coverLetterPrompt({ resume: cleanResume, jobDescription });

    // --- HUGGING FACE CALL ---
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      console.log(
        "⚠️ No valid Hugging Face API key found, using fallback generator"
      );
      const fallback = generateFallbackCoverLetter(cleanResume, jobDescription);
      return NextResponse.json({ coverLetter: fallback });
    }

    const hfResponse = await client.chatCompletion({
      provider: "hyperbolic",
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      top_p: 0.9,
      top_k: 50,
    });

    const rawMessage =
      hfResponse.choices?.[0]?.message?.content || "No response";

    const message = rawMessage
      .replace(/<\|.*?\|>/g, "")
      .replace(/^\s*analysis\s*/i, "")
      .replace(/^\s*final\s*/i, "")
      // split into paragraphs
      .split(/\n{2,}/)
      .map((para) => `<p>${para.trim()}</p>`)
      .join("");

    return NextResponse.json({ message });
  } catch (error) {
    console.error("💥 Error generating cover letter:", error);
    return NextResponse.json(
      {
        coverLetter:
          "An error occurred while generating the cover letter. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// --- FALLBACK GENERATOR ---
function generateFallbackCoverLetter(
  resume: string,
  jobDescription: string
): string {
  const nameLine = resume.split("\n")[0] || "Dear Hiring Manager";
  const email = resume.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
  const company = extractCompanyName(jobDescription);

  return `Dear Hiring Manager,

I am excited to apply for the position at ${company}. My background and skills outlined in my resume demonstrate a strong fit for this opportunity. I am confident that my experience will allow me to make an immediate and valuable contribution to your team.

I am particularly drawn to ${company} because of its reputation for excellence and commitment to innovation. I would welcome the chance to bring my expertise and enthusiasm to this role.

Thank you for considering my application. I look forward to the opportunity to speak with you further.

Sincerely,
${nameLine}${email ? `\n${email}` : ""}`;
}

function extractCompanyName(text: string): string {
  const match = text.match(/(?:at|for|with)\s+([A-Z][a-zA-Z\s&]+)/i);
  return match ? match[1].trim() : "your company";
}
