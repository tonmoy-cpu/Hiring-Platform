const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

// Common skills list (expand this as needed)
const commonSkills = [
  "javascript", "python", "java", "react", "node.js", "sql", "aws", "docker", "git", "html", "css",
  "project management", "agile", "ux design", "figma", "typescript", "mongodb", "graphql",
];

// Helper to clean and split text into lines
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim().split("\n").map(line => line.trim()).filter(line => line);
}

async function extractResumeDetails(resumeText) {
  const lines = cleanText(resumeText);

  // Contact Info
  const contact = {
    name: "Unknown",
    email: resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "N/A",
    phone: resumeText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "N/A",
  };
  // Heuristic for name: First non-empty line or line before email/phone
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].length > 2 && !lines[i].includes("@") && !/\d{3}/.test(lines[i])) {
      contact.name = lines[i];
      break;
    }
  }

  // Skills (AI + Keyword Matching)
  const skillsFromAI = await hf.tokenClassification({
    model: "dslim/bert-base-NER",
    inputs: resumeText,
  }).then(res => res.filter(e => e.entity_group === "SKILL" || e.score > 0.8).map(e => e.word.toLowerCase()));
  
  const skillsFromText = lines
    .flatMap(line => line.toLowerCase().split(/[,;]/))
    .map(skill => skill.trim())
    .filter(skill => commonSkills.includes(skill) || skill.length > 2);
  
  const skills = [...new Set([...skillsFromAI, ...skillsFromText])]; // Remove duplicates

  // Work Experience
  const experience = [];
  const expKeywords = ["experience", "work history", "employment", "professional experience"];
  let expSection = false;
  let currentExp = null;

  for (const line of lines) {
    if (expKeywords.some(k => line.toLowerCase().includes(k))) {
      expSection = true;
      continue;
    }
    if (expSection && (line.toLowerCase().includes("education") || line.toLowerCase().includes("skills"))) {
      expSection = false;
      continue;
    }
    if (expSection) {
      // Look for job title/company or date patterns
      const dateMatch = line.match(/(\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*-\s*present)/i);
      if (dateMatch) {
        if (currentExp) experience.push(currentExp);
        currentExp = { title: "", company: "", years: dateMatch[0] };
      } else if (currentExp && !currentExp.title) {
        const parts = line.split(/ at |, | - /i);
        currentExp.title = parts[0].trim();
        currentExp.company = parts[1]?.trim() || "Unknown";
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  // Education
  const education = [];
  const eduKeywords = ["education", "academic", "degree"];
  let eduSection = false;

  for (const line of lines) {
    if (eduKeywords.some(k => line.toLowerCase().includes(k))) {
      eduSection = true;
      continue;
    }
    if (eduSection && (line.toLowerCase().includes("experience") || line.toLowerCase().includes("skills"))) {
      eduSection = false;
      continue;
    }
    if (eduSection) {
      const degreeMatch = line.match(/(b\.s\.|m\.s\.|ph\.d\.|bachelor|master|diploma)/i);
      const yearMatch = line.match(/\d{4}/);
      if (degreeMatch || yearMatch) {
        const parts = line.split(/,| - /i);
        education.push({
          degree: degreeMatch ? parts[0].trim() : parts[0].trim(),
          school: parts[1]?.trim() || "Unknown",
          year: yearMatch ? yearMatch[0] : "N/A",
        });
      }
    }
  }

  return { contact, skills, experience, education };
}

async function analyzeResumeAgainstJob(resumeText, job) {
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const { skills } = await extractResumeDetails(resumeText);
  const matchedSkills = skills.filter(skill => jobSkills.includes(skill.toLowerCase()));
  const missingSkills = jobSkills.filter(s => !matchedSkills.includes(s.toLowerCase()));

  const skillScore = (matchedSkills.length / jobSkills.length) * 70;
  const expScore = resumeText.includes(job.title) ? 20 : 10;
  const plagiarismScore = resumeText.length > 50 ? 10 : 5;
  const totalScore = Math.min(100, skillScore + expScore + plagiarismScore);

  const feedback = missingSkills.length
    ? `Missing skills: ${missingSkills.join(", ")}. Consider adding relevant projects.`
    : "Strong match! Your skills align well with this job.";

  return { score: totalScore, feedback, matchedSkills, missingSkills };
}

module.exports = { extractResumeDetails, analyzeResumeAgainstJob };