#!/usr/bin/env node

/**
 * JLPT Question Parser v3 - Absolute Question Numbering
 * 
 * Key insight: Answer sheets use absolute question numbers (1, 2, 3...) 
 * that increment across all problems within a section, not problem-relative numbers.
 * 
 * Structure:
 * Test file:
 *   - 言語知識（文字・語彙）
 *     - 問題１: Q1-Q7
 *     - 問題２: Q8-Q12
 *     - etc.
 *   - 文法・読解
 *     - 問題１: Q1-Q13 (numbers restart)
 *     - etc.
 *   - 聴解
 *     - 問題１: Q1-Q... (numbers restart)
 * 
 * Answer file:
 *   - もじ・ごい (vocabulary section)
 *     - 問題１: 1、1  2、3  3、1 (absolute numbering)
 *   - 文法・読解 (grammar/reading section)
 *     - 問題１: 1、2  2、4  3、2 (absolute numbering, restarts at 1)
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// ============================================================================
// UTILITIES
// ============================================================================

const WATERMARK_PATTERNS = [
  /^\s*(Ng|oại|Yu|uki|Ngữ|Bù|Gro|up|êu|Tô|iY)\s*$/,
  /Tôi yêu Ngoại ngữ Group/,
  /Yuuki Bùi/,
  /Admin Yuuki/,
];

function cleanWatermarks(text) {
  const lines = text.split('\n');
  return lines.filter(line => {
    const trimmed = line.trim();
    for (const pattern of WATERMARK_PATTERNS) {
      if (pattern.test(trimmed)) return false;
    }
    return true;
  });
}

function normalizeNumber(str) {
  const map = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  };
  return str.replace(/[０-９]/g, (c) => map[c] || c);
}

// ============================================================================
// ANSWER PARSER - Uses absolute question numbering per section
// ============================================================================

function parseAnswerSheet(answerText) {
  const lines = cleanWatermarks(answerText);
  
  // Map: sectionName -> questionNumber -> correctAnswer
  const answersBySectionAndQuestion = new Map();
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for section markers in answer file
    if (trimmed.includes('もじ・ごい') || trimmed.includes('文字・語彙')) {
      currentSection = 'VOCABULARY';
      answersBySectionAndQuestion.set(currentSection, new Map());
      continue;
    }
    if (trimmed.includes('文法・読解')) {
      currentSection = 'GRAMMAR_READING';
      answersBySectionAndQuestion.set(currentSection, new Map());
      continue;
    }
    if (trimmed.includes('聴解')) {
      currentSection = 'LISTENING';
      answersBySectionAndQuestion.set(currentSection, new Map());
      continue;
    }
    
    // Skip problem markers (we use absolute question numbers)
    if (trimmed.match(/^問題[１２３４５６７０-９0-9]+$/)) {
      continue;
    }
    
    // Parse answer: "1、2 explanation"
    const answerMatch = trimmed.match(/^([０-９0-9]+)[、．.]\s*([１２３４1-4])/);
    if (answerMatch && currentSection) {
      const questionNum = normalizeNumber(answerMatch[1]);
      const answer = normalizeNumber(answerMatch[2]);
      answersBySectionAndQuestion.get(currentSection).set(questionNum, answer);
    }
  }
  
  return answersBySectionAndQuestion;
}

// ============================================================================
// QUESTION PARSER
// ============================================================================

function extractOptionsFromLine(line) {
  const options = [];
  
  // Match pattern: "1 text    ２ text    ３text    ４ text"
  // Options may or may not have space after the marker
  // Split by option markers (both full-width and half-width), keeping the marker
  const segments = line.split(/(?=[１２３４1-4](?:\s+|(?=[^\s])))/);
  
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    
    // Match option marker followed by optional space and text
    // Text continues until we hit another option marker or whitespace before next marker
    const match = trimmed.match(/^([１２３４1-4])\s*(.+?)$/);
    if (match) {
      const key = normalizeNumber(match[1]);
      let text = match[2].trim();
      
      // Remove any trailing content that is another option (handles no-space cases like "３あおい")
      // Look for pattern: multiple spaces followed by another option marker
      text = text.replace(/\s{2,}[１２３４1-4].*$/, '').trim();
      
      if (text.length > 0 && key >= '1' && key <= '4') {
        options.push({ key, text });
      }
    }
  }
  
  return options;
}

function parseTestQuestions(testText, answersBySection) {
  const lines = cleanWatermarks(testText);
  
  const sections = [];
  let currentSection = null;
  let currentSectionName = null;
  let currentProblem = null;
  let currentQuestion = null;
  let pendingOptionsLine = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    // Detect section boundaries
    if (trimmed.match(/言語知識\s*（文字・語彙）/)) {
      if (currentQuestion && currentProblem) currentProblem.questions.push(currentQuestion);
      if (currentProblem && currentSection) currentSection.problems.push(currentProblem);
      if (currentSection) sections.push(currentSection);
      
      currentSectionName = 'VOCABULARY';
      currentSection = { type: currentSectionName, problems: [] };
      currentProblem = null;
      currentQuestion = null;
      continue;
    }
    
    if (trimmed.match(/文法・読解/) || trimmed.match(/言語知識\s*（文法）/) || 
        (trimmed.includes('文法') && (trimmed.includes('読解') || lines[i+1]?.includes('読解')))) {
      if (currentQuestion && currentProblem) currentProblem.questions.push(currentQuestion);
      if (currentProblem && currentSection) currentSection.problems.push(currentProblem);
      if (currentSection) sections.push(currentSection);
      
      currentSectionName = 'GRAMMAR_READING';
      currentSection = { type: currentSectionName, problems: [] };
      currentProblem = null;
      currentQuestion = null;
      continue;
    }
    
    if (trimmed.match(/聴解/)) {
      if (currentQuestion && currentProblem) currentProblem.questions.push(currentQuestion);
      if (currentProblem && currentSection) currentSection.problems.push(currentProblem);
      if (currentSection) sections.push(currentSection);
      
      currentSectionName = 'LISTENING';
      currentSection = { type: currentSectionName, problems: [] };
      currentProblem = null;
      currentQuestion = null;
      continue;
    }
    
    // Detect problem marker
    const problemMatch = trimmed.match(/^問題([１２３４５６７０-９0-9]+)/);
    if (problemMatch && currentSection) {
      if (currentQuestion && currentProblem) currentProblem.questions.push(currentQuestion);
      if (currentProblem) currentSection.problems.push(currentProblem);
      
      const problemNum = normalizeNumber(problemMatch[1]);
      currentProblem = {
        problemNumber: problemNum,
        questions: [],
      };
      currentQuestion = null;
      continue;
    }
    
    // Skip instruction lines
    if (trimmed.includes('から一番いい') || trimmed.includes('選んでください') || 
        trimmed.includes('えらびなさい')) {
      continue;
    }
    
    // Detect question line: starts with number followed by text
    // Pattern: "１ question text" or "13 question text"
    const questionMatch = trimmed.match(/^([０-９0-9１２３４５６７８９]+)\s+(.+)/);
    if (questionMatch && currentProblem) {
      const num = normalizeNumber(questionMatch[1]);
      const rest = questionMatch[2].trim();
      
      // Make sure it's not an option line (option lines have format "1 opt1    ２ opt2")
      // Check if REST of line (after question number) has multiple option markers
      const hasMultipleOptions = (rest.match(/[１２３４1-4]\s+/g) || []).length >= 2;
      
      // Also check indentation - questions have minimal indent (< 5 spaces), options have more
      const indentSize = line.match(/^(\s*)/)[1].length;
      const isQuestionIndent = indentSize < 5;
      
      if (!hasMultipleOptions && num.length <= 2 && rest.length > 5 && isQuestionIndent) {
        // This is a question
        if (currentQuestion) {
          currentProblem.questions.push(currentQuestion);
        }
        
        currentQuestion = {
          number: num,
          prompt: rest,
          options: [],
        };
        pendingOptionsLine = null;
        continue;
      }
    }
    
    // Check if this line contains options
    // Options have pattern: "   1 text    ２ text    ３ text"
    // Options can be on one line or split across multiple lines
    const hasOptionsMarkers = (trimmed.match(/[１２３４1-4]\s+/g) || []).length >= 1;
    const isIndented = line.match(/^\s{3,}/);
    
    // Keep collecting options until we have all 4
    if ((hasOptionsMarkers || isIndented) && currentQuestion && currentQuestion.options.length < 4) {
      const extracted = extractOptionsFromLine(trimmed);
      if (extracted.length > 0) {
        currentQuestion.options.push(...extracted);
      }
    }
  }
  
  // Finalize
  if (currentQuestion && currentProblem) currentProblem.questions.push(currentQuestion);
  if (currentProblem && currentSection) currentSection.problems.push(currentProblem);
  if (currentSection) sections.push(currentSection);
  
  // Align answers using section-based absolute numbering
  for (const section of sections) {
    const sectionAnswers = answersBySection.get(section.type);
    if (!sectionAnswers) continue;
    
    for (const problem of section.problems) {
      for (const question of problem.questions) {
        const correctAnswer = sectionAnswers.get(question.number);
        if (correctAnswer) {
          question.correctAnswer = correctAnswer;
        }
      }
    }
  }
  
  return sections;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateParsedData(sections) {
  const issues = [];
  const stats = {
    totalQuestions: 0,
    withAnswers: 0,
    withFullOptions: 0,
    bySectionType: {},
  };
  
  for (const section of sections) {
    if (!stats.bySectionType[section.type]) {
      stats.bySectionType[section.type] = {
        questions: 0,
        withAnswers: 0,
        withOptions: 0,
      };
    }
    
    const sectionStats = stats.bySectionType[section.type];
    
    for (const problem of section.problems) {
      for (const question of problem.questions) {
        stats.totalQuestions++;
        sectionStats.questions++;
        
        if (question.correctAnswer) {
          stats.withAnswers++;
          sectionStats.withAnswers++;
        } else {
          issues.push(`${section.type} P${problem.problemNumber} Q${question.number}: Missing answer`);
        }
        
        if (question.options.length >= 4) {
          stats.withFullOptions++;
          sectionStats.withOptions++;
        } else if (question.options.length > 0) {
          issues.push(`${section.type} P${problem.problemNumber} Q${question.number}: Only ${question.options.length}/4 options`);
        } else {
          issues.push(`${section.type} P${problem.problemNumber} Q${question.number}: No options`);
        }
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    stats,
    issues,
    completeness: stats.totalQuestions > 0 ? (stats.withFullOptions / stats.totalQuestions) : 0,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node parse-jlpt-questions.mjs <test-file.txt> <answer-file.txt> [output.json]');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/parse-jlpt-questions.mjs \\');
    console.error('    "data/jlpt-import/text/N4__2023年7月__N4 Test T7-2023.txt" \\');
    console.error('    "data/jlpt-import/text/N4__2023年7月__Answers to N4 test T7-2023.txt" \\');
    console.error('    "data/jlpt-import/parsed/N4-2023-07.json"');
    process.exit(1);
  }
  
  const [testFile, answerFile, outputFile] = args;
  
  if (!existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }
  
  if (!existsSync(answerFile)) {
    console.error(`❌ Answer file not found: ${answerFile}`);
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 JLPT Question Parser v3 - Absolute Numbering');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`📄 Test:   ${testFile}`);
  console.log(`📋 Answer: ${answerFile}\n`);
  
  // Read files
  const testText = await readFile(testFile, 'utf-8');
  const answerText = await readFile(answerFile, 'utf-8');
  
  // Parse answers (section -> questionNumber -> answer)
  console.log('Step 1️⃣  Parsing answer sheet...\n');
  const answersBySection = parseAnswerSheet(answerText);
  
  for (const [section, answers] of answersBySection.entries()) {
    console.log(`   ${section}: ${answers.size} answers`);
    const sorted = Array.from(answers.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
    const range = sorted.length > 0 ? `Q${sorted[0][0]}-Q${sorted[sorted.length - 1][0]}` : 'none';
    console.log(`      Range: ${range}`);
  }
  console.log('');
  
  // Parse questions
  console.log('Step 2️⃣  Parsing test questions...\n');
  const sections = parseTestQuestions(testText, answersBySection);
  
  for (const section of sections) {
    const totalQ = section.problems.reduce((sum, p) => sum + p.questions.length, 0);
    console.log(`   ${section.type}:`);
    console.log(`      ${section.problems.length} problems, ${totalQ} questions`);
    
    for (const problem of section.problems) {
      if (problem.questions.length === 0) continue;
      const first = problem.questions[0].number;
      const last = problem.questions[problem.questions.length - 1].number;
      const withOpts = problem.questions.filter(q => q.options.length >= 4).length;
      const withAns = problem.questions.filter(q => q.correctAnswer).length;
      console.log(`      P${problem.problemNumber}: Q${first}-Q${last} (${problem.questions.length} questions, ${withOpts} complete options, ${withAns} answers)`);
    }
  }
  console.log('');
  
  // Validate
  console.log('Step 3️⃣  Validation\n');
  const validation = validateParsedData(sections);
  const { stats } = validation;
  
  console.log(`   Total: ${stats.totalQuestions} questions`);
  console.log(`   With answers: ${stats.withAnswers} (${(stats.withAnswers/stats.totalQuestions*100).toFixed(1)}%)`);
  console.log(`   With 4 options: ${stats.withFullOptions} (${(stats.withFullOptions/stats.totalQuestions*100).toFixed(1)}%)`);
  console.log(`   Completeness: ${(validation.completeness * 100).toFixed(1)}%\n`);
  
  for (const [sectionType, sectionStats] of Object.entries(stats.bySectionType)) {
    console.log(`   ${sectionType}:`);
    console.log(`      ${sectionStats.questions} questions`);
    console.log(`      ${sectionStats.withAnswers} with answers (${(sectionStats.withAnswers/sectionStats.questions*100).toFixed(0)}%)`);
    console.log(`      ${sectionStats.withOptions} with options (${(sectionStats.withOptions/sectionStats.questions*100).toFixed(0)}%)`);
  }
  
  console.log(`\n   Status: ${validation.valid ? '✅ READY FOR IMPORT' : '⚠️  NEEDS REFINEMENT'}\n`);
  
  if (validation.issues.length > 0 && validation.issues.length <= 20) {
    console.log('⚠️  Issues:\n');
    for (const issue of validation.issues) {
      console.log(`   ${issue}`);
    }
    console.log('');
  } else if (validation.issues.length > 20) {
    console.log(`⚠️  ${validation.issues.length} issues found (showing first 10):\n`);
    for (const issue of validation.issues.slice(0, 10)) {
      console.log(`   ${issue}`);
    }
    console.log(`   ... and ${validation.issues.length - 10} more\n`);
  }
  
  // Show samples
  console.log('Step 4️⃣  Sample Questions\n');
  let shown = 0;
  for (const section of sections) {
    if (shown >= 3) break;
    for (const problem of section.problems) {
      if (shown >= 3) break;
      const complete = problem.questions.filter(q => q.options.length >= 4 && q.correctAnswer);
      if (complete.length === 0) continue;
      
      const q = complete[0];
      console.log(`   ${section.type} / Problem ${problem.problemNumber} / Question ${q.number}`);
      console.log(`   "${q.prompt.substring(0, 70)}${q.prompt.length > 70 ? '...' : ''}"`);
      for (const opt of q.options) {
        const mark = opt.key === q.correctAnswer ? '✓' : ' ';
        console.log(`      [${mark}] ${opt.key}. ${opt.text.substring(0, 45)}${opt.text.length > 45 ? '...' : ''}`);
      }
      console.log('');
      shown++;
    }
  }
  
  // Output JSON
  const output = {
    meta: {
      testFile,
      answerFile,
      parsedAt: new Date().toISOString(),
      parserVersion: '3.0',
    },
    validation,
    sections,
  };
  
  if (outputFile) {
    await writeFile(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved to: ${outputFile}`);
  } else {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
