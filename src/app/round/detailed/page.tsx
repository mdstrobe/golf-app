'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

interface HoleData {
  score: number;
  putts: number;
  fairwayHit: boolean;
  greenInRegulation: boolean;
}

const DetailedRound = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('front9');
  const [roundData, setRoundData] = useState({
    date: new Date().toISOString().split('T')[0],
    courseName: '',
    holes: Array(18).fill({ score: 0, putts: 0, fairwayHit: false, greenInRegulation: false })
  });

  useEffect(() => {
    // Check for scorecard data from AI analysis
    const savedData = localStorage.getItem('scorecard_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setRoundData({
        date: parsedData.date || new Date().toISOString().split('T')[0],
        courseName: parsedData.courseName || '',
        holes: parsedData.holes || Array(18).fill({ score: 0, putts: 0, fairwayHit: false, greenInRegulation: false })
      });

      // Clear the stored data
      localStorage.removeItem('scorecard_data');
    }
  }, []);

  const updateHoleData = (
    index: number, 
    field: keyof HoleData, 
    value: HoleData[keyof HoleData]
  ) => {
    const newHoles = [...roundData.holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setRoundData({ ...roundData, holes: newHoles });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would submit the data to your backend
    console.log('Submitting round:', roundData);
    router.push('/dashboard');
  };

  const renderHoleInputs = (startHole: number, endHole: number) => {
    return roundData.holes.slice(startHole, endHole).map((hole, index) => {
      const holeNumber = startHole + index + 1;
      return (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Hole {holeNumber}</span>
            <input
              type="number"
              min="1"
              max="15"
              value={hole.score || ''}
              onChange={(e) => updateHoleData(startHole + index, 'score', Number(e.target.value))}
              className="w-12 px-2 py-1 border rounded text-center"
              placeholder="Score"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="5"
                value={hole.putts || ''}
                onChange={(e) => updateHoleData(startHole + index, 'putts', Number(e.target.value))}
                className="w-12 px-2 py-1 border rounded text-center"
                placeholder="Putts"
                required
              />
              <span className="text-sm text-gray-600">Putts</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={hole.fairwayHit}
                  onChange={(e) => updateHoleData(startHole + index, 'fairwayHit', e.target.checked)}
                  className="w-4 h-4 text-green-700"
                />
                <span className="text-sm text-gray-600">FIR</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={hole.greenInRegulation}
                  onChange={(e) => updateHoleData(startHole + index, 'greenInRegulation', e.target.checked)}
                  className="w-4 h-4 text-green-700"
                />
                <span className="text-sm text-gray-600">GIR</span>
              </label>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.push('/round/new')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Detailed Round Entry</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
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

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex border-b mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('front9')}
                className={`flex-1 py-2 text-center ${
                  activeTab === 'front9'
                    ? 'text-green-700 border-b-2 border-green-700 font-medium'
                    : 'text-gray-500'
                }`}
              >
                Front 9
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('back9')}
                className={`flex-1 py-2 text-center ${
                  activeTab === 'back9'
                    ? 'text-green-700 border-b-2 border-green-700 font-medium'
                    : 'text-gray-500'
                }`}
              >
                Back 9
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'front9' ? renderHoleInputs(0, 9) : renderHoleInputs(9, 18)}
            </div>
          </div>

          <div className="flex justify-end pt-2">
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

export default DetailedRound; 