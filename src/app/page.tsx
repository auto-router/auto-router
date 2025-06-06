import Image from "next/image";
import ChatInput from "../components/ChatInput";
import UnifiedLLMInterface from "@/components/routerAnimation";
import FeaturedModels from "../components/FeaturedModels";
import SavingsVisualizer from "../components/SavingsVisualizer";
import StatsSection from "../components/StatsSection";


export default function Home() {
  return (
    <div className="w-full flex flex-col items-center bg-black min-h-screen">
      {/* Moving Banner with Gradient */}
      <div className="w-full relative overflow-hidden h-10 flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #22d3ee 0%, #22c55e 50%, #facc15 100%)",
            opacity: 0.7 // Increase opacity for a lighter look
          }}
        />
        <div className="relative z-10 whitespace-nowrap animate-marquee text-black font-semibold text-sm px-4 text-center">
          🚀 $5 free credit for auto-routing &mdash; sign up free, no credit card required!
        </div>
      </div>
      {/* Hero Section */}
      <div className="w-full bg-black pt-16 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4">
          <UnifiedLLMInterface />
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full relative -mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#181818] rounded-2xl p-10 mb-16 shadow-lg">
            <div className="max-w-2xl mx-auto text-center px-2">
              <h2 className="text-2xl font-semibold text-white mb-6">Smart AI Model Routing</h2>
              <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#232323] to-[#181818] p-6 rounded-2xl flex-1 flex flex-col items-center border border-[#232323] shadow-sm transition hover:scale-105 hover:border-green-400 duration-200">
                  <h3 className="text-base font-semibold text-green-400 mb-2 text-center tracking-wide">Intelligent Routing</h3>
                  <p className="text-gray-300 text-sm text-center flex-grow">Auto-selects the best AI model for your task.</p>
                </div>
                <div className="bg-gradient-to-br from-[#232323] to-[#181818] p-6 rounded-2xl flex-1 flex flex-col items-center border border-[#232323] shadow-sm transition hover:scale-105 hover:border-green-400 duration-200">
                  <h3 className="text-base font-semibold text-green-400 mb-2 text-center tracking-wide">Cost Efficiency</h3>
                  <p className="text-gray-300 text-sm text-center flex-grow">Save up to 70% on API costs.</p>
                </div>
                <div className="bg-gradient-to-br from-[#232323] to-[#181818] p-6 rounded-2xl flex-1 flex flex-col items-center border border-[#232323] shadow-sm transition hover:scale-105 hover:border-green-400 duration-200">
                  <h3 className="text-base font-semibold text-green-400 mb-2 text-center tracking-wide">Unified Interface</h3>
                  <p className="text-gray-300 text-sm text-center flex-grow">One API for all major AI models.</p>
                </div>
              </div>
              <a
                href="#calculate"
                className="inline-flex items-center justify-center text-white bg-black hover:text-black hover:bg-green-200  px-8 py-3 rounded-full font-semibold transition-all shadow-lg mb-4 text-base"
                style={{ color: "#fff" }}
              >
                Try Auto-Router
              </a>
              <div className="mt-2 text-sm text-green-400 font-medium tracking-wide">
                $5 free credit for auto-routing &mdash; sign up free, no credit card required!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-4xl mx-auto px-4 flex-grow mt-20">
        {/* Featured Models Section */}
        <div className="mb-12">
          <div className="mb-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Featured Models</h2>
            <p className="text-gray-400 text-base">Router picks the best model for your needs</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <FeaturedModels
            />
          </div>
        </div>

        {/* Cost Comparison Section */}
        <div className="mb-50 mt-50">
          <div className="mb-6 flex flex-col items-center">
            <h2 className="text-xl font-medium text-center text-white mb-2">See Your Savings</h2>
            <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">Compare your current AI costs with Auto-Router</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-black rounded-2xl p-8 shadow-lg">
                <SavingsVisualizer />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-50">
          <StatsSection />
        </div>
      </div>
    </div>
  );
}
