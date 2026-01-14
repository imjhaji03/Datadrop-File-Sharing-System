'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FileDownload from '@/components/FileDownload';
import InviteCode from '@/components/InviteCode';
import axios from 'axios';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [uploadError, setUploadError] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      setPort(response.data.port);
      setUploadError('');
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          setUploadError('Upload timed out. Please check your connection and try again.');
        } else if (error.response) {
          setUploadError(`Server error: ${error.response.status}. ${error.response.data?.message || 'Please try again.'}`);
        } else if (error.request) {
          setUploadError('Cannot reach the server. Please make sure the backend is running on port 8080.');
        } else {
          setUploadError('Failed to upload file. Please try again.');
        }
      } else {
        setUploadError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (port: number) => {
    setIsDownloading(true);
    setDownloadError('');

    try {
      // Request download from Java backend
      const response = await axios.get(`/api/download/${port}`, {
        responseType: 'blob',
        timeout: 60000, // 60 second timeout for downloads
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from response headers
      // Axios normalizes headers to lowercase, but we need to handle different cases
      const headers = response.headers;
      let contentDisposition = '';

      // Look for content-disposition header regardless of case
      for (const key in headers) {
        if (key.toLowerCase() === 'content-disposition') {
          contentDisposition = headers[key];
          break;
        }
      }

      let filename = 'downloaded-file';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up object URL
      window.URL.revokeObjectURL(url);
      setDownloadError('');
    } catch (error: unknown) {
      console.error('Error downloading file:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          setDownloadError('Download timed out. Please try again.');
        } else if (error.response?.status === 404) {
          setDownloadError('Invalid invite code or file no longer available.');
        } else if (error.response?.status === 500) {
          setDownloadError('Server error. Please try again later.');
        } else if (error.request) {
          setDownloadError('Cannot reach the server. Make sure the backend is running.');
        } else {
          setDownloadError('Failed to download file. Please check the invite code.');
        }
      } else {
        setDownloadError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Datadrop</h1>
        <p className="text-xl text-gray-600">Connect & Share</p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => {
              setActiveTab('upload');
              setDownloadError('');
            }}
          >
            Share a File
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'download'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => {
              setActiveTab('download');
              setUploadError('');
            }}
          >
            Receive a File
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />

            {uploadedFile && !isUploading && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Selected file: <span className="font-medium">{uploadedFile.name}</span> ({Math.round(uploadedFile.size / 1024)} KB)
                </p>
              </div>
            )}

            {isUploading && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Uploading file...</p>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            <InviteCode port={port} />
          </div>
        ) : (
          <div>
            <FileDownload onDownload={handleDownload} isDownloading={isDownloading} />

            {isDownloading && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Downloading file...</p>
              </div>
            )}

            {downloadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{downloadError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Datadrop &copy; {new Date().getFullYear()} - Connect & Share</p>
      </footer>
    </div>
  );
}
