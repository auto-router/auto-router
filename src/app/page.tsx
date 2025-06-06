import Image from "next/image";
import ChatInput from "../components/ChatInput";
import UnifiedLLMInterface from "@/components/routerAnimation";
import FeaturedModels from "../components/FeaturedModels";
import SavingsVisualizer from "../components/SavingsVisualizer";
import StatsSection from "../components/StatsSection";
import TopApps from "../components/TopApps";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center bg-black min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-black pt-16 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4">
          <UnifiedLLMInterface />
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full relative -mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl p-8 mb-16">
            <div className="max-w-2xl mx-auto text-center px-2">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Smart AI Model Routing</h2>
              <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 mb-6">
                <div className="bg-gray-50 p-5 rounded-lg flex-1 flex flex-col">
                  <h3 className="text-base font-medium text-gray-800 mb-2 text-center">Intelligent Routing</h3>
                  <p className="text-gray-500 text-sm text-center flex-grow">Auto-selects the best AI model for your task.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg flex-1 flex flex-col">
                  <h3 className="text-base font-medium text-gray-800 mb-2 text-center">Cost Efficiency</h3>
                  <p className="text-gray-500 text-sm text-center flex-grow">Save up to 70% on API costs.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg flex-1 flex flex-col">
                  <h3 className="text-base font-medium text-gray-800 mb-2 text-center">Unified Interface</h3>
                  <p className="text-gray-500 text-sm text-center flex-grow">One API for all major AI models.</p>
                </div>
              </div>
              <a href="#calculate" className="inline-flex items-center text-white bg-black hover:bg-gray-900 px-5 py-2 rounded-full font-medium transition-colors">
                Try Auto-Router
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-4xl mx-auto px-4 flex-grow">
        {/* Featured Models Section */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Featured Models</h2>
          <p className="text-gray-500 text-sm mb-6">Router picks the best model for your needs</p>
          <FeaturedModels />
        </div>

        {/* Cost Comparison Section */}
        <div className="py-10 bg-gray-50 rounded-xl mb-12">
          <h2 className="text-xl font-medium text-center text-gray-900 mb-2">See Your Savings</h2>
          <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">Compare your current AI costs with Auto-Router</p>
          <SavingsVisualizer />
        </div>

        {/* Top Apps Section */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2 text-center">Top Apps Using Auto-Router</h2>
          <TopApps />
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <StatsSection />
        </div>
      </div>
    </div>
  );
}