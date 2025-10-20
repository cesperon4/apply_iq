// app/api/generate-cover-letter/route.ts
import { NextRequest, NextResponse } from "next/server";

// Force Node runtime
export const runtime = "nodejs";

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

// --- PDF Extraction ---
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lazy load pdf-parse to reduce bundle size
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    if (!text) throw new Error("No text found in PDF");

    console.log(`✅ Extracted ${text.length} characters from ${file.name}`);
    return text;
  } catch (err) {
    console.error("❌ PDF extraction error:", err);
    return `PDF Resume: ${file.name} (size ${(file.size / 1024).toFixed(
      1
    )} KB)\n\nPDF text extraction failed. Please convert to plain text.`;
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
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
        { error: "Unsupported file type. Upload PDF or text." },
        { status: 400 }
      );
    }

    const cleanResume = resumeText.replace(/\s+/g, " ").trim().slice(0, 5000);

    // Build AI prompt
    const prompt = `You are an expert career counselor and cover letter writer. Create a professional cover letter based on the resume and job description below.

RESUME:
${cleanResume}

JOB DESCRIPTION:
${jobDescription}

COVER LETTER:`;

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      console.log("⚠️ No Hugging Face API key, using fallback generator");
      const fallback = generateFallbackCoverLetter(cleanResume, jobDescription);
      return NextResponse.json({ coverLetter: fallback });
    }

    // Lazy load Hugging Face client to reduce bundle size
    const { InferenceClient } = await import("@huggingface/inference");
    const client = new InferenceClient(apiKey);

    // Make Hugging Face API call
    const hfResponse = await client.chatCompletion({
      provider: "hyperbolic",
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
    });

    const rawMessage =
      hfResponse.choices?.[0]?.message?.content || "No response";
    const message = rawMessage
      .replace(/<\|.*?\|>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ coverLetter: message });
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
