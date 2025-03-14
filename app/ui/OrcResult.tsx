import { ocrResults } from '@/db/schema';
import { db } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { handleOcr } from '../lib/actions';
import { fileUploads } from '@/db/schema';

export default async function OrcResult(props: {
  fileUpload: typeof fileUploads.$inferSelect;
  model: string;
}) {
  const id = props.fileUpload.id;

  let orcResult = await db.query.ocrResults.findFirst({
    where: eq(ocrResults.fileUploadId, id),
    orderBy: desc(ocrResults.processedAt),
  });

  const model = props.model;

  if (!orcResult) {
   try {
     orcResult = await handleOcr(id, model);
   } catch (error) {
     return (
       <div className="text-red-600">
         <h2 className="text-lg font-semibold mb-4">Error</h2>
         <p className="text-sm">
           {error instanceof Error ? error.message : 'Failed to process image'}
         </p>
       </div>
     );
   }
  }

  return orcResult ? (
    <div>
      <h2 className="text-lg font-semibold mb-4">Result</h2>
      <pre className="whitespace-pre-wrap text-sm font-sans text-gray-800 max-h-96 py-2 overflow-y-auto">
        {orcResult.text}
      </pre>
    </div>
  ) : (
    <div className="">Error...</div>
  );
}
