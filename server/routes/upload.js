import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage: storage });

const getJobs = () => {
  const jobsFilePath = path.join(process.cwd(), 'jobs.json');
  const jobsData = fs.readFileSync(jobsFilePath);
  return JSON.parse(jobsData);
};

const analyzeResumeWithAI = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const domains = ["Software Development", "Data Science", "Project Management", "Cybersecurity", "UI/UX Design"];
    const prompt = `Analyze the following resume text and provide a detailed analysis strictly in JSON format. The JSON object must contain these exact keys: "domain" (a string), "skills" (an array of strings), and "suggestions" (an array of strings). The "domain" must be one of the following: ${domains.join(', ')}. Do not return any text, markdown, or explanation outside of the single JSON object.\n\nResume Text:\n"""${resumeText}"""`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in AI response.");
    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.skills || !Array.isArray(analysis.skills)) {
      analysis.skills = [];
    }
    return analysis;

  } catch (error) {
    console.error("Error analyzing with AI:", error.message || error);
    return {
      domain: "Software Development",
      skills: ["AI Analysis Error"],
      suggestions: ["The AI model could not process the request. Please check server logs."]
    };
  }
};

router.post('/', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: req.file.path });
      text = result.value;
    } else {
      return res.status(400).send('Unsupported file type.');
    }

    const analysis = await analyzeResumeWithAI(text);
    const allJobs = getJobs();
    let matchedJobs = allJobs[analysis.domain] || [];

    // NEW: Perform Skill Gap Analysis
    const userSkills = analysis.skills.map(skill => skill.toLowerCase());
    matchedJobs = matchedJobs.map(job => {
      const required = job.requiredSkills.map(s => s.toLowerCase());
      const matchingSkills = job.requiredSkills.filter(skill => userSkills.includes(skill.toLowerCase()));
      const missingSkills = job.requiredSkills.filter(skill => !userSkills.includes(skill.toLowerCase()));
      return { ...job, matchingSkills, missingSkills };
    });

    res.status(200).json({
      message: 'Analysis complete',
      analysis: analysis,
      jobs: matchedJobs,
    });

    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file.');
  }
});

export default router;