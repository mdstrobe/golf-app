'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiArrowLeft, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HoleData {
  score: number | null;
  putts: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
}

interface ScoreCardData {
  courseName: string | null;
  date: string | null;
  holes: HoleData[];
}

const ScanCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<ScoreCardData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-scorecard', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze scorecard');
      }

      const data = await response.json();
      setAnalyzedData(data);
    } catch (error) {
      console.error('Error processing scorecard:', error);
      alert('Failed to analyze scorecard. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRound = async () => {
    if (!analyzedData) return;

    setIsSaving(true);
    try {
      // Calculate totals
      const totalScore = analyzedData.holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = analyzedData.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = analyzedData.holes.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = analyzedData.holes.filter(hole => hole.greenInRegulation).length;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('rounds').insert({
        user_id: userData.user.id,
        course_name: analyzedData.courseName,
        date_played: analyzedData.date || new Date().toISOString().split('T')[0],
        total_score: totalScore,
        total_putts: totalPutts,
        fairways_hit: fairwaysHit,
        greens_in_regulation: greensInRegulation,
        hole_data: analyzedData.holes
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving round:', error);
      alert('Failed to save round. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setAnalyzedData(null);
  };

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
          <h1 className="text-xl font-bold text-gray-800">Scan Scorecard</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {!analyzedData ? (
          // Upload UI
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-2">Upload Scorecard</h2>
            <p className="text-gray-600 mb-6">Upload a photo of your scorecard for automatic processing.</p>
            
            <div className="mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-green-600 hover:text-green-700">Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                      />
                    </label>
                    <p className="text-gray-500">or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                  <span className="text-gray-600">Processing...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Preview UI
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Analyzed Results</h2>
                  <p className="text-gray-600">Please verify the information below</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <p className="mt-1 text-lg">{analyzedData.courseName || 'Not detected'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Played</label>
                  <p className="mt-1 text-lg">{analyzedData.date || 'Not detected'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Score Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Score</label>
                  <p className="mt-1 text-lg">
                    {analyzedData.holes.reduce((sum, hole) => sum + (hole.score || 0), 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Putts</label>
                  <p className="mt-1 text-lg">
                    {analyzedData.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fairways Hit</label>
                  <p className="mt-1 text-lg">
                    {analyzedData.holes.filter(hole => hole.fairwayHit).length}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Greens in Regulation</label>
                  <p className="mt-1 text-lg">
                    {analyzedData.holes.filter(hole => hole.greenInRegulation).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Hole-by-Hole Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Nine */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Front Nine</h4>
                  <div className="space-y-3">
                    {analyzedData.holes.slice(0, 9).map((hole, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">Hole {index + 1}</div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Score</div>
                            <div className="font-medium">{hole.score || '-'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Putts</div>
                            <div className="font-medium">{hole.putts || '-'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">FIR</div>
                            <div>{hole.fairwayHit ? '✓' : '×'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">GIR</div>
                            <div>{hole.greenInRegulation ? '✓' : '×'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back Nine */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Back Nine</h4>
                  <div className="space-y-3">
                    {analyzedData.holes.slice(9).map((hole, index) => (
                      <div key={index + 9} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">Hole {index + 10}</div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Score</div>
                            <div className="font-medium">{hole.score || '-'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Putts</div>
                            <div className="font-medium">{hole.putts || '-'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">FIR</div>
                            <div>{hole.fairwayHit ? '✓' : '×'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">GIR</div>
                            <div>{hole.greenInRegulation ? '✓' : '×'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleRetry}
                className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
              <button
                onClick={handleSaveRound}
                disabled={isSaving}
                className="px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    <span>Save Round</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanCard; 