#!/usr/bin/env node

import { readFileSync } from "node:fs";

const backendUrl = process.env["BACKEND_URL"] ?? "http://localhost:8080";
const username = process.env["ADMIN_USERNAME"] ?? "admin";
const password = process.env["ADMIN_PASSWORD"] ?? "admin123456";
const manifestPath =
  process.env["JLPT_MANIFEST_PATH"] ??
  "/home/thuanc177/Documents/Git/miraigo/miraigo-fe/data/jlpt-import/manifest.recent.json";

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
  readFileSync(manifestPath, "utf-8");

  const authResponse = await requestJson(`${backendUrl}/api/v1/auth/authenticate`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const token = authResponse?.data?.token;
  if (!token) {
    throw new Error("Cannot get admin token");
  }

  const result = await requestJson(`${backendUrl}/api/v1/admin/jlpt/import-manifest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      manifestPath,
      overwriteExisting: false,
    }),
  });

  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
