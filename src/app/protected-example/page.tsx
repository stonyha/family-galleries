'use client';

import withPageAuthRequired from '@/utils/withPageAuthRequired';
import { ReactElement } from 'react';

function ProtectedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-amber-600 mb-4">Protected Page</h1>
        <p className="text-gray-700 mb-4">
          This is a protected page that can only be accessed by authenticated users.
        </p>
        <p className="text-gray-700">
          It uses the <code className="bg-gray-100 px-2 py-1 rounded text-sm">withPageAuthRequired</code> Higher Order Component.
        </p>
      </div>
    </div>
  );
}

export default withPageAuthRequired(ProtectedPage, {
  onRedirecting: (): ReactElement => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  ),
  onError: (error): ReactElement => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-red-100 p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-red-700 mb-4">Authentication Error</h1>
        <p className="text-red-700">{error.message}</p>
      </div>
    </div>
  ),
}); 