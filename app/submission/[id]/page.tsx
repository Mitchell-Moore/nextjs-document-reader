import { notFound } from 'next/navigation';
import { fileUploads } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { Suspense } from 'react';
import OrcResult from '../../ui/OrcResult';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  console.log('here', id);
  const fileUpload = await db.query.fileUploads.findFirst({
    where: eq(fileUploads.id, id),
  });

  if (!fileUpload) {
    notFound();
  }
  const publicPath = `/uploads/${fileUpload.filename}`;

  return (
    <main>
      <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
        <p>Image uploaded successfully!</p>
        <div>
          Response:
          {/* <pre className="whitespace-pre-wrap">{result.response}</pre> */}
        </div>
        <div className="mt-4">
          <Image
            src={publicPath}
            alt="Uploaded image"
            width={300}
            height={300}
            className="rounded-md object-cover"
          />
        </div>
      </div>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <OrcResult fileUpload={fileUpload} />
        </Suspense>
      </div>
    </main>
  );
}
