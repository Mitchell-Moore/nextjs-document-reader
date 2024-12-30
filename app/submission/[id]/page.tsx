import { notFound } from 'next/navigation';
import { fileUploads } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { Suspense } from 'react';
import OrcResult from '@/app/ui/OrcResult';
import OrcResultLoading from '@/app/ui/OrcResultLoading';

export default async function Page(props: {
  params: Promise<{
    id: string;
    searchParams?: {
      model?: string;
    };
  }>;
}) {
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-white shadow-lg border border-gray-200 rounded-lg">
          <div className="">
            <h2 className="text-lg font-semibold mb-4">Uploaded File</h2>
            <Image
              src={publicPath}
              alt={fileUpload.filename}
              width={550}
              height={550}
              className=" w-full h-full object-cover"
              priority
            />
          </div>
        </div>
        <div className="p-6 bg-white  shadow-lg border border-gray-200 rounded-lg">
          <Suspense fallback={<OrcResultLoading />}>
            <OrcResult
              fileUpload={fileUpload}
              model={params.searchParams?.model || 'google-vision'}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
