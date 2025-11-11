import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
        <h1 className="text-4xl font-bold mb-6 text-white border-b border-gray-600 pb-4">About Endless Jigsaws</h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            Welcome to <span className="font-bold text-blue-300">Endless Jigsaws</span>, the future of digital puzzle solving.
          </p>

          <p>
            Unlike traditional puzzle apps that rely on a static library of stock photos, Endless Jigsaws is powered by advanced Artificial Intelligence. By leveraging Google's cutting-edge Gemini and Imagen models, we allow you to turn <em>any idea</em> into a playable puzzle instantly.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">Why Play Here?</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li><strong className="text-blue-200">Infinite Variety:</strong> From "Cyberpunk City" to "Victorian Garden," if you can imagine it, you can solve it.</li>
            <li><strong className="text-blue-200">Custom Difficulty:</strong> Whether you have 5 minutes or 5 hours, choose grid sizes ranging from easy (3x3) to expert (10x10).</li>
            <li><strong className="text-blue-200">Secure & Private:</strong> We respect your privacy. Your generated images are yours to enjoy.</li>
          </ul>

          <p>
            Our mission is to provide a relaxing, creative, and endless source of entertainment for puzzle enthusiasts of all ages.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-600">
            <p className="text-sm text-gray-400">
              Have questions, suggestions, or feedback? We'd love to hear from you.<br />
              Contact us at: <a href="mailto:support@endlessjigsaws.com" className="text-blue-400 hover:underline">support@endlessjigsaws.com</a>
            </p>
          </div>

          <div className="mt-8">
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              &larr; Return to Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}