'use client';

import { useState } from 'react';
import { uploadFile } from './lib/actions';
import ModelSelector from './ui/ModelSelector';

export default function FileUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const models = [
    { model: 'google-vision', label: 'Google Vision' },
    { model: 'azure-vision', label: 'Azure Vision' },
    { model: 'aws-textract', label: 'AWS Textract' },
  ];
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [file, setFile] = useState<File | null>(null);
  const uploadFileOnSubmit = uploadFile.bind(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB, for example

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Retrieve the dropped files
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds the maximum limit of 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setFile(file);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the maximum limit of 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', selectedModel.model);

    setIsUploading(true);

    try {
      await uploadFileOnSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-end mb-6">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelect={(model) => {
              setSelectedModel(model);
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Extract Text from Images
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload any image containing text and our advanced OCR technology
            will extract and digitize the content for you. Perfect for
            documents, receipts, business cards, and more.
          </p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col space-y-1.5 py-3">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Upload Image
            </h3>
            <p className="text-sm text-gray-600">
              Supported formats: PNG, JPG, JPEG, WEBP. Max file size: 5MB
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full"
            name="file-upload-form"
            id="file-upload-form"
          >
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 w-full text-center hover:border-gray-400 transition-colors cursor-pointer"
                style={{
                  borderColor: isDragging
                    ? 'border-color: rgb(156 163 175 / var(--tw-border-opacity, 1))'
                    : '',
                }}
                onClick={() => {
                  document.getElementById('file')?.click();
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-8 w-8 text-gray-600"
                    strokeWidth={2}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" x2="12" y1="3" y2="15"></line>
                  </svg>
                  {file ? (
                    <div className="text-gray-600 text-sm">
                      {file.name} - {file.size} bytes
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-600">
                        Choose a file or drag and drop
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                id="file"
                name="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                }}
              />

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-800 text-gray-100 hover:bg-gray-700 h-11 rounded-md px-8 w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
                </svg>
                {isUploading ? 'Uploading...' : 'Upload & Extract Text'}
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
