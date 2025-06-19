import React, { useState } from 'react';
import axios from 'axios';
import StatusMessage from './components/ppt/StatusMessage';
import PptCreationForm from './components/ppt/PptCreationForm';
import WorkflowAutomation from './components/worflow/WorkflowAutomation';
import PresentationViewer from './components/ppt/PresentationViewer';

function App() {
  const [description, setDescription] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [audience, setAudience] = useState('general');
  const [presentationId, setPresentationId] = useState(null);
  const [slides, setSlides] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [activeTab, setActiveTab] = useState('ppt');
  const toneOptions = ['professional', 'minimalist', 'playful', 'academic', 'dynamic'];
  const [tone, setTone] = useState(toneOptions[0]);
  const API_BASE_URL = 'https://agentic-ai-or4s.onrender.com';
  const showStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setMessageType(type);
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleCreatePpt = async () => {
    setStatusMessage(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/create_ppt`, {
        description,
        num_slides: parseInt(numSlides),
        audience,
        tone,
      });
      setPresentationId(response.data.presentation_id);
      setSlides(response.data.slides);
      showStatus(response.data.message, 'success');
    } catch (err) {
      showStatus(err.response?.data?.detail || 'Failed to create presentation.', 'error');
    }
  };

  const handleDownloadPpt = () => {
    if (presentationId) {
      window.open(`${API_BASE_URL}/download_ppt/${presentationId}`);
    } else {
      showStatus('Please create a presentation first!', 'info');
    }
  };

  const goBackToHome = () => {
    setSlides([]);
    setPresentationId(null);
    setDescription('');
    setNumSlides(5);
    setAudience('general');
    setTone(toneOptions[0]);
    showStatus('Returned to creation screen.', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center w-full">
      <div className="w-full max-w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-8">
          Agentic PPT Creator
        </h1>
        {!slides.length > 0 && (
          <div className="flex justify-center mb-8">
            <button
              className={`px-6 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${
                activeTab === 'ppt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('ppt')}
            >
              PPT Creation
            </button>
            <button
              className={`px-6 py-2 rounded-t-lg font-semibold transition-colors duration-200 ml-2 ${
                activeTab === 'workflow'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('workflow')}
            >
              Workflow Automation
            </button>
          </div>
        )}
        {!slides.length > 0 ? (
          activeTab === 'ppt' ? (
            <PptCreationForm
              description={description}
              setDescription={setDescription}
              numSlides={numSlides}
              setNumSlides={setNumSlides}
              audience={audience}
              setAudience={setAudience}
              tone={tone}
              setTone={setTone}
              toneOptions={toneOptions}
              loading={false}
              handleCreatePpt={handleCreatePpt}
            />
          ) : (
            <WorkflowAutomation />
          )
        ) : (
          <PresentationViewer
            slides={slides}
            setSlides={setSlides}
            setPresentationId={setPresentationId}
            goBackToHome={goBackToHome}
            API_BASE_URL={API_BASE_URL}
            StatusMessage={StatusMessage}
            showStatus={showStatus}
            presentationId={presentationId}
            handleDownloadPpt={handleDownloadPpt}
          />
        )}
      </div>
      <StatusMessage message={statusMessage} type={messageType} onClose={() => setStatusMessage(null)} />
    </div>
  );
}

export default App;
