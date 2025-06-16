import React from 'react';
import { Loader2, Hash, Users, Volume2 } from 'lucide-react';

const PptCreationForm = ({
  description,
  setDescription,
  numSlides,
  setNumSlides,
  audience,
  setAudience,
  tone,
  setTone,
  toneOptions,
  loading,
  handleCreatePpt,
}) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg shadow-md space-y-6">
    <h2 className="text-xl font-semibold text-gray-700">Create New Presentation</h2>
    <textarea
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 resize-y text-base"
      placeholder="Describe your presentation (e.g., 'A presentation about the benefits of renewable energy for a general audience, aiming for 5 slides.')"
      rows="5"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    ></textarea>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="flex flex-col">
        <label htmlFor="numSlides" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Hash className="mr-2 text-gray-500" size={18} />Number of Slides:
        </label>
        <input
          id="numSlides"
          type="number"
          min="1"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 text-base"
          value={numSlides}
          max="20"
          onChange={(e) => setNumSlides(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Users className="mr-2 text-gray-500" size={18} />Audience:
        </label>
        <input
          id="audience"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 text-base"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Volume2 className="mr-2 text-gray-500" size={18} />Tone:
        </label>
        <select
          id="tone"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 text-base"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          {toneOptions.map(option => (
            <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
    <button
      onClick={handleCreatePpt}
      disabled={loading || !description.trim()}
      className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed text-lg"
    >
      {loading ? (
        <Loader2 className="animate-spin mr-2" size={20} />
      ) : (
        'Create Presentation'
      )}
    </button>
  </div>
);

export default PptCreationForm;