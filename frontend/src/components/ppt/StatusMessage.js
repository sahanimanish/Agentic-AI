import React from 'react';
import { Info, XCircle } from 'lucide-react';

const StatusMessage = ({ message, type, onClose }) => {
  if (!message) return null;

  let bgColor = '';
  let textColor = '';
  let borderColor = '';
  let Icon = Info;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      borderColor = 'border-green-400';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      borderColor = 'border-red-400';
      Icon = XCircle;
      break;
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-400';
      break;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${bgColor} ${textColor} border ${borderColor}`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-gray-200">
        <XCircle className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

export default StatusMessage;