# JLPT Exam JSON Format Guide

This guide describes the standard JSON structure used for importing JLPT exam data into Miraigo.

## Overview

A parsed JLPT exam is a JSON object that contains the exam's metadata and a list of `sections`. Each `section` corresponds to a major part of the exam, which then contains `problems` (mondai), and each problem contains `questions`.

## Structure

### Root Object

```json
{
  "meta": {
    "testFile": "N4__2023年7月__N4 Test T7-2023.txt",
    "answerFile": "N4__2023年7月__Answers to N4 test T7-2023.txt",
    "parsedAt": "2024-03-08T00:00:00.000Z",
    "parserVersion": "3.0"
  },
  "validation": {
    "valid": true,
    "stats": {},
    "issues": [],
    "completeness": 1.0
  },
  "sections": []
}
```

- **meta**: Information about the source files.
- **validation**: Output from the parser validating whether all questions and options are intact.
- **sections**: Array of Section objects.

### Section Object

```json
{
  "type": "VOCABULARY", // or "GRAMMAR_READING", "LISTENING"
  "problems": []
}
```

- **type**: Must be mapped properly by the backend (`JlptImportServiceImpl`). Note that for N4 and N5, `GRAMMAR_READING` will be split into two separate backend sections (`GRAMMAR_KNOWLEDGE` and `READING_COMPREHENSION`).
- **problems**: Array of Problem objects.

### Problem Object

```json
{
  "problemNumber": "1",
  "questions": []
}
```

- **problemNumber**: A string indicating the mondai (問題) number.
- **questions**: Array of Question objects.

### Question Object

```json
{
  "number": "1",
  "prompt": "だいがく",
  "options": [],
  "correctAnswer": "2"
}
```

- **number**: Absolute question number (unique across the section).
- **prompt**: The question text.
- **correctAnswer**: The key of the correct option (e.g., "1", "2", "3", "4").
- **options**: Array of Option objects.

### Option Object

```json
{
  "key": "1",
  "text": "大学"
}
```

- **key**: Typically `"1"`, `"2"`, `"3"`, `"4"`.
- **text**: The text for this option.

## Import Process

1. `parse-jlpt-questions.mjs` converts raw text and answer sheets into the JSON format above.
2. `import-jlpt-questions.mjs` reads the JSON file, authenticates with the backend, and sends the `sections` array as part of the payload to `POST /api/v1/admin/jlpt/import-parsed-exam`.
3. The backend maps `GRAMMAR_READING` (for lower levels) into strictly separate sections in the database.
