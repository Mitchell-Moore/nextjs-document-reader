'use server';

import { z } from 'zod';

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
