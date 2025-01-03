import { notFound } from 'next/navigation';
import { fileUploads } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { Suspense } from 'react';
import OrcResult from '@/app/ui/OrcResult';
import OrcResultLoading from '@/app/ui/OrcResultLoading';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string }>;
}) {
  const id = (await params).id;
  let model = (await searchParams).model;
  if (!model) {
    model = 'google-vision';
  }
  model = model as string;
  const fileUpload = await db.query.fileUploads.findFirst({
    where: eq(fileUploads.id, id),
  });

  if (!fileUpload) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-white shadow-lg border border-gray-200 rounded-lg">
          <div className="">
            <h2 className="text-lg font-semibold mb-4">Uploaded File</h2>
            <Image
              src={fileUpload.path}
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
            <OrcResult fileUpload={fileUpload} model={model} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
