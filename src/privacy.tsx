import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          Your privacy is important to us. This application uses Google AdSense 
          to serve ads. (You can paste your full policy text here later).
        </p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
          &larr; Back to Puzzles
        </Link>
      </div>
    </div>
  );
}