'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { db } from '../../db';
import { fileUploads, ocrResults } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Create a unique filename
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileUploadId = crypto.randomUUID();
  const fileName = `${fileUploadId}.${file.type.split('/')[1]}`;
  const path = join(process.cwd(), 'public', 'uploads', fileName);
  const publicPath = `/uploads/${fileName}`;

  // Write the file to the server
  try {
    await writeFile(path, buffer);
    console.log(`Uploaded file saved at ${path}`);
    const fileUpload = await db.insert(fileUploads).values({
      id: fileUploadId,
      filename: fileName,
      path: publicPath,
    });
  } catch (error) {
    console.error('Error saving the file:', error);
    throw new Error('Error saving the file');
  }

  redirect(`/submission/${fileUploadId}`);
}

export async function handleOcr(fileUploadId: string) {
  if (!fileUploadId) {
    throw new Error('No fileUploadId provided');
  }

  const fileUpload = await db.query.fileUploads.findFirst({
    where: eq(fileUploads.id, fileUploadId),
  });

  if (!fileUpload) {
    throw new Error('FileUpload not found');
  }

  const filePath = path.join(process.cwd(), 'public', fileUpload.path);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const response = await googleVisionOcr(filePath);

  const ocrResultInsert = (await db
    .insert(ocrResults)
    .values({
      fileUploadId: fileUploadId,
      text: response,
      model: 'google-vision',
    })
    .$returningId()) as { id: string }[];

  if (!ocrResultInsert || !ocrResultInsert[0]) {
    throw new Error('Failed to create ocrResult');
  }

  const ocrResult = await db.query.ocrResults.findFirst({
    where: eq(ocrResults.id, ocrResultInsert[0].id),
  });

  return ocrResult;
}

async function googleVisionOcr(filePath: string) {
  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Performs text detection on the local file
  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations;
  detections?.forEach((text) => console.log(text));
  if (detections && detections.length > 0) {
    return detections[0].description ?? '';
  }
  throw new Error('Ocr failed');
}
