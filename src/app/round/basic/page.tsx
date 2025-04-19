'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

interface HoleData {
  score: number | null;
  putts: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
}

const BasicRound = () => {
  const router = useRouter();
  const [roundData, setRoundData] = useState({
    date: new Date().toISOString().split('T')[0],
    courseName: '',
    totalScore: '',
    totalPutts: '',
    fairwaysHit: '',
    greensInRegulation: ''
  });

  useEffect(() => {
    // Check for scorecard data from AI analysis
    const savedData = localStorage.getItem('scorecard_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const holes: HoleData[] = parsedData.holes || [];
      
      setRoundData({
        date: parsedData.date || new Date().toISOString().split('T')[0],
        courseName: parsedData.courseName || '',
        totalScore: holes.reduce((sum: number, hole: HoleData) => sum + (hole.score || 0), 0).toString(),
        totalPutts: holes.reduce((sum: number, hole: HoleData) => sum + (hole.putts || 0), 0).toString(),
        fairwaysHit: holes.filter((hole: HoleData) => hole.fairwayHit).length.toString(),
        greensInRegulation: holes.filter((hole: HoleData) => hole.greenInRegulation).length.toString()
      });

      // Clear the stored data
      localStorage.removeItem('scorecard_data');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would submit the data to your backend
    console.log('Submitting round:', roundData);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.push('/round/new')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Basic Round Entry</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Round Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  value={roundData.date}
                  onChange={(e) => setRoundData({ ...roundData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={roundData.courseName}
                  onChange={(e) => setRoundData({ ...roundData, courseName: e.target.value })}
                  placeholder="Enter course name"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Score
                </label>
                <input
                  type="number"
                  min="18"
                  max="200"
                  value={roundData.totalScore}
                  onChange={(e) => setRoundData({ ...roundData, totalScore: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Putts
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={roundData.totalPutts}
                  onChange={(e) => setRoundData({ ...roundData, totalPutts: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fairways Hit
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={roundData.fairwaysHit}
                  onChange={(e) => setRoundData({ ...roundData, fairwaysHit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greens in Regulation
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={roundData.greensInRegulation}
                  onChange={(e) => setRoundData({ ...roundData, greensInRegulation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800"
            >
              Save Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicRound; 