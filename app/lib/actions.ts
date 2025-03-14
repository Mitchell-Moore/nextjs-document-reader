'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import {
  TextractClient,
  DetectDocumentTextCommand,
} from '@aws-sdk/client-textract';
import createClient, {
  AnalyzeFromUrlParameters,
} from '@azure-rest/ai-vision-image-analysis';
import { AzureKeyCredential } from '@azure/core-auth';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { db } from '../../db';
import { fileUploads, ocrResults } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { saveFile } from './utils';

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

  // Write the file to the server
  let fileUploadId;
  try {
    const { id, filename, path } = await saveFile(file);
    fileUploadId = id;
    const fileUpload = await db.insert(fileUploads).values({
      id: id,
      filename: filename,
      path: path,
    });
  } catch (error) {
    console.error('Error saving the file:', error);
    throw new Error('Error saving the file');
  }

  if (!fileUploadId) {
    throw new Error('Failed to save the file');
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

  let response;
  if (model === 'google-vision') {
    response = await googleVisionOcr(fileUpload.path);
  } else if (model === 'aws-textract') {
    response = await awsTextractOcr(fileUpload.path);
  } else if (model === 'azure-vision') {
    response = await azureVisionOcr(fileUpload.path);
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

  const fileResponse = await fetch(filePath);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file`);
  }

  // 3. Convert the response into an ArrayBuffer, then into a Buffer
  const arrayBuffer = await fileResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Create the Textract command with the file bytes
  const command = new DetectDocumentTextCommand({
    Document: {
      Bytes: buffer, // <== The file data
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

  const options = {
    body: {
      url: filePath,
    },
    queryParameters: {
      features: ['Caption', 'Read'],
    },
  } as AnalyzeFromUrlParameters;
  const result = await client.path('/imageanalysis:analyze').post(options);

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
