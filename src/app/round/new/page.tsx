'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { FiArrowLeft, FiList, FiClipboard } from 'react-icons/fi';

const NewRound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">New Round</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Basic Round Option */}
        <div 
          onClick={() => router.push('/round/basic')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <FiClipboard className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Basic Round</h2>
              <p className="text-gray-600">Quick entry of your total score and key stats.</p>
            </div>
          </div>
        </div>

        {/* Hole by Hole Option */}
        <div 
          onClick={() => router.push('/round/detailed')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <FiList className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Hole by Hole</h2>
              <p className="text-gray-600">Detailed entry for each hole including strokes, putts, and accuracy.</p>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 mt-6">
            <p>
              Looking to speed up your round entry? Try our new scanning option.{' '}
              <button
                onClick={() => router.push('/scan-card')}
                className="text-green-600 hover:underline focus:outline-none"
              >
                Click here
              </button>.
            </p>
          </div>
      </div>
    </div>
  );
};

export default NewRound; 