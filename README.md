# ApplyIQ - Cover Letter Assistant

A Next.js application that helps users generate personalized cover letters by analyzing their resume and job descriptions using AI.

## Features

- **Resume Upload**: Upload PDF or TXT resume files with automatic text extraction
- **Job Description Input**: Paste job descriptions with real-time character count
- **AI-Powered Generation**: Generate personalized cover letters using AI
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Copy & Download**: Easy sharing and saving of generated cover letters

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd apply_iq
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Set up Hugging Face API key for enhanced AI generation:

   - Create a free account at [Hugging Face](https://huggingface.co/settings/tokens)
   - Create a `.env.local` file in the root directory
   - Add your API key:

   ```
   HUGGINGFACE_API_KEY=your_api_key_here
   ```

   Note: The app will work without this API key using a fallback template-based approach.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload Resume**: Drag and drop or click to upload your resume (PDF or TXT format)
2. **Enter Job Description**: Paste the job description in the text area
3. **Generate Cover Letter**: Click the "Generate Cover Letter" button
4. **Review & Download**: Review the generated cover letter and copy or download it

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **File Processing**: PDF.js for PDF text extraction
- **File Upload**: React Dropzone
- **AI Integration**: Hugging Face Inference API (with fallback)
- **Icons**: Lucide React

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

The app is optimized for Vercel deployment and will work out of the box.

### Environment Variables

For production deployment, set the following environment variable in your Vercel dashboard:

- `HUGGINGFACE_API_KEY`: Your Hugging Face API key (optional)

## API Routes

- `POST /api/generate-cover-letter`: Generates cover letters from resume and job description

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
