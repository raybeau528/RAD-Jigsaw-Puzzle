
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2700); // Slightly less than parent to allow animation
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-gray-700 text-white shadow-lg transition-all duration-300 ease-in-out
        ${visible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'}`}
    >
      {message}
    </div>
  );
};

export default Toast;
