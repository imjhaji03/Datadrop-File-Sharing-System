'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function FileUpload({ onFileUpload, isUploading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 100MB.');
      } else {
        setError('File was rejected. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size === 0) {
        setError('Cannot upload empty file.');
        return;
      }
      onFileUpload(file);
      setError('');
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <FiUpload className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-lg font-medium">Drag & drop a file here, or click to select</p>
          <p className="text-sm text-gray-500">
            Share any file with your peers securely (max 100MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
