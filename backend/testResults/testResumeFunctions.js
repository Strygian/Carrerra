const {
  extractName,
  extractEmail,
  extractPhone,
  extractLocation,
  extractLinkedIn,
  extractGitHub,
  extractSummary,
  calculateTotalExperience,
  extractPrimarySkills,
  extractSecondarySkills,
  identifyMissingSkills,
  extractExperience,
  extractEducation,
  extractCertifications,
  extractProjects,
  detectLanguage,
  checkATSCompatibility,
  generateRecommendations
} = require('../routes/resumeRoutes');

// Sample resume text for testing
const sampleText = `
Name: John Doe
Email: john.doe@example.com
Phone: +1 (555) 123-4567
Location: New York, NY
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe
Summary: Experienced software developer with expertise in JavaScript and Node.js.
Experience:
Software Developer at TechCorp (2018 - Present)
- Developed web applications using React and Node.js
- Collaborated with cross-functional teams
Education:
Bachelor of Science in Computer Science
Skills:
JavaScript, React, Node.js, Docker, AWS
Certifications:
AWS Certified Solutions Architect
Projects:
Project A, Project B
`;

console.log('extractName:', extractName(sampleText));
console.log('extractEmail:', extractEmail(sampleText));
console.log('extractPhone:', extractPhone(sampleText));
console.log('extractLocation:', extractLocation(sampleText));
console.log('extractLinkedIn:', extractLinkedIn(sampleText));
console.log('extractGitHub:', extractGitHub(sampleText));
console.log('extractSummary:', extractSummary(sampleText));
console.log('calculateTotalExperience:', calculateTotalExperience(sampleText));
console.log('extractPrimarySkills:', extractPrimarySkills(sampleText));
console.log('extractSecondarySkills:', extractSecondarySkills(sampleText));
console.log('identifyMissingSkills:', identifyMissingSkills(sampleText));
console.log('extractExperience:', extractExperience(sampleText));
console.log('extractEducation:', extractEducation());
console.log('extractCertifications:', extractCertifications());
console.log('extractProjects:', extractProjects());
console.log('detectLanguage:', detectLanguage());
console.log('checkATSCompatibility:', checkATSCompatibility());
console.log('generateRecommendations:', generateRecommendations({
  skills: {
    missingSkills: identifyMissingSkills(sampleText)
  }
}));
