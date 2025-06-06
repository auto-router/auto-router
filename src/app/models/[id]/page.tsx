"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface ModelData {
  id: string;
  name: string;
  description: string;
  provider: string;
  inputCost: number;
  outputCost: number;
  context: number;
  isFree: boolean;
  modelId: string;
  categories: string[];
  supportedParameters: string[];
  series: string;
  dateCreated?: string;
  contextSize?: number;
}

// Sample apps data for the "Apps using this model" section
interface AppData {
  id: number;
  name: string;
  description: string;
  tokens: number;
  isNew: boolean;
  icon: string;
}

const ModelDetailsPage = () => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [model, setModel] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be an API call in a real app
    // Simulating API call with timeout
    setTimeout(() => {
      const mockModel: ModelData = {
        id: params.id as string,
        name: "Google: Gemini 2.5 Pro Preview",
        description: "Gemini 2.5 Pro is Google's state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs \"thinking\" capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance across various benchmarks and offers exceptional reasoning in multilingual contexts.",
        provider: "google",
        inputCost: 1.25,
        outputCost: 10,
        context: 1048576,
        isFree: false,
        modelId: "google/gemini-2.5-pro-preview-03-25",
        categories: ["Marketing/SEO", "Programming", "Technology", "Marketing", "Translation"],
        supportedParameters: ["temperature", "top_p", "top_k", "max_tokens"],
        series: "Gemini",
        dateCreated: "Apr 17, 2023",
        contextSize: 1048576
      };
      setModel(mockModel);
      setLoading(false);
    }, 200);
  }, [params.id]);

  // Mock apps data
  const apps: AppData[] = [
    { id: 1, name: "Cline", description: "Autonomous coding agent right in your terminal", tokens: 32300000000, isNew: false, icon: "🖥️" },
    { id: 2, name: "Roo Code", description: "A whole dev team of AI agents in your IDE", tokens: 31100000000, isNew: false, icon: "📱" },
    { id: 3, name: "SillyTavern", description: "LLM frontend for power users", tokens: 2540000000, isNew: false, icon: "🍺" },
    { id: 4, name: "OpenRouter: Chatroom", description: "Chat with multiple LLMs at once", tokens: 1230000000, isNew: false, icon: "💬" },
    { id: 5, name: "Aider", description: "AI pair programming in your terminal", tokens: 1130000000, isNew: false, icon: "🕓" },
    { id: 6, name: "Open WebUI", description: "Extensible, self-hosted AI interface", tokens: 670000000, isNew: false, icon: "🔍" },
    { id: 7, name: "liteLLM", description: "Open-source library to simplify LLM calls", tokens: 535000000, isNew: false, icon: "📄" },
    { id: 8, name: "Kortex", description: "New AI-powered development environment", tokens: 368000000, isNew: true, icon: "📱" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded w-full mt-8"></div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-semibold text-red-600">Model not found</h1>
        <p className="mt-2 text-gray-600">The model you're looking for doesn't exist or has been removed.</p>
        <Link href="/models" className="mt-6 inline-block text-indigo-600 hover:text-indigo-700">
          &larr; Back to Models
        </Link>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 w-full">
      {/* Back to models link */}
      <Link
        href="/models"
        className="inline-flex items-center text-sm text-green-500 hover:text-green-400 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Models
      </Link>

      {/* Model header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white">{model.name}</h1>
        <div className="flex items-center mt-2 text-sm text-gray-400 font-mono">
          {model.modelId}
          <button className="ml-2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-sm text-gray-400">
            Created {model.dateCreated}
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            <span className="mx-2">•</span>
            {formatNumber(model.contextSize || 0)} context
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            <span className="mx-2">•</span>
            Starting at ${model.inputCost.toFixed(2)}/1M input tokens
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            <span className="mx-2">•</span>
            Starting at ${model.outputCost.toFixed(2)}/1M output tokens
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {model.categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-400"
            >
              {category}
              {index < 2 && <span className="ml-1 text-xs text-green-500">#{index + 1}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mb-8">
        <button className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </button>
        <button className="px-6 py-2 bg-[#181818] border border-gray-700 text-gray-200 rounded-md hover:bg-gray-900 transition-colors font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Compare
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['Overview', 'Providers', 'Apps', 'Activity', 'Uptime', 'API'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.toLowerCase()
                  ? 'border-green-500 text-green-500'
                  : 'border-transparent text-gray-400 hover:text-green-400 hover:border-green-400'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mb-12">
        {activeTab === 'overview' && (
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-700 text-base leading-relaxed mb-8"
            >
              {model.description}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-700 rounded-lg p-6 bg-[#181818]">
                <h3 className="text-lg font-medium text-white mb-4">Throughput</h3>
                <div className="h-48 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-full h-full text-blue-500 opacity-80" viewBox="0 0 400 200">
                    <path d="M0,150 C50,120 100,180 150,120 C200,60 250,90 300,60 C350,30 400,90 400,90"
                      fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M0,160 C50,140 100,170 150,140 C200,110 250,130 300,100 C350,70 400,110 400,110"
                      fill="none" stroke="#10B981" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="border border-gray-700 rounded-lg p-6 bg-[#181818]">
                <h3 className="text-lg font-medium text-white mb-4">Latency</h3>
                <div className="h-48 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-full h-full text-blue-500 opacity-80" viewBox="0 0 400 200">
                    <path d="M0,100 C20,90 40,120 60,110 C100,80 120,150 160,130 C200,110 240,90 280,70 C320,50 360,90 400,70"
                      fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M0,150 C20,140 40,130 60,135 C100,140 120,120 160,125 C200,130 240,120 280,130 C320,140 360,120 400,130"
                      fill="none" stroke="#10B981" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Apps using {model.name}</h2>
              <p className="text-gray-600 mb-6">Top public apps this week using this model</p>

              <div className="space-y-4">
                {apps.map((app, index) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-4 border-b border-gray-700"
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-4 w-6 text-center">{index + 1}.</span>
                      <span className="text-xl mr-4">{app.icon}</span>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-white">{app.name}</h3>
                          {app.isNew && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-900 text-green-400 rounded-full">new</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{app.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {formatNumber(app.tokens)} tokens
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Recent activity on {model.name}</h2>
              <p className="text-gray-600 mb-6">Tokens processed per day</p>

              <div className="border border-gray-700 rounded-lg p-6 bg-[#181818] h-96 flex items-end space-x-2">
                {[3, 5, 9, 12, 14, 10, 15, 11, 11, 17, 19, 22, 17, 18, 19, 21, 23, 21, 18, 16, 12].map((value, i) => (
                  <div
                    key={i}
                    className="bg-green-700 rounded-t w-full"
                    style={{ height: `${value * 4}%` }}
                  ></div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'uptime' && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Uptime stats for {model.name}</h2>
              <p className="text-gray-600 mb-6">Uptime stats for {model.name} across all providers</p>

              <div className="border border-gray-700 rounded-lg p-6 bg-[#181818] mb-8 relative">
                <div className="absolute top-4 right-4 text-xs px-2 py-1 bg-green-900 text-green-400 rounded-full">LIVE</div>
                <div className="h-64 w-full">
                  <svg className="w-full h-full" viewBox="0 0 800 200">
                    <path d="M0,100 C20,90 40,95 60,95 C100,95 120,90 160,90 C200,90 240,100 280,100 C320,100 360,100 800,100"
                      fill="none" stroke="#10B981" strokeWidth="2" />
                    <path d="M0,100 C20,90 40,120 60,110 C100,80 120,70 160,90 C200,110 240,120 280,90 C320,60 360,120 400,70 C440,100 480,130 520,90 C560,50 600,100 640,80 C680,90 720,70 760,65 C800,60 840,80 880,70"
                      fill="none" stroke="#F97316" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-4">
                  <div>21:00</div>
                  <div>00:00</div>
                  <div>03:00</div>
                  <div>06:00</div>
                  <div>09:00</div>
                  <div>12:00</div>
                  <div>15:00</div>
                  <div>18:00</div>
                </div>
                <div className="flex items-center justify-center gap-8 mt-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Least Stable Provider</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">OpenRouter</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                When an error occurs in an upstream provider, we can recover by routing to another healthy provider, if your request filters allow it.
              </p>
              <p className="text-sm text-gray-700">
                <a href="#" className="text-indigo-600 hover:text-indigo-800">Learn more</a> about our load balancing and customization options.
              </p>
            </motion.div>
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Sample code and API for {model.name}</h2>
              <p className="text-gray-600 mb-6">OpenRouter normalizes requests and responses across providers for you.</p>

              <div className="mb-6">
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create API key
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 text-gray-200 font-mono text-sm overflow-x-auto mb-8">
                <div className="flex gap-2 mb-4 items-center">
                  <span className="bg-gray-700 px-3 py-1 rounded text-xs">openai-python</span>
                  <span className="bg-gray-700 px-3 py-1 rounded text-xs">python</span>
                  <span className="bg-gray-700 px-3 py-1 rounded text-xs">typescript</span>
                </div>
                <pre className="text-green-400">from</pre> openai <pre className="text-green-400">import</pre> OpenAI<br /><br />

                client = OpenAI(<br />
                {'  '}base_url=<pre className="text-orange-300">"https://openrouter.ai/api/v1"</pre>,<br />
                {'  '}api_key=<pre className="text-orange-300">"&lt;OPENROUTER_API_KEY&gt;"</pre>,<br />
                )
                <br /><br />

                completion = client.chat.completions.create(<br />
                {'  '}model=<pre className="text-orange-300">"google/gemini-2.5-pro-preview-03-25"</pre>,<br />
                {'  '}messages=[<br />
                {'    '}&#123;<pre className="text-purple-300">"role"</pre>: <pre className="text-orange-300">"user"</pre>, <pre className="text-purple-300">"content"</pre>: <pre className="text-orange-300">"Hello, who are you?"</pre>&#125;<br />
                {'  '}]<br />
                )<br /><br />

                <pre className="text-blue-400">print</pre>(completion.choices[0].message.content)
              </div>

              <h3 className="text-lg font-medium mb-4">More models from Google</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-[#181818]">
                  <h4 className="font-medium mb-1 text-white">PaLM 2 Chat</h4>
                  <p className="text-sm text-gray-400 mb-3">PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.</p>
                  <button className="text-green-500 text-sm hover:text-green-400">View details →</button>
                </div>

                <div className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-[#181818]">
                  <h4 className="font-medium mb-1 text-white">Gemini 2.5 Flash Preview</h4>
                  <p className="text-sm text-gray-400 mb-3">Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning.</p>
                  <button className="text-green-500 text-sm hover:text-green-400">View details →</button>
                </div>

                <div className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-[#181818]">
                  <h4 className="font-medium mb-1 text-white">Gemini 2.5 Pro Experimental</h4>
                  <p className="text-sm text-gray-400 mb-3">A more advanced version of Gemini 2.5 Pro with experimental features and capabilities.</p>
                  <button className="text-green-500 text-sm hover:text-green-400">View details →</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelDetailsPage;