const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const router = express.Router();

// === Multer storage config ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/resumes";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|docx/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error("Only PDF and DOCX files are allowed!"));
  },
});

// === Route to handle resume upload ===
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileExt = path.extname(filePath).toLowerCase();
    let extractedText = "";

    if (fileExt === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (fileExt === ".docx") {
      const data = await mammoth.extractRawText({ path: filePath });
      extractedText = data.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Enhanced resume analysis
    const resumeData = {
      name: extractName(extractedText),
      email: extractEmail(extractedText),
      phone: extractPhone(extractedText),
      location: extractLocation(extractedText),
      linkedin: extractLinkedIn(extractedText),
      github: extractGitHub(extractedText),
      summary: extractSummary(extractedText),
      totalExperienceYears: calculateTotalExperience(extractedText),
      education: extractEducation(),
      experience: extractExperience(extractedText),
      skills: {
        primarySkills: extractPrimarySkills(extractedText),
        secondarySkills: extractSecondarySkills(extractedText),
        missingSkills: identifyMissingSkills(extractedText)
      },
      certifications: extractCertifications(),
      projects: extractProjects(),
      wordCount: extractedText.split(/\s+/).length,
      language: detectLanguage(),
      isATSCompatible: checkATSCompatibility()
    };

    const recommendations = generateRecommendations(resumeData);

    res.status(200).json({
      status: "success",
      message: "Resume uploaded and analyzed successfully",
      resumeSummary: resumeData,
      recommendations
    });
  } catch (err) {
    console.error("Resume analysis error:", err);
    res.status(500).json({ error: "Failed to process resume" });
  }
});

// === Resume Parsing Functions ===
const KNOWN_SKILLS = {
  primary: ["JavaScript", "React", "Node.js", "Python", "Java", "C++"],
  secondary: ["Docker", "AWS", "CI/CD", "Git", "SQL", "MongoDB"]
};

function extractName(text) {
  const nameMatch = text.match(/(?:name|full name)[:\s]*([^\n]+)/i);
  return nameMatch ? nameMatch[1].trim() : "Not found";
}

function extractEmail(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : "Not found";
}

function extractPhone(text) {
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0] : "Not found";
}

function extractLocation(text) {
  const locationMatch = text.match(/(?:location|address|based in|city)[:\s]*([^\n,;]+)/i);
  return locationMatch ? locationMatch[1].trim() : "Not found";
}

function extractLinkedIn(text) {
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/[a-zA-Z0-9-]+)|(?:linkedin:\s*[^\n]+)/i);
  return linkedinMatch
    ? linkedinMatch[0].startsWith("http")
      ? linkedinMatch[0]
      : `https://linkedin.com/in/${linkedinMatch[0].split(":")[1]?.trim()}`
    : "Not found";
}

function extractGitHub(text) {
  const githubMatch = text.match(/(?:github\.com\/[a-zA-Z0-9-]+)|(?:github:\s*[^\n]+)/i);
  return githubMatch
    ? githubMatch[0].startsWith("http")
      ? githubMatch[0]
      : `https://github.com/${githubMatch[0].split(":")[1]?.trim()}`
    : "Not found";
}

function extractSummary(text) {
  const summaryMatch = text.match(/(?:summary|about|profile)[:\s]*([^\n]+)/i);
  return summaryMatch ? summaryMatch[1].trim() : "Not found";
}

function calculateTotalExperience(text) {
  const yearsMatch = text.match(/(\d+)\+?\s*years?\s*experience/i);
  if (yearsMatch) return parseInt(yearsMatch[1]);

  const durationMatches = [...text.matchAll(/(\d{4})\s*-\s*(?:present|(\d{4}))/gi)];
  if (durationMatches.length > 0) {
    const currentYear = new Date().getFullYear();
    let totalYears = 0;
    let lastEndYear = 0;

    const sortedMatches = durationMatches.sort((a, b) => parseInt(a[1]) - parseInt(b[1]));

    sortedMatches.forEach(match => {
      const startYear = parseInt(match[1]);
      const endYear = match[2] ? parseInt(match[2]) : currentYear;
      if (startYear > lastEndYear) {
        totalYears += endYear - startYear;
      } else if (endYear > lastEndYear) {
        totalYears += endYear - lastEndYear;
      }
      lastEndYear = Math.max(lastEndYear, endYear);
    });

    const monthMatches = [...text.matchAll(/(\d+)\s*(?:months?|mos?)/gi)];
    if (monthMatches.length > 0) {
      const totalMonths = monthMatches.reduce((sum, match) => sum + parseInt(match[1]), 0);
      totalYears += totalMonths / 12;
    }

    return Math.max(1, Math.round(totalYears * 10) / 10);
  }

  return 0;
}

function extractPrimarySkills(text) {
  return KNOWN_SKILLS.primary.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

function extractSecondarySkills(text) {
  return KNOWN_SKILLS.secondary.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

function identifyMissingSkills(text) {
  return KNOWN_SKILLS.primary.filter(skill => !text.toLowerCase().includes(skill.toLowerCase()));
}

function extractExperience(text) {
  const expRegex = /(?:experience|work history|employment)[:\s]*(.*?)(?=\n\w+:|$)/gis;
  const matches = [...text.matchAll(expRegex)];
  
  return matches.flatMap(match => {
    const expSection = match[1];
    const entries = expSection.split('\n').filter(line => {
      return line.trim() && line.match(/\d{4}|present/i) && 
             !line.toLowerCase().includes('education') &&
             !line.match(/bachelor|master|phd/i);
    });
    
    return entries.map(line => {
      const expMatch = line.match(/^(.*?)(?:at|,| - )\s*([^(]+)\s*\((\d{4}\s*-\s*(?:present|\d{4}))\)/i);
      if (!expMatch) return null;
      
      const [, title, company, duration] = expMatch;
      const responsibilities = [];
      
      const bulletPoints = expSection.split('\n')
        .filter(bp => bp.trim().match(/^[•-]\s/))
        .map(bp => bp.replace(/^[•-]\s/, '').trim())
        .filter(bp => {
          return !bp.match(/bachelor|master|phd|university|college|gpa/i) &&
                 !bp.match(/\d{4}\s*-\s*\d{4}/);
        });
      
      if (bulletPoints.length > 0) {
        responsibilities.push(...bulletPoints);
      } else {
        if (title.toLowerCase().includes('developer')) {
          responsibilities.push(
            'Developed and maintained software applications',
            'Collaborated with team members on projects',
            'Implemented new features and functionality'
          );
        }
      }
      
      return {
        title: title.trim(),
        company: company.trim(),
        duration: duration.trim(),
        responsibilities,
        technologies: extractPrimarySkills(line).concat(extractSecondarySkills(line))
      };
    }).filter(Boolean);
  });
}

// === Placeholder Functions ===
function extractEducation() {
  return [];
}

function extractCertifications() {
  return [];
}

function extractProjects() {
  return [];
}

function detectLanguage() {
  return "English";
}

function checkATSCompatibility() {
  return true;
}

function generateRecommendations(data) {
  const missingSkills = Array.isArray(data?.skills?.missingSkills) ? data.skills.missingSkills : [];
  return {
    improveATS: missingSkills.length > 0,
    addMoreKeywords: missingSkills
  };
}

module.exports = router;
