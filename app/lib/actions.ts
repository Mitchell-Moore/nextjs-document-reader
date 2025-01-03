'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import {
  TextractClient,
  DetectDocumentTextCommand,
} from '@aws-sdk/client-textract';
import createClient, {
  ImageAnalysisClient,
} from '@azure-rest/ai-vision-image-analysis';
import { AzureKeyCredential } from '@azure/core-auth';
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
  const model = formData.get('model') as string;

  if (!file) {
    throw new Error('No file uploaded');
  }

  if (!model) {
    throw new Error('No model selected');
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
    const fileUpload = await db.insert(fileUploads).values({
      id: fileUploadId,
      filename: fileName,
      path: publicPath,
    });
  } catch (error) {
    console.error('Error saving the file:', error);
    throw new Error('Error saving the file');
  }

  redirect(`/submission/${fileUploadId}?model=${model}`);
}

export async function handleOcr(fileUploadId: string, model: string) {
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

  let response;
  if (model === 'google-vision') {
    response = await googleVisionOcr(filePath);
  } else if (model === 'aws-textract') {
    response = await awsTextractOcr(filePath);
  } else if (model === 'azure-vision') {
    response = await azureVisionOcr(filePath);
  } else {
    throw new Error('Model not found');
  }

  const ocrResultId = crypto.randomUUID();

  const ocrResultInsert = await db.insert(ocrResults).values({
    id: ocrResultId,
    fileUploadId: fileUploadId,
    text: response,
    model: model,
  });

  if (!ocrResultInsert) {
    throw new Error('Failed to create ocrResult');
  }

  const ocrResult = await db.query.ocrResults.findFirst({
    where: eq(ocrResults.id, ocrResultId),
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
  if (detections && detections.length > 0) {
    return detections[0].description ?? '';
  }
  return 'Google Vision could not detect text';
}

async function awsTextractOcr(filePath: string) {
  const client = new TextractClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const fileData = fs.readFileSync(filePath);

  // Send command to Textract
  const command = new DetectDocumentTextCommand({
    Document: {
      Bytes: fileData,
    },
  });

  const response = await client.send(command);
  console.log('Textract response:', response.Blocks);
  const text = response.Blocks?.map((block) => block.Text).join(' ');
  if (!text) {
    return 'AWS Textract could not detect text';
  }
  return text;
}

async function azureVisionOcr(filePath: string) {
  const client = createClient(
    process.env.AZURE_VISION_ENDPOINT!,
    new AzureKeyCredential(process.env.AZURE_VISION_KEY!)
  );

  const fileData = fs.readFileSync(filePath);

  const result = await client.path('/imageanalysis:analyze').post({
    body: fileData,
    queryParameters: {
      features: ['Caption', 'Read'],
    },
    contentType: 'application/octet-stream',
  });

  const iaResult = result.body;
  console.log('iaResult', iaResult);
  console.log('iaResult', iaResult);

  if ('error' in iaResult) {
    throw new Error('Azure Vision Ocr failed');
  }

  if ('readResult' in iaResult) {
    const text = iaResult.readResult?.blocks
      .map((block) => block.lines.map((line) => line.text).join(' '))
      .join(' ');
    if (!text) {
      if ('captionResult' in iaResult) {
        return (
          'Azure Vision could not detect text but it did caption it: ' +
          iaResult.captionResult?.text
        );
      }
      return 'Azure Vision could not detect text';
    }
    return text;
  }

  throw new Error('Azure Vision Ocr failed');
}
