import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-600 pb-4">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <p>
            At Endless Jigsaws, accessible from www.endlessjigsaws.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Endless Jigsaws and how we use it.
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Log Files</h2>
          <p>
            Endless Jigsaws follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Cookies and Web Beacons</h2>
          <p>
            Like any other website, Endless Jigsaws uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Google DoubleClick DART Cookie</h2>
          <p>
            Google is a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.endlessjigsaws.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://policies.google.com/technologies/ads</a>
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Advertising Partners Privacy Policies</h2>
          <p>
            You may consult this list to find the Privacy Policy for each of the advertising partners of Endless Jigsaws.
          </p>
          <p>
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Endless Jigsaws, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p>
            Note that Endless Jigsaws has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Third Party Privacy Policies</h2>
          <p>
            Endless Jigsaws's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>

          <h2 className="text-xl font-bold text-white mt-6">Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-600">
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              &larr; Return to Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}