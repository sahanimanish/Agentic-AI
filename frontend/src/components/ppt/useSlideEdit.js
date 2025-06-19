import { useState } from 'react';
import axios from 'axios';



export default function useSlideEdit({
  slides,
  setSlides,
  presentationId,
  API_BASE_URL,
  showStatus,
}) {
  const [editingElement, setEditingElement] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectElementForEdit = (slideIndex, elementId, currentContent) => {
    setEditingElement({
      slideIndex,
      elementId,
      currentContent,
      newContent: currentContent,
      aiInstruction: '',
      isEditing: true,
      showAiInstructionInput: false,
    });
  };

  const handleUpdateInlineContent = (value) => {
    setEditingElement(prev => ({ ...prev, newContent: value }));
  };

  const handleUpdateAiInstruction = (value) => {
    setEditingElement(prev => ({ ...prev, aiInstruction: value }));
  };

  const handleCancelInlineEdit = () => {
    setEditingElement(null);
  };

  const handleSaveInlineEdit = () => {
    if (!editingElement) return;
    const { slideIndex, elementId, newContent } = editingElement;
    const updatedSlides = slides.map((slide, sIdx) => {
      if (sIdx === slideIndex) {
        const newSlide = { ...slide };
        if (elementId === 'title') {
          newSlide.title = newContent;
        } else if (elementId.startsWith('bullet_point_')) {
          const bpIndex = parseInt(elementId.split('_')[2]);
          const newBulletPoints = [...newSlide.bullet_points];
          newBulletPoints[bpIndex] = newContent;
          newSlide.bullet_points = newBulletPoints;
        } else if (elementId === 'image_description') {
          newSlide.image_description = newContent;
        }
        return newSlide;
      }
      return slide;
    });
    setSlides(updatedSlides);
    setEditingElement(null);
    showStatus('Content updated directly!', 'success');
  };

  const handleRefineWithAIRequest = () => {
    setEditingElement(prev => ({
      ...prev,
      showAiInstructionInput: true,
      aiInstruction: ''
    }));
  };

  const handleSendAiRefinement = async () => {
    if (!editingElement || !editingElement.aiInstruction.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/edit_ppt`, {
        presentation_id: presentationId,
        slide_index: editingElement.slideIndex,
        element_id: editingElement.elementId,
        edit_instruction: editingElement.aiInstruction,
        current_content: editingElement.newContent,
      });
      setSlides(prevSlides => prevSlides.map((slide, index) =>
        index === editingElement.slideIndex ? response.data.slides[editingElement.slideIndex] : slide
      ));
      showStatus(response.data.message, 'success');
      setEditingElement(null);
    } catch (err) {
      // --- Fix: handle array/object error messages ---
      let errorMsg = 'Failed to refine with AI.';
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        errorMsg = detail.map(d => d.msg).join(', ');
      } else if (typeof detail === 'string') {
        errorMsg = detail;
      }
      showStatus(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add this function for generating image with AI
  const handleGenerateImageWithAI = async (description, slide_index, presentationId) => {
    try {
      
      

      const API_BASE_URL = 'https://agentic-ai-or4s.onrender.com';
      ; // <-- ensure this is set correctly

      const response = await axios.post(`${API_BASE_URL}/generate`, {
        description,
        slide_index,
        presentation_id: presentationId, // <-- add this
      });
      return response.data.base64;
    } catch (err) {
      if (showStatus && typeof showStatus === 'function') {
        showStatus('Failed to generate image.', 'error');
      }
      return null;
    }
  };

  return {
    editingElement,
    setEditingElement,
    loading,
    handleSelectElementForEdit,
    handleUpdateInlineContent,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
    handleRefineWithAIRequest,
    handleUpdateAiInstruction,
    handleSendAiRefinement,
    handleGenerateImageWithAI, // <-- export the new function
  };
}