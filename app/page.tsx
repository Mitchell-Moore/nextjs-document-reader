'use client';

import { useRef, useState } from 'react';
import { uploadFile } from './lib/actions';

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form ref={formRef} action={uploadFile}>
          <input
            type="file"
            accept="image/*"
            name="file"
            onChange={handleFileChange}
          />
        </form>
      </main>
    </div>
  );
}
