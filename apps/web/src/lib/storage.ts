import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const allowedAudioExtensions = new Set(["mp3", "m4a", "wav", "aac", "webm", "ogg", "mp4"]);

export async function persistImageUpload(file: File | null | undefined) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, SVG, or GIF image.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filename = `${Date.now()}-${nanoid(10)}.${extension}`;
  const relativeDir = "/uploads";
  const outputDir = path.join(process.cwd(), "public", relativeDir);
  const outputPath = path.join(outputDir, filename);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return `${relativeDir}/${filename}`;
}

export async function persistAudioUpload(file: File | null | undefined) {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "m4a";

  if (!file.type.startsWith("audio/") && !allowedAudioExtensions.has(extension)) {
    throw new Error("Please upload an audio file such as MP3, M4A, WAV, AAC, OGG, or WEBM.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${nanoid(10)}.${extension}`;
  const relativeDir = "/uploads/audio";
  const outputDir = path.join(process.cwd(), "public", relativeDir);
  const outputPath = path.join(outputDir, filename);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return `${relativeDir}/${filename}`;
}
