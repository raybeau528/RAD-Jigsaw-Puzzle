import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">About Endless Jigsaws</h1>
        <p className="mb-4">
          Welcome to Endless Jigsaws! This application uses advanced AI to generate unique, 
          beautiful puzzle images that have never been seen before.
        </p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
          &larr; Back to Puzzles
        </Link>
      </div>
    </div>
  );
}