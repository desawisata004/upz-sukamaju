import React from 'react';

const Loading = ({ fullScreen = false, message = 'Memuat...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;