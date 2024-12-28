import { notFound } from 'next/navigation';
import { fileUploads } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { Suspense } from 'react';
import OrcResult from '@/app/ui/OrcResult';
import OrcResultLoading from '@/app/ui/OrcResultLoading';

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
    <main className="bg-gray-50 p-4 flex flex-col md:flex-row gap-4 h-screen justify-around">
      <div className="">
        <div className="p-8 bg-white rounded-lg">
          <div className="h-96">
            <h3 className="text-lg font-medium">Uploaded File</h3>
            <Image
              src={publicPath}
              alt={fileUpload.filename}
              width={550}
              height={550}
              className="mt-2 rounded-md object-cover"
              priority
            />
          </div>
        </div>
      </div>
      <div className="">
        <Suspense fallback={<OrcResultLoading />}>
          <OrcResult fileUpload={fileUpload} />
        </Suspense>
      </div>
    </main>
  );
}
