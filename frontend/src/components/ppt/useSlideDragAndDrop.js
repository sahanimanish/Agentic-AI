import { useState } from 'react';

export default function useSlideDragAndDrop(slides, setSlides, setCurrentSlideIndex, currentSlideIndex) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.classList.add('opacity-50', 'border-blue-500');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetThumbnail = e.target.closest('.relative.w-40.h-24');
    if (targetThumbnail && !targetThumbnail.classList.contains('border-blue-500')) {
      targetThumbnail.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      return;
    }
    const newSlides = Array.from(slides);
    const [movedItem] = newSlides.splice(sourceIndex, 1);
    newSlides.splice(targetIndex, 0, movedItem);
    setSlides(newSlides);
    if (currentSlideIndex === sourceIndex) {
      setCurrentSlideIndex(targetIndex);
    } else if (sourceIndex < currentSlideIndex && targetIndex >= currentSlideIndex) {
      setCurrentSlideIndex(prev => prev - 1);
    } else if (sourceIndex > currentSlideIndex && targetIndex <= currentSlideIndex) {
      setCurrentSlideIndex(prev => prev + 1);
    }
    setDraggedItemIndex(null);
    const draggedOverElement = e.target.closest('.relative.w-40.h-24');
    if (draggedOverElement) {
      draggedOverElement.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragEnd = (e) => {
    setDraggedItemIndex(null);
    e.currentTarget.classList.remove('opacity-50', 'border-blue-500');
    document.querySelectorAll('.relative.w-40.h-24').forEach(el => {
      el.classList.remove('border-blue-500', 'bg-blue-50');
    });
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedItemIndex,
  };
}