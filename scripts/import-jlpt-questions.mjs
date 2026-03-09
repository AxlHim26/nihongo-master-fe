#!/usr/bin/env node
/**
 * import-jlpt-questions.mjs
 *
 * Reads a cleaned parsed-exam JSON file (from parse-jlpt-questions.mjs),
 * authenticates as admin, and calls POST /api/v1/admin/jlpt/import-parsed-exam
 * to load questions, options, and answer keys into the database.
 *
 * Usage:
 *   node scripts/import-jlpt-questions.mjs
 *
 * Environment variables:
 *   BACKEND_URL        — default: http://localhost:8080
 *   ADMIN_USERNAME     — default: admin
 *   ADMIN_PASSWORD     — default: admin123456
 *   PARSED_EXAM_PATH   — default: data/jlpt-import/parsed/N4-2023-07.json
 *   EXAM_CODE          — default: N4-2023-07
 *   REPLACE_EXISTING   — default: true
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const backendUrl = process.env["BACKEND_URL"] ?? "http://localhost:8080";
const username = process.env["ADMIN_USERNAME"] ?? "admin";
const password = process.env["ADMIN_PASSWORD"] ?? "admin123456";
const parsedExamPath = resolve(
  process.env["PARSED_EXAM_PATH"] ??
    "data/jlpt-import/parsed/N4-2023-07.json"
);
const examCode = process.env["EXAM_CODE"] ?? "N4-2023-07";
const replaceExisting = (process.env["REPLACE_EXISTING"] ?? "true") !== "false";

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return data;
};

const run = async () => {
  console.log(`Reading parsed exam from: ${parsedExamPath}`);
  const parsedExam = JSON.parse(readFileSync(parsedExamPath, "utf-8"));

  if (!parsedExam.sections || parsedExam.sections.length === 0) {
    throw new Error("Parsed exam file has no sections");
  }

  if (parsedExam.validation && !parsedExam.validation.valid) {
    console.warn("\n⚠️ WARNING: The parsed exam contains validation issues (missing options or answers).");
    console.warn("Please check the parser output. Some questions may be incomplete.\n");
  }

  // Count importable questions for a pre-flight summary
  let totalQuestions = 0;
  for (const section of parsedExam.sections) {
    if (section.type === "LISTENING") continue; // skipped server-side
    for (const problem of section.problems ?? []) {
      totalQuestions += (problem.questions ?? []).length;
    }
  }

  console.log(`Exam: ${examCode}`);
  console.log(`Sections: ${parsedExam.sections.length} (LISTENING will be skipped)`);
  console.log(`Questions (non-listening): ${totalQuestions}`);
  console.log(`Explore replace existing: ${replaceExisting}`);
  console.log("");

  if (username === "admin" && password === "admin123456" && !process.env["ADMIN_PASSWORD"]) {
    console.warn("⚠️ WARNING: Using default admin credentials. Provide ADMIN_USERNAME and ADMIN_PASSWORD to override if needed.\n");
  }

  // Authenticate
  console.log(`Authenticating as '${username}'...`);
  const authResponse = await requestJson(`${backendUrl}/api/v1/auth/authenticate`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const token = authResponse?.data?.token;
  if (!token) {
    throw new Error("Cannot get admin token — check credentials");
  }
  console.log("Authentication successful.\n");

  // Send import request
  console.log(`Importing to ${backendUrl}/api/v1/admin/jlpt/import-parsed-exam ...`);
  const importPayload = {
    examCode,
    replaceExisting,
    sections: parsedExam.sections,
  };

  const result = await requestJson(
    `${backendUrl}/api/v1/admin/jlpt/import-parsed-exam`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(importPayload),
    }
  );

  console.log("\n=== Import Result ===");
  console.log(JSON.stringify(result, null, 2));

  const data = result?.data ?? result;
  if (data?.warnings?.length > 0) {
    console.log("\nWarnings:");
    for (const warning of data.warnings) {
      console.log("  ⚠", warning);
    }
  }

  console.log(`\nDone: ${data?.importedQuestions ?? "?"} questions imported into ${data?.importedSections ?? "?"} sections.`);
};

run().catch((error) => {
  console.error("\nError:", error.message);
  process.exit(1);
});
