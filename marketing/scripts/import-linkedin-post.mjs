#!/usr/bin/env node

import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONTENT_DIR = path.resolve("content/blog");
const IMAGE_DIR = path.resolve("static/img/thirdparty");
const AUTHOR = "Jason Smith";
const DEFAULT_IMAGE = "img/default.jpg";
const IMAGE_EXTENSIONS = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function usage() {
  return `
Usage:
  npm run import:linkedin -- --url <linkedin-url> --date <YYYY-MM-DD> --title <title> (--text <post> | --text-file <path>) [--image <path>] [--overwrite]

Examples:
  npm run import:linkedin -- --url "https://www.linkedin.com/posts/..." --date 2026-04-29 --title "My Post" --text-file ./post.txt --image ./post.png
  npm run import:linkedin -- --url "https://www.linkedin.com/posts/..." --date 2026-04-29 --title "My Post" --text "Post body"
`;
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--overwrite") {
      args.overwrite = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args[toCamelCase(key)] = value;
    index += 1;
  }

  return args;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function validateArgs(args) {
  const missing = [];

  for (const key of ["url", "date", "title"]) {
    if (!args[key]) {
      missing.push(`--${key}`);
    }
  }

  if (!args.text && !args.textFile) {
    missing.push("--text or --text-file");
  }

  if (args.text && args.textFile) {
    throw new Error("Use either --text or --text-file, not both.");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required argument(s): ${missing.join(", ")}`);
  }

  if (!/^https:\/\/(www\.)?linkedin\.com\//.test(args.url)) {
    throw new Error("--url must be a LinkedIn URL beginning with https://www.linkedin.com/ or https://linkedin.com/");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error("--date must use YYYY-MM-DD format.");
  }

  const parsedDate = new Date(`${args.date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== args.date) {
    throw new Error("--date is not a valid calendar date.");
  }
}

function slugify(title) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!slug) {
    throw new Error("The title did not produce a usable slug.");
  }

  return slug;
}

function escapeTomlString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function normalizeText(value) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  return normalized
    .split("\n")
    .map((line) => linkifyBareUrls(line.trimEnd()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function linkifyBareUrls(line) {
  return line.replace(/(^|[\s(])((https?:\/\/)[^\s<>()\]]+[^\s<>().,;\]:'"!?…”’])/g, (match, prefix, url) => {
    const beforeUrl = line.slice(0, line.indexOf(match) + prefix.length);

    if (beforeUrl.endsWith("](") || beforeUrl.endsWith('"') || beforeUrl.endsWith("'")) {
      return match;
    }

    return `${prefix}[${url}](${url})`;
  });
}

async function readPostText(args) {
  if (args.textFile) {
    return readFile(path.resolve(args.textFile), "utf8");
  }

  return args.text;
}

async function resolveImage(args, slug, overwrite) {
  if (!args.image) {
    return DEFAULT_IMAGE;
  }

  const sourcePath = path.resolve(args.image);
  const sourceStats = await stat(sourcePath);

  if (!sourceStats.isFile()) {
    throw new Error(`Image path is not a file: ${args.image}`);
  }

  const extension = path.extname(sourcePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported image extension "${extension}". Supported: ${[...IMAGE_EXTENSIONS].join(", ")}`);
  }

  await mkdir(IMAGE_DIR, { recursive: true });

  const imageFileName = `${slug}${extension}`;
  const destinationPath = path.join(IMAGE_DIR, imageFileName);

  if (!overwrite && await exists(destinationPath)) {
    throw new Error(`Image already exists: ${path.relative(process.cwd(), destinationPath)}. Use --overwrite to replace it.`);
  }

  await copyFile(sourcePath, destinationPath);

  return `img/thirdparty/${imageFileName}`;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function buildMarkdown({ title, date, url, image, body }) {
  return `+++
author = "${AUTHOR}"
title = "${escapeTomlString(title)}"
date = "${date}"
linkedin = "${escapeTomlString(url)}"
image = "${escapeTomlString(image)}"
+++

${body}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(usage());
    return;
  }

  validateArgs(args);

  const slug = `${args.date}-${slugify(args.title)}`;
  const postPath = path.join(CONTENT_DIR, `${slug}.md`);

  if (!args.overwrite && await exists(postPath)) {
    throw new Error(`Post already exists: ${path.relative(process.cwd(), postPath)}. Use --overwrite to replace it.`);
  }

  await mkdir(CONTENT_DIR, { recursive: true });

  const rawText = await readPostText(args);
  const body = normalizeText(rawText);

  if (!body) {
    throw new Error("Post body is empty after normalization.");
  }

  const image = await resolveImage(args, slug, Boolean(args.overwrite));
  const markdown = buildMarkdown({
    title: args.title,
    date: args.date,
    url: args.url,
    image,
    body,
  });

  await writeFile(postPath, markdown, "utf8");

  process.stdout.write(`Created ${path.relative(process.cwd(), postPath)}\n`);
  process.stdout.write(`Image: ${image}\n`);
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`);
  process.stderr.write(usage());
  process.exitCode = 1;
});
