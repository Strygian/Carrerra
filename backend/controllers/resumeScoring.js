const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Basic scoring functions for resume analysis

// Calculate keyword density for given keywords in text
function keywordDensity(text, keywords) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const totalWords = tokens.length;
  let keywordCount = 0;
  keywords.forEach(keyword => {
    const count = tokens.filter(token => token === keyword.toLowerCase()).length;
    keywordCount += count;
  });
  return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
}

function grammarScore() {
  // For now, return a dummy score
  return 85; // out of 100
}

// Compare resume text with job description text for match percentage
function jobMatchScore(resumeText, jobDescription) {
  const resumeTokens = new Set(tokenizer.tokenize(resumeText.toLowerCase()));
  const jobTokens = new Set(tokenizer.tokenize(jobDescription.toLowerCase()));

  const intersection = new Set([...resumeTokens].filter(x => jobTokens.has(x)));
  const union = new Set([...resumeTokens, ...jobTokens]);

  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

// Main function to score resume
function scoreResume(resumeText, jobDescription, keywords) {
  const clarityScore = grammarScore(resumeText);
  const keywordDensityScore = keywordDensity(resumeText, keywords);
  const matchScore = jobMatchScore(resumeText, jobDescription);

  // Weighted average (weights can be adjusted)
  const totalScore = (clarityScore * 0.4) + (keywordDensityScore * 0.3) + (matchScore * 0.3);

  return {
    clarityScore: Math.round(clarityScore),
    keywordDensityScore: Math.round(keywordDensityScore),
    jobMatchScore: Math.round(matchScore),
    totalScore: Math.round(totalScore)
  };
}

module.exports = {
  scoreResume
};
