#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

const DEFAULT_LIMIT_BYTES = 64 * 1024 * 1024;
const limitEnv = process.env.CF_WORKER_SIZE_LIMIT_BYTES;
const sizeLimit = limitEnv ? Number(limitEnv) : DEFAULT_LIMIT_BYTES;

if (Number.isNaN(sizeLimit) || sizeLimit <= 0) {
  console.error(
    `Invalid CF_WORKER_SIZE_LIMIT_BYTES value: ${process.env.CF_WORKER_SIZE_LIMIT_BYTES}`
  );
  process.exit(1);
}

const targets = [
  {
    label: "default server function bundle",
    targetPath: ".open-next/server-functions/default",
    type: "dir",
  },
  {
    label: "worker entrypoint",
    targetPath: ".open-next/worker.js",
    type: "file",
  },
];

function toHuman(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
    } else if (entry.isFile()) {
      const { size } = await fs.stat(entryPath);
      files.push({ size, relativePath: path.relative(process.cwd(), entryPath) });
    }
  }
  return files;
}

async function gatherTargetInfo(target) {
  const resolved = path.resolve(target.targetPath);
  const exists = await pathExists(resolved);
  if (!exists) {
    console.error(
      `Missing build artifact: ${target.targetPath}. Run \`npm run cf:build\` before executing this check.`
    );
    process.exit(1);
  }

  if (target.type === "file") {
    const { size } = await fs.stat(resolved);
    return {
      label: target.label,
      totalSize: size,
      files: [{ size, relativePath: path.relative(process.cwd(), resolved) }],
    };
  }

  const files = await walkFiles(resolved);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return { label: target.label, totalSize, files };
}

const failures = [];

const summaries = await Promise.all(targets.map(gatherTargetInfo));

for (const summary of summaries) {
  if (summary.totalSize > sizeLimit) {
    failures.push(
      `${summary.label} exceeds ${toHuman(sizeLimit)} (total ${toHuman(summary.totalSize)})`
    );
  }
  const largest = [...summary.files].sort((a, b) => b.size - a.size)[0];
  if (largest && largest.size > sizeLimit) {
    failures.push(
      `${summary.label} includes a single file above the limit: ${largest.relativePath} (${toHuman(
        largest.size
      )})`
    );
  }
}

if (failures.length > 0) {
  console.error("Worker size check failed:");
  for (const message of failures) {
    console.error(` - ${message}`);
  }
  console.error("\nTop 10 largest files:");
  const aggregatedFiles = summaries.flatMap((summary) => summary.files);
  const topFive = aggregatedFiles.sort((a, b) => b.size - a.size).slice(0, 10);
  for (const file of topFive) {
    console.error(` - ${file.relativePath} (${toHuman(file.size)})`);
  }
  process.exit(1);
}

console.log("Worker size check passed.");
