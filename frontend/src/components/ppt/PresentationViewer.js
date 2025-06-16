import React, { useState } from 'react';
import { LayoutList, CornerUpLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SlidePreview from './SlidePreview';
import SlideThumbnail from './SlideThumbnail';
import useSlideDragAndDrop from './useSlideDragAndDrop';
import useSlideEdit from './useSlideEdit';

const PresentationViewer = ({
  slides,
  setSlides,
  setPresentationId,
  goBackToHome,
  API_BASE_URL,
  StatusMessage,
  showStatus,
  presentationId,
  handleDownloadPpt, // <-- add this
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Drag-and-drop logic
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedItemIndex,
  } = useSlideDragAndDrop(slides, setSlides, setCurrentSlideIndex, currentSlideIndex);

  // Edit logic
  const {
    editingElement,
    loading,
    handleSelectElementForEdit,
    handleUpdateInlineContent,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
    handleRefineWithAIRequest,
    handleUpdateAiInstruction,
    handleSendAiRefinement,
  } = useSlideEdit({
    slides,
    setSlides,
    presentationId, // <-- make sure this is passed here
    API_BASE_URL,
    showStatus,
  });

  return (
    <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
      {/* Slide Thumbnails */}
      <div className="lg:w-64 flex-shrink-0 bg-gray-100 rounded-xl shadow-lg p-4 flex flex-col items-center space-y-4 overflow-y-auto max-h-[600px] lg:max-h-[700px] custom-scrollbar">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
          <LayoutList className="mr-2 text-blue-600" size={20} /> Slides Order
        </h3>
        <div
          className="w-full space-y-3"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        >
          {slides.map((slide, index) => (
            <SlideThumbnail
              key={`slide-${index}`}
              slideData={slide}
              index={index}
              onSelectSlide={setCurrentSlideIndex}
              isSelected={currentSlideIndex === index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
      {/* Main Slide Viewer and Navigation */}
      <div className="flex-grow flex flex-col items-center space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-6 rounded-lg shadow-sm w-full">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 sm:mb-0">Current Slide</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={goBackToHome}
              className="flex items-center py-2.5 px-5 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-base"
            >
              <CornerUpLeft className="mr-2" size={20} /> Back to Home
            </button>
            <button
              onClick={handleDownloadPpt}
              className="flex items-center py-2.5 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-green-300 disabled:cursor-not-allowed text-base"
            >
              <Download className="mr-2" size={20} /> Download PPTX
            </button>
          </div>
        </div>
        {slides.length > 0 && (
          <div className="w-full max-w-[1000px]">
            <SlidePreview
              slideData={slides[currentSlideIndex]}
              slideIndex={currentSlideIndex}
              onSelectElementForEdit={handleSelectElementForEdit}
              editingElement={editingElement}
              onUpdateInlineContent={handleUpdateInlineContent}
              onSaveInlineEdit={handleSaveInlineEdit}
              onCancelInlineEdit={handleCancelInlineEdit}
              onRefineWithAIRequest={handleRefineWithAIRequest}
              onUpdateAiInstruction={handleUpdateAiInstruction}
              onSendAiRefinement={handleSendAiRefinement}
              loading={loading}
            />
          </div>
        )}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="flex items-center justify-center p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200 shadow-md"
          >
            <ChevronLeft size={28} />
          </button>
          <span className="text-xl font-bold text-gray-800">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center justify-center p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200 shadow-md"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;