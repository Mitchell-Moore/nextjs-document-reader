'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const UploadFileFormSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file.' }),
});

// export async function uploadFile(formData: FormData) {
//   const validatedFields = UploadFileFormSchema.safeParse({
//     file: formData.get('file'),
//   });

//   console.log(formData);

//   if (!validatedFields.success) {
//     throw new Error(
//       'Validation failed: ' + JSON.stringify(validatedFields.error.issues)
//     );
//   }

//   const file = formData.get('file') as File;
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = new Uint8Array(arrayBuffer);

//   console.log(file.type);
//   const uuid = crypto.randomUUID();
//   const fileName = `${uuid}.${file.type.split('/')[1]}`;

//   const filePath = path.join(process.cwd(), 'app/files/uploads/', fileName);

//   fs.writeFileSync(filePath, buffer);

//   redirect(`/submissions/${uuid}`);
// }

export async function handleOcr(formData: FormData) {
  const fileName = path.join(process.cwd(), 'app/lib/', 'test.png');
  return await googleVisionOcr(fileName);
}

async function googleVisionOcr(fileName: string) {
  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Performs text detection on the local file
  const [result] = await client.textDetection(fileName);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections?.forEach((text) => console.log(text));
  if (detections && detections.length > 0) {
    return detections[0].description ?? '';
  }
  return '';
}

export async function uploadFileAndHandleOcr(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  // Create a unique filename
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uuid = crypto.randomUUID();
  const fileName = `${uuid}.${file.type.split('/')[1]}`;
  const path = join(process.cwd(), 'app', 'files', 'uploads', fileName);

  // Write the file to the server
  try {
    await writeFile(path, buffer);
    console.log(`Uploaded file saved at ${path}`);
  } catch (error) {
    console.error('Error saving the file:', error);
    throw new Error('Error saving the file');
  }

  // Make a request to the external service
  try {
    const response = await googleVisionOcr(path);
    return { success: true, response };
  } catch (error) {
    console.error('Error notifying external service:', error);
    throw new Error('Error notifying external service');
  }
}
