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
      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 flex-grow">
        {/* Routing Visualizer and Hero Section */}
        <div>
          <UnifiedLLMInterface />
        </div>

        <div className="mb-16 mt-8">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Smart AI Model Routing</h2>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm flex-1 border border-indigo-100">
                <div className="text-indigo-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Intelligent Routing</h3>
                <p className="text-gray-600 text-sm">Auto-Router analyzes your prompts in real-time and selects the optimal AI model for each specific task.</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm flex-1 border border-green-100">
                <div className="text-green-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Cost Efficiency</h3>
                <p className="text-gray-600 text-sm">Save up to 70% on your API costs without compromising on quality or performance.</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm flex-1 border border-purple-100">
                <div className="text-purple-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Quality Preserved</h3>
                <p className="text-gray-600 text-sm">Our proprietary algorithms ensure optimal output quality for each prompt type.</p>
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

        {/* Featured Models Header */}
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-medium text-gray-800">Featured Models</h2>
            <p className="text-gray-500 text-sm mt-1">Our router automatically selects the best model for your task</p>
          </div>
          <a href="#trending" className="text-indigo-500 text-sm hover:underline flex items-center">
            View Trending↗
          </a>
        </div>

        {/* Featured Models in Grid Layout */}
        <div className="max-w-6xl mx-auto mb-16">
          <FeaturedModels />
        </div>

        {/* Top Apps Section */}
        <div className="mb-16">
          <TopApps />
        </div>

        {/* Savings Visualizer */}
        <div className="mb-16">
          <SavingsVisualizer />
        </div>

        {/* Stats Section */}
        <StatsSection />
      </div>
    </div>
  );
}