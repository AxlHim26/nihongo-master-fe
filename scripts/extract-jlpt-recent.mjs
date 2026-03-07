#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SOURCE_DIR = process.env["JLPT_SOURCE_DIR"] ?? "/home/thuanc177/Documents/JLPTTest";
const OUTPUT_DIR = process.env["JLPT_OUTPUT_DIR"] ?? "data/jlpt-import";
const MIN_YEAR = Number.parseInt(process.env["JLPT_MIN_YEAR"] ?? "2010", 10);
const MAX_FILES = Number.parseInt(process.env["JLPT_MAX_FILES"] ?? "0", 10);
const INCLUDE_IMAGES = (process.env["JLPT_INCLUDE_IMAGES"] ?? "false").toLowerCase() === "true";
const INCLUDE_ATTACHMENTS = (process.env["JLPT_INCLUDE_ATTACHMENTS"] ?? "false").toLowerCase() === "true";

const supportedLevels = new Set(["N1", "N2", "N3", "N4", "N5"]);
const audioExtensions = new Set([".mp3", ".m4a", ".wav", ".ogg"]);
const textExtensions = new Set([".txt"]);

const walkFiles = (dir) => {
  const stack = [dir];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of readdirSync(current)) {
      const absolutePath = join(current, entry);
      const stats = statSync(absolutePath);
      if (stats.isDirectory()) {
        stack.push(absolutePath);
      } else {
        files.push(absolutePath);
      }
    }
  }

  return files;
};

const extractYear = (input) => {
  const match = input.match(/(20\d{2}|19\d{2})/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
};

const detectLevel = (relativePath) => {
  const segments = relativePath.split("/");
  for (const segment of segments) {
    const upper = segment.toUpperCase();
    if (supportedLevels.has(upper)) {
      return upper;
    }
  }
  return null;
};

const isRecentPdf = (relativePath) => {
  if (extname(relativePath).toLowerCase() !== ".pdf") {
    return false;
  }

  const level = detectLevel(relativePath);
  if (!level) {
    return false;
  }

  const year = extractYear(relativePath);
  return typeof year === "number" && year >= MIN_YEAR;
};

const isRecentAudioOrText = (relativePath) => {
  const extension = extname(relativePath).toLowerCase();
  if (!audioExtensions.has(extension) && !textExtensions.has(extension)) {
    return false;
  }

  const level = detectLevel(relativePath);
  if (!level) {
    return false;
  }

  const year = extractYear(relativePath);
  return typeof year === "number" && year >= MIN_YEAR;
};

const runCommand = (command, args) => {
  return spawnSync(command, args, {
    encoding: "utf-8",
    stdio: "pipe",
  });
};

const ensureParentDir = (path) => {
  mkdirSync(dirname(path), { recursive: true });
};

const extractPdfText = (absolutePdfPath, txtOutputPath) => {
  ensureParentDir(txtOutputPath);
  const result = runCommand("pdftotext", ["-layout", absolutePdfPath, txtOutputPath]);

  if (result.status !== 0) {
    return { ok: false, stderr: result.stderr.trim() };
  }

  const content = readFileSync(txtOutputPath, "utf-8");
  const charCount = content.length;
  const formFeedCount = (content.match(/\f/g) ?? []).length;
  const cjkCount = (content.match(/[\u3040-\u30ff\u3400-\u9fff]/g) ?? []).length;
  const noisyWatermarkHits = ["Yuuki", "Ngoại", "Bù Gro"].reduce(
    (sum, token) => sum + (content.match(new RegExp(token, "gi")) ?? []).length,
    0,
  );

  const quality =
    charCount < 400 ? "very_low_text" : cjkCount / Math.max(1, charCount) < 0.02 ? "low_text_ratio" : "usable";

  return {
    ok: true,
    charCount,
    formFeedCount,
    cjkRatio: Number((cjkCount / Math.max(1, charCount)).toFixed(4)),
    noisyWatermarkHits,
    quality,
  };
};

const extractPdfImages = (absolutePdfPath, imageOutputPrefix) => {
  ensureParentDir(imageOutputPrefix);
  const result = runCommand("pdfimages", ["-all", absolutePdfPath, imageOutputPrefix]);
  return {
    ok: result.status === 0,
    stderr: result.stderr.trim(),
  };
};

const listAttachments = (absolutePdfPath) => {
  const result = runCommand("pdfdetach", ["-list", absolutePdfPath]);
  return {
    ok: result.status === 0,
    output: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
};

const normalizeRelativePath = (path) => path.replaceAll("\\", "/");

const run = () => {
  const absoluteSourceDir = resolve(SOURCE_DIR);
  const absoluteOutputDir = resolve(OUTPUT_DIR);

  const allFiles = walkFiles(absoluteSourceDir);
  const pdfFilesRaw = allFiles
    .map((path) => normalizeRelativePath(relative(absoluteSourceDir, path)))
    .filter(isRecentPdf)
    .sort();

  const pdfFiles = MAX_FILES > 0 ? pdfFilesRaw.slice(0, MAX_FILES) : pdfFilesRaw;

  const mediaFiles = allFiles
    .map((path) => normalizeRelativePath(relative(absoluteSourceDir, path)))
    .filter(isRecentAudioOrText)
    .sort();

  const results = [];

  for (const pdfRelativePath of pdfFiles) {
    const absolutePdfPath = join(absoluteSourceDir, pdfRelativePath);
    const level = detectLevel(pdfRelativePath);
    const year = extractYear(pdfRelativePath);
    const baseName = pdfRelativePath
      .replaceAll("/", "__")
      .replace(/\.pdf$/i, "");

    const textOutputPath = join(absoluteOutputDir, "text", `${baseName}.txt`);
    const imageOutputPrefix = join(absoluteOutputDir, "images", `${baseName}_img`);

    const textResult = extractPdfText(absolutePdfPath, textOutputPath);
    const imageResult = INCLUDE_IMAGES
      ? extractPdfImages(absolutePdfPath, imageOutputPrefix)
      : { ok: true, skipped: true, stderr: "" };

    const attachmentResult = INCLUDE_ATTACHMENTS
      ? listAttachments(absolutePdfPath)
      : { ok: true, skipped: true, output: "", stderr: "" };

    results.push({
      sourcePath: pdfRelativePath,
      level,
      year,
      textOutputPath: normalizeRelativePath(relative(process.cwd(), textOutputPath)),
      imageOutputPrefix: normalizeRelativePath(relative(process.cwd(), imageOutputPrefix)),
      text: textResult,
      images: imageResult,
      attachments: attachmentResult,
    });
  }

  const mediaRecords = mediaFiles.map((relativePath) => {
    const extension = extname(relativePath).toLowerCase();
    const level = detectLevel(relativePath);
    const year = extractYear(relativePath);

    return {
      sourcePath: relativePath,
      level,
      year,
      type: audioExtensions.has(extension) ? "audio" : "text",
      extension,
    };
  });

  const mediaSummaryByLevel = [...supportedLevels]
    .map((level) => {
      const levelRecords = mediaRecords.filter((item) => item.level === level);
      return {
        level,
        audio: levelRecords.filter((item) => item.type === "audio").length,
        text: levelRecords.filter((item) => item.type === "text").length,
      };
    })
    .filter((item) => item.audio > 0 || item.text > 0);

  const summary = {
    sourceDir: absoluteSourceDir,
    outputDir: absoluteOutputDir,
    minYear: MIN_YEAR,
    maxFiles: MAX_FILES,
    includeImages: INCLUDE_IMAGES,
    includeAttachments: INCLUDE_ATTACHMENTS,
    totalPdfs: results.length,
    discoveredPdfs: pdfFilesRaw.length,
    usableText: results.filter((item) => item.text.ok && item.text.quality === "usable").length,
    lowText: results.filter((item) => item.text.ok && item.text.quality !== "usable").length,
    failedText: results.filter((item) => !item.text.ok).length,
    mediaRecords: mediaRecords.length,
    mediaSummaryByLevel,
  };

  mkdirSync(absoluteOutputDir, { recursive: true });

  const manifestPath = join(absoluteOutputDir, "manifest.recent.json");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        summary,
        files: results,
        mediaFiles: mediaRecords,
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Manifest: ${manifestPath}`);
};

run();
