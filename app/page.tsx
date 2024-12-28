'use client';

import { useState, useEffect } from 'react';
import { uploadFile } from './lib/actions';
import { createUser } from './lib/actions';

export default function FileUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    response: string;
    imagePath: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allCookies = document.cookie;
    console.log('allCookies', allCookies);
    // const hasSessionCookie = allCookies.includes('yourSessionCookieName=');

    // if (hasSessionCookie) {
    //   console.log('Session cookie is present');
    //   // Perform any logic if the user has a session
    // }
    // if (!session) {
    //   createUser();
    // }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);

    try {
      await uploadFile(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">File Upload</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Choose a file
          </label>
          <input
            type="file"
            id="file"
            name="file"
            required
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
