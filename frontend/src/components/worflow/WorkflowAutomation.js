import React, { useState, useRef, useEffect } from 'react';
import { Excalidraw ,convertToExcalidrawElements  } from '@excalidraw/excalidraw';
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';






const API_BASE_URL = 'https://agentic-ai-or4s.onrender.com';
const WorkflowAutomation = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you with your workflow?' }
  ]);
  const [input, setInput] = useState('');
  const [excalidrawData, setExcalidrawData] = useState(null);

  const excalidrawAPIRef = useRef(null);

  // Update Excalidraw scene when excalidrawData changes (after mount)
  useEffect(() => {
    if (excalidrawAPIRef.current && excalidrawData) {
      excalidrawAPIRef.current.updateScene(excalidrawData);
    }
  }, [excalidrawData]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: input }]);
    setInput('');
    
    try {
      const res = await axios.post(`${API_BASE_URL}/sketch`, { message: input });
      console.log('Response from backend:', res.data.result);
      let data = res.data.result;

      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: data.explanation }
      ]);
      let { elements, files } = await parseMermaidToExcalidraw(data.elements, {
    
  });
      elements = convertToExcalidrawElements(elements)
      setExcalidrawData({
          elements,
          appState: { "zoom":{"value":0.8},
                      "viewBackgroundColor": "#ffffff" },
          scrollToContent: true,
        });
    } catch (err) {
      
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: 'Sorry, could not generate sketch' }
      ]);
    }
  };

  return (
    <div className="flex h-[80vh] w-full">
      {/* Excalidraw - 80% */}
      <div className="w-4/5 bg-white rounded-lg shadow-md p-2 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-2 px-2">Sketch Pad (Excalidraw)</h3>
        <div className="flex-1 min-h-0">
          <Excalidraw
            initialData={null}
            excalidrawAPI={api => { excalidrawAPIRef.current = api; }}
            
          />
        </div>
      </div>
      {/* Chatbot - 20% */}
      <div className="w-1/5 min-w-[200px] max-w-xs bg-white rounded-lg shadow-md p-2 flex flex-col h-full ml-4">
        <h3 className="text-sm font-semibold mb-2">Chatbot</h3>
        <div className="flex-1 overflow-y-auto mb-2 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-xs ${
                msg.from === 'bot'
                  ? 'bg-blue-100 text-blue-900 self-start'
                  : 'bg-green-100 text-green-900 self-end ml-auto'
              }`}
            >
             <ReactMarkdown>{msg.text}</ReactMarkdown> 
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-1 py-1 text-xs"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type..."
          />
          <button
            className="bg-blue-600 text-white px-2 py-1 rounded-r text-xs"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;