import { put } from '@vercel/blob';

export async function saveFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileUploadId = crypto.randomUUID();
  const fileName = `${fileUploadId}.${file.type.split('/')[1]}`;

  const { url } = await put(fileName, buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
    contentType: file.type,
  });

  return {
    id: fileUploadId,
    filename: fileName,
    path: url,
  };
}
