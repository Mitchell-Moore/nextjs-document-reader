import { notFound } from 'next/navigation';
import { ocrResults } from '@/db/schema';
import { db } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { handleOcr } from '../lib/actions';
import { fileUploads } from '@/db/schema';

export default async function OrcResult(props: {
  fileUpload: typeof fileUploads.$inferSelect;
}) {
  const id = props.fileUpload.id;

  const orcResult = await db.query.ocrResults.findFirst({
    where: eq(ocrResults.fileUploadId, id),
    orderBy: desc(ocrResults.processedAt),
  });

  if (!orcResult) {
    const orcResult = await handleOcr(id);
  }

  return orcResult ? (
    <div className="">
      Result:
      <pre className="whitespace-pre-wrap">{orcResult.text}</pre>
    </div>
  ) : (
    <div className="">Error...</div>
  );
}
