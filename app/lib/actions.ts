'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

const UploadFileFormSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file.' }),
});

export async function uploadFile(formData: FormData) {
  const validatedFields = UploadFileFormSchema.safeParse({
    file: formData.get('file'),
  });

  console.log(validatedFields);

  //   if (!validatedFields.success) {
  //     return {
  //       errors: validatedFields.error.flatten().fieldErrors,
  //       message: 'Missing Fields. Failed to Create Invoice.',
  //     };
  //   }

  //   const { customerId, amount, status } = validatedFields.data;
  //   const amountInCents = amount * 100;
  //   const date = new Date().toISOString().split('T')[0];

  //   try {
  //     await sql`
  //       INSERT INTO invoices (customer_id, amount, status, date)
  //       VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  //     `;
  //   } catch (error) {
  //     throw new Error('Failed to Create Invoice');
  //   }

  //   revalidatePath('/dashboard/invoices');
  //   redirect('/dashboard/invoices');
}

export async function handleOcr(formData: FormData) {
  console.log('OCR');
  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';
  const fileName = path.join(process.cwd(), 'app/lib/', 'test.png');
  console.log(fileName);
  // Performs text detection on the local file
  const [result] = await client.textDetection(fileName);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections?.forEach((text) => console.log(text));
}
