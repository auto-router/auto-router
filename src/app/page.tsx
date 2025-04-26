import Image from "next/image";
import ChatInput from "../components/ChatInput";
import UnifiedLLMInterface from "@/components/routerAnimation";
import FeaturedModels from "../components/FeaturedModels";
import SavingsVisualizer from "../components/SavingsVisualizer";
import StatsSection from "../components/StatsSection";
import TopApps from "../components/TopApps";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      {/* Hero Section with Animation */}
      <div className="w-full bg-gradient-to-b from-indigo-50 to-white pt-12 pb-24">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div>
            <UnifiedLLMInterface />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full relative -mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-24">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Smart AI Model Routing</h2>

              <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm flex-1 border border-indigo-100 flex flex-col">
                  <div className="text-indigo-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Intelligent Routing</h3>
                  <p className="text-gray-600 text-sm text-center flex-grow">Auto-Router analyzes your prompts in real-time and selects the optimal AI model for each specific task.</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm flex-1 border border-green-100 flex flex-col">
                  <div className="text-green-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Cost Efficiency</h3>
                  <p className="text-gray-600 text-sm text-center flex-grow">Save up to 70% on your API costs without compromising on quality or performance.</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm flex-1 border border-purple-100 flex flex-col">
                  <div className="text-purple-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Unified Interface</h3>
                  <p className="text-gray-600 text-sm text-center flex-grow">Access all major AI models from OpenAI, Anthropic, Google and others through a single, consistent API.</p>
                </div>
              </div>

              <div className="mt-8">
                <a href="#calculate" className="inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-full font-medium transition-colors">
                  Try Auto-Router Today
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 flex-grow">
        {/* Featured Models Section with visual separator */}
        <div className="relative py-16">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">Featured Models</span>
          </div>
        </div>

        {/* Featured Models Header */}
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-medium text-gray-800">Featured Models</h2>
            <p className="text-gray-500 text-sm mt-1">Our router automatically selects the best model for your task</p>
          </div>
          <a href="#trending" className="text-indigo-500 text-sm hover:underline flex items-center group">
            View Trending
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        {/* Featured Models in Grid Layout */}
        <div className="max-w-6xl mx-auto mb-24">
          <FeaturedModels />
        </div>

        {/* Cost Comparison Section with background */}
        <div className="py-16 bg-gray-50 -mx-4 px-4 mb-24">
          <h2 className="text-2xl font-medium text-center text-gray-800 mb-2">See How Much You Can Save</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Compare your current AI costs with Auto-Router's optimized solution</p>
          <SavingsVisualizer />

          <div className="mt-16 text-center">
            <a href="#api-docs" className="text-indigo-600 font-medium hover:text-indigo-800 inline-flex items-center">
              View API Documentation
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Top Apps Section */}
        <div className="mb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Top Apps Using Auto-Router</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Join thousands of applications delivering cost-effective AI experiences</p>
          </div>
          <TopApps />
        </div>

        {/* Stats Section with improved visual separation */}
        <div className="relative mb-24">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center mb-16">
            <span className="bg-white px-4 text-sm text-gray-500">Why Choose Auto-Router</span>
          </div>
          <StatsSection />
        </div>
      </div>
    </div>
  );
}