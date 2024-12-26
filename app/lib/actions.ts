'use server';

import { z } from 'zod';
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

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
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  const [result] = await client.labelDetection(
    path.join(process.cwd(), 'public', 'test.png')
  );
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels?.forEach((label) => console.log(label.description));
  //   const validatedFields = UploadFileFormSchema.safeParse({
  //     file: formData.get('file'),
  //   });
  //   console.log(validatedFields);
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
