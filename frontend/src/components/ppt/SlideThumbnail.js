import React from 'react';
import { GripVertical } from 'lucide-react';

const SlideThumbnail = ({ slideData, index, onSelectSlide, isSelected, onDragStart, onDragOver, onDrop }) => {
  return (
    <div
      className={`relative w-40 h-24 bg-white rounded-lg shadow-md flex items-center justify-center border-2 cursor-pointer transition-all duration-200
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
        overflow-hidden flex-shrink-0`}
      onClick={() => onSelectSlide(index)}
      draggable="true"
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, index)}
      data-index={index}
    >
      <div className="absolute left-1 top-1 text-gray-400 hover:text-gray-600 cursor-grab z-10">
        <GripVertical size={18} />
      </div>
      <div className="text-xs font-semibold text-gray-700 text-center px-2">
        {slideData.title.substring(0, 40)}{slideData.title.length > 40 ? '...' : ''}
      </div>
      <div className="absolute bottom-1 right-2 text-xxs text-gray-400">
        {index + 1}
      </div>
    </div>
  );
};

export default SlideThumbnail;