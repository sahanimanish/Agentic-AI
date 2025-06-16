import React, { useState } from 'react';
import { LayoutList, Lightbulb, Loader2, Sparkles, Save, X, Image, GripVertical } from 'lucide-react';

const SlidePreview = ({
  slideData, slideIndex, onSelectElementForEdit, editingElement,
  onUpdateInlineContent, onSaveInlineEdit, onCancelInlineEdit,
  onRefineWithAIRequest, onUpdateAiInstruction, onSendAiRefinement,
  loading, onReorderBullet
}) => {
  const hasBullets = slideData.bullet_points && slideData.bullet_points.length > 0;
  const hasImage = slideData.image_description;
  const textColorPrimary = 'text-gray-800';
  const textColorSecondary = 'text-gray-700';
  const accentColor = 'border-blue-500';

  const isEditingThisElement = (elementId) => {
    return editingElement && editingElement.slideIndex === slideIndex && editingElement.elementId === elementId;
  };

  const currentEditedContent = isEditingThisElement(editingElement?.elementId) ? editingElement.newContent : '';
  const currentAiInstruction = isEditingThisElement(editingElement?.elementId) ? editingElement.aiInstruction : '';

  const [draggedBulletIndex, setDraggedBulletIndex] = useState(null);

  const handleBulletDragStart = (e, index) => {
    setDraggedBulletIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleBulletDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetLi = e.target.closest('li');
    if (targetLi && !targetLi.classList.contains('border-blue-500')) {
      targetLi.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleBulletDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const draggedOverElement = e.target.closest('li');
    if (draggedOverElement) {
      draggedOverElement.classList.remove('border-blue-500', 'bg-blue-50');
    }
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    onReorderBullet(slideIndex, sourceIndex, targetIndex);
    setDraggedBulletIndex(null);
  };

  const handleBulletDragEnd = (e) => {
    setDraggedBulletIndex(null);
    e.currentTarget.classList.remove('opacity-50');
    document.querySelectorAll('li.relative.pl-7').forEach(el => {
      el.classList.remove('border-blue-500', 'bg-blue-50');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 border border-gray-200 aspect-video flex flex-col relative overflow-hidden">
      {/* Title */}
      <h3 className={`text-3xl font-extrabold ${textColorPrimary} mb-4 flex items-center`}>
        <LayoutList className="mr-3 text-blue-600" size={28} />
        {isEditingThisElement('title') ? (
          <div className="flex-grow flex flex-col">
            <div className="flex space-x-2 mb-2 self-end">
              <button onClick={onCancelInlineEdit} className="flex items-center text-red-500 hover:text-red-700 text-sm"><X size={16} className="mr-1"/> Cancel</button>
              <button onClick={() => onSaveInlineEdit()} disabled={loading} className="flex items-center text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"><Save size={16} className="mr-1"/> Save</button>
              <button onClick={() => onRefineWithAIRequest()} disabled={loading} className="flex items-center text-purple-600 hover:text-purple-800 text-sm disabled:text-gray-400"><Sparkles size={16} className="mr-1"/> Ask AI</button>
            </div>
            <textarea
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-300 resize-y text-2xl font-bold"
              value={currentEditedContent}
              onChange={(e) => onUpdateInlineContent(e.target.value)}
              rows={2}
            />
            {editingElement.showAiInstructionInput && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex flex-col items-end">
                <label htmlFor="ai-instruction" className="w-full text-sm font-medium text-indigo-800 mb-2 flex items-center">
                  <Lightbulb className="mr-2 text-indigo-600" size={18}/> What to enhance with AI?
                </label>
                <textarea
                  id="ai-instruction"
                  className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-300 resize-y text-sm"
                  placeholder="e.g., 'Make it more concise', 'Expand this point', 'Change tone to formal'"
                  value={currentAiInstruction}
                  onChange={(e) => onUpdateAiInstruction(e.target.value)}
                  rows={2}
                />
                <button onClick={() => onSendAiRefinement()} disabled={loading || !currentAiInstruction.trim()} className="mt-3 flex items-center py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm">
                  {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Sparkles className="mr-2" size={16}/>} Apply AI Refinement
                </button>
              </div>
            )}
          </div>
        ) : (
          <span
            onClick={() => onSelectElementForEdit(slideIndex, 'title', slideData.title)}
            className="cursor-pointer underline-offset-4 decoration-dashed decoration-blue-300 hover:text-blue-600 transition-colors duration-150 flex-grow"
            title="Click to edit title"
          >
            {slideData.title}
          </span>
        )}
      </h3>
      {/* Dynamic Content Area */}
      <div className={`flex-grow flex ${hasImage && hasBullets ? 'flex-row' : 'flex-col'} items-start justify-center gap-6`}>
        {hasBullets && (
          <div className={`${hasImage ? 'w-1/2 pr-4' : 'w-full'} flex-shrink-0 flex flex-col items-start justify-start h-full`}>
            <ul
              className={`list-none ${textColorSecondary} space-y-3 w-full`}
              onDragOver={handleBulletDragOver}
              onDrop={(e) => handleBulletDrop(e, parseInt(e.target.closest('li')?.dataset.index || slideData.bullet_points.length))}
              onDragEnd={handleBulletDragEnd}
            >
              {slideData.bullet_points.map((point, pointIndex) => (
                <li
                  key={pointIndex}
                  className="relative pl-7 group border border-transparent hover:border-gray-300 rounded-md p-1 -m-1 transition-colors duration-150"
                  draggable="true"
                  onDragStart={(e) => handleBulletDragStart(e, pointIndex)}
                  onDragOver={handleBulletDragOver}
                  onDrop={(e) => handleBulletDrop(e, pointIndex)}
                  data-index={pointIndex}
                >
                  <span className="absolute left-0 top-0.5 text-blue-500 text-xl font-bold">■</span>
                  {isEditingThisElement(`bullet_point_${pointIndex}`) ? (
                    <div className="flex flex-col w-full">
                      <div className="flex space-x-2 mb-2 self-end">
                        <button onClick={onCancelInlineEdit} className="flex items-center text-red-500 hover:text-red-700 text-sm"><X size={16} className="mr-1"/> Cancel</button>
                        <button onClick={() => onSaveInlineEdit()} disabled={loading} className="flex items-center text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"><Save size={16} className="mr-1"/> Save</button>
                        <button onClick={() => onRefineWithAIRequest()} disabled={loading} className="flex items-center text-purple-600 hover:text-purple-800 text-sm disabled:text-gray-400"><Sparkles size={16} className="mr-1"/> Ask AI</button>
                      </div>
                      <textarea
                        className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-300 resize-y text-lg"
                        value={currentEditedContent}
                        onChange={(e) => onUpdateInlineContent(e.target.value)}
                        rows={3}
                      />
                      {editingElement.showAiInstructionInput && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex flex-col items-end">
                          <label htmlFor="ai-instruction" className="w-full text-sm font-medium text-indigo-800 mb-2 flex items-center">
                            <Lightbulb className="mr-2 text-indigo-600" size={18}/> What to enhance with AI?
                          </label>
                          <textarea
                            id="ai-instruction"
                            className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-300 resize-y text-sm"
                            placeholder="e.g., 'Make it more concise', 'Expand this point', 'Change tone to formal'"
                            value={currentAiInstruction}
                            onChange={(e) => onUpdateAiInstruction(e.target.value)}
                            rows={2}
                          />
                          <button onClick={() => onSendAiRefinement()} disabled={loading || !currentAiInstruction.trim()} className="mt-3 flex items-center py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm">
                            {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Sparkles className="mr-2" size={16}/>} Apply AI Refinement
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span
                      onClick={() => onSelectElementForEdit(slideIndex, `bullet_point_${pointIndex}`, point)}
                      className="cursor-pointer underline-offset-4 decoration-dashed decoration-blue-300 group-hover:text-blue-600 transition-colors duration-150 text-lg block"
                      title="Click to edit bullet point"
                    >
                      {point}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasImage && (
          <div className={`${hasBullets ? 'w-1/2 pl-4' : 'w-full'} flex-shrink-0 flex flex-col items-center justify-center h-full`}>
            <div className={`w-full max-w-[18rem] h-48 bg-gray-50 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center text-sm italic ${accentColor} text-gray-500 space-y-2`}>
              <Image className="text-gray-400" size={40} />
              {isEditingThisElement('image_description') ? (
                <div className="flex flex-col w-full">
                  <div className="flex space-x-2 mb-2 self-end">
                    <button onClick={onCancelInlineEdit} className="flex items-center text-red-500 hover:text-red-700 text-sm"><X size={16} className="mr-1"/> Cancel</button>
                    <button onClick={() => onSaveInlineEdit()} disabled={loading} className="flex items-center text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"><Save size={16} className="mr-1"/> Save</button>
                    <button onClick={() => onRefineWithAIRequest()} disabled={loading} className="flex items-center text-purple-600 hover:text-purple-800 text-sm disabled:text-gray-400"><Sparkles size={16} className="mr-1"/> Ask AI</button>
                  </div>
                  <textarea
                    className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-300 resize-y text-sm"
                    value={currentEditedContent}
                    onChange={(e) => onUpdateInlineContent(e.target.value)}
                    rows={2}
                  />
                  {editingElement.showAiInstructionInput && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex flex-col items-end">
                      <label htmlFor="ai-instruction" className="w-full text-sm font-medium text-indigo-800 mb-2 flex items-center">
                        <Lightbulb className="mr-2 text-indigo-600" size={18}/> What to enhance with AI?
                      </label>
                      <textarea
                        id="ai-instruction"
                        className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-300 resize-y text-sm"
                        placeholder="e.g., 'Make it more concise', 'Expand this point', 'Change tone to formal'"
                        value={currentAiInstruction}
                        onChange={(e) => onUpdateAiInstruction(e.target.value)}
                        rows={2}
                      />
                      <button onClick={() => onSendAiRefinement()} disabled={loading || !currentAiInstruction.trim()} className="mt-3 flex items-center py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm">
                        {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Sparkles className="mr-2" size={16}/>} Apply AI Refinement
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span
                  onClick={() => onSelectElementForEdit(slideIndex, 'image_description', slideData.image_description)}
                  className="cursor-pointer underline-offset-4 decoration-dashed decoration-blue-300 hover:text-blue-600 transition-colors duration-150 block"
                  title="Click to edit image description"
                >
                  Image Suggestion: <br /> "{slideData.image_description}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-6 right-8 text-sm text-gray-500 font-medium">Slide {slideIndex + 1}</div>
    </div>
  );
};

export default SlidePreview;