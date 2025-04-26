"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  inputCost: number;
  outputCost: number;
  context: number;
  isFree: boolean;
  modelId: string;
}

interface EnhancedModel extends Model {
  categories: string[];
  supportedParameters: string[];
  series: string;
}

const SliderStyles = () => (
  <style jsx global>{`
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 8px;
      outline: none;
    }
    
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 2px solid #6366f1;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
    }
    
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    
    input[type=range]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 2px solid #6366f1;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
    }
    
    input[type=range]::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }

    input[type=range].price-slider::-webkit-slider-thumb {
      border-color: #10b981;
    }
    
    input[type=range].price-slider::-moz-range-thumb {
      border-color: #10b981;
    }
  `}</style>
);

export default function ModelsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filterText, setFilterText] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [contextLengthRange, setContextLengthRange] = useState(50); // 0-100 range
  const [priceRange, setPriceRange] = useState(20); // 0-100 range
  
  const resetFilters = () => {
    setFilterText("");
    setSelectedModalities([]);
    setSelectedSeries([]);
    setSelectedCategories([]);
    setSelectedParameters([]);
    setSelectedProviders([]);
    setContextLengthRange(50);
    setPriceRange(20);
  };
  
  const toggleFilter = (type: string, value: string) => {
    switch(type) {
      case 'modality':
        setSelectedModalities(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'series':
        setSelectedSeries(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'category':
        setSelectedCategories(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'param':
        setSelectedParameters(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'provider':
        setSelectedProviders(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
    }
  };
  
  // Dummy data to match the screenshots
  const models: Model[] = [
    {
      id: "thudm-glm-z1-rumination-32b",
      name: "THUDM: GLM Z1 Rumination 32B",
      description: "A 32B-parameter deep reasoning model from the GLM-4-Z1 series, optimized for complex, open-ended tasks requiring prolonged deliberation.",
      provider: "thudm",
      inputCost: 0.24,
      outputCost: 0.24,
      context: 32000,
      isFree: false,
      modelId: "thudm/glm-z1-rumination-32b"
    },
    {
      id: "thudm-glm-z1-9b-free",
      name: "THUDM: GLM Z1 9B (free)",
      description: "GLM-Z1-9B-0414 is a 9B-parameter language model developed by THUDM as part of the GLM-4 family.",
      provider: "thudm",
      inputCost: 0,
      outputCost: 0,
      context: 32000,
      isFree: true,
      modelId: "thudm/glm-z1-9b:free"
    },
    {
      id: "thudm-glm-4-9b-free",
      name: "THUDM: GLM 4 9B (free)",
      description: "GLM-4-9B-0414 is a 9 billion parameter language model from the GLM-4 series developed by THUDM.",
      provider: "thudm",
      inputCost: 0,
      outputCost: 0,
      context: 32000,
      isFree: true,
      modelId: "thudm/glm-4-9b:free"
    },
    {
      id: "microsoft-mai-ds-r1-free",
      name: "Microsoft: MAI DS R1 (free)",
      description: "Microsoft's foundational AI model designed for document processing and summarization tasks.",
      provider: "microsoft",
      inputCost: 0,
      outputCost: 0,
      context: 163840,
      isFree: true,
      modelId: "microsoft/mai-ds-r1:free"
    },
    {
      id: "google-gemini-2-5-pro-preview",
      name: "Google: Gemini 2.5 Pro Preview",
      description: "Google's latest Gemini model with significantly improved reasoning and multimodal capabilities.",
      provider: "google",
      inputCost: 1.25,
      outputCost: 10,
      context: 1048576,
      isFree: false,
      modelId: "google/gemini-2.5-pro-preview-03-25"
    },
    {
      id: "thudm-glm-z1-32b-free",
      name: "THUDM: GLM Z1 32B (free)",
      description: "The free tier version of THUDM's 32B parameter language model from the GLM-Z1 series.",
      provider: "thudm",
      inputCost: 0,
      outputCost: 0,
      context: 32768,
      isFree: true,
      modelId: "thudm/glm-z1-32b:free"
    },
    {
      id: "thudm-glm-z1-32b",
      name: "THUDM: GLM Z1 32B",
      description: "THUDM's 32B parameter language model from the GLM-Z1 series with full capabilities.",
      provider: "thudm",
      inputCost: 0.24,
      outputCost: 0.24,
      context: 32000,
      isFree: false,
      modelId: "thudm/glm-z1-32b"
    }
  ];

  // Assign each model to categories and support for parameters
  const enhancedModels = models.map(model => ({
    ...model,
    categories: [
      model.provider === 'google' ? 'Programming' : 
      model.provider === 'microsoft' ? 'Marketing' : 'Roleplay'
    ],
    supportedParameters: [
      model.isFree ? 'temperature' : 'tools',
      'top_p'
    ],
    series: model.name.includes('GLM') ? 'Gemini' : 
            model.name.includes('MAI') ? 'Claude' : 'GPT'
  }));

  // Filter models based on all filter criteria
  const filteredModels = enhancedModels.filter(model => {
    // Text search filter
    const textMatch = 
      model.name.toLowerCase().includes(filterText.toLowerCase()) ||
      model.description.toLowerCase().includes(filterText.toLowerCase()) ||
      model.modelId.toLowerCase().includes(filterText.toLowerCase());
    
    // Modality filter - we'll assume all are text models
    const modalityMatch = 
      selectedModalities.length === 0 || 
      selectedModalities.includes('Text');
    
    // Series filter
    const seriesMatch = 
      selectedSeries.length === 0 || 
      selectedSeries.includes(model.series);
    
    // Category filter
    const categoryMatch = 
      selectedCategories.length === 0 || 
      model.categories.some(category => selectedCategories.includes(category));
    
    // Parameter filter
    const parameterMatch = 
      selectedParameters.length === 0 || 
      model.supportedParameters.some(param => selectedParameters.includes(param));
    
    // Provider filter
    const providerMatch = 
      selectedProviders.length === 0 || 
      selectedProviders.includes(model.provider);
    
    // Context length filter - based on slider value
    const contextMatch = 
      (contextLengthRange < 30 && model.context <= 16000) ||
      (contextLengthRange >= 30 && contextLengthRange < 60 && model.context > 16000 && model.context <= 64000) ||
      (contextLengthRange >= 60 && model.context > 64000);
    
    // Price filter - based on slider value
    const priceMatch = 
      (priceRange < 20 && model.isFree) ||
      (priceRange >= 20 && priceRange < 60 && model.inputCost <= 1.0) ||
      (priceRange >= 60);
    
    return textMatch && modalityMatch && seriesMatch && categoryMatch && 
           parameterMatch && providerMatch && contextMatch && priceMatch;
  });

  // Categories like in the left sidebar in the screenshots
  const categories = ["Roleplay", "Programming", "Marketing", "More..."];
  const parameters = ["tools", "temperature", "top_p", "More..."];
  const providers = ["AI21", "AlonLabs", "Alibaba", "More..."];
  const modalityOptions = ["Text", "Image", "File"];
  
  // For context length slider in UI
  const contextLengths = [
    { value: "4K", position: "0%" },
    { value: "64K", position: "40%" },
    { value: "1M", position: "100%" }
  ];
  
  // For pricing slider in UI
  const pricingOptions = [
    { value: "FREE", position: "0%" },
    { value: "$0.5", position: "50%" },
    { value: "$10+", position: "100%" }
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <SliderStyles />
      <div className="max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="flex">
          {/* Left Sidebar - Updated for cleaner design */}
          <div className="w-64 pr-6 border-r border-gray-200 relative">
            {/* Add a subtle shadow for separation */}
            <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
            {/* Input Modalities */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Input Modalities</h3>
              <div className="space-y-1">
                {modalityOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`modality-${option}`}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedModalities.includes(option)}
                      onChange={() => toggleFilter('modality', option)}
                    />
                    <label htmlFor={`modality-${option}`} className="ml-2 text-sm text-gray-600">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Context length slider */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Context Length</h3>
              <div className="px-1 pt-2 pb-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={contextLengthRange}
                  onChange={(e) => setContextLengthRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-blue-300 to-indigo-500 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>4K</span>
                  <span>64K</span>
                  <span>1M+</span>
                </div>
                <div className="mt-3 text-xs px-2 py-1 bg-indigo-50 rounded text-indigo-700 text-center">
                  {contextLengthRange < 30 
                    ? "4K-16K tokens" 
                    : contextLengthRange < 60 
                    ? "32K-64K tokens" 
                    : "100K+ tokens"}
                </div>
              </div>
            </div>
            
            {/* Price range slider */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
              <div className="px-1 pt-2 pb-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-green-300 to-blue-500 rounded-lg appearance-none cursor-pointer price-slider"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>FREE</span>
                  <span>$0.5</span>
                  <span>$10+</span>
                </div>
                <div className="mt-3 text-xs px-2 py-1 bg-green-50 rounded text-green-700 text-center">
                  {priceRange < 20 
                    ? "Free models only" 
                    : priceRange < 60 
                    ? "Under $1 per 1M tokens" 
                    : "Premium models"}
                </div>
              </div>
            </div>
            
            {/* Series */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Model Series</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="series-gpt"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedSeries.includes('GPT')}
                    onChange={() => toggleFilter('series', 'GPT')}
                  />
                  <label htmlFor="series-gpt" className="ml-2 text-sm text-gray-600">
                    GPT
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="series-claude"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedSeries.includes('Claude')}
                    onChange={() => toggleFilter('series', 'Claude')}
                  />
                  <label htmlFor="series-claude" className="ml-2 text-sm text-gray-600">
                    Claude
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="series-gemini"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedSeries.includes('Gemini')}
                    onChange={() => toggleFilter('series', 'Gemini')}
                  />
                  <label htmlFor="series-gemini" className="ml-2 text-sm text-gray-600">
                    Gemini
                  </label>
                </div>
              </div>
            </div>
            
            {/* Categories with cleaner design */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">
                  See all
                </button>
              </div>
              <div className="space-y-1">
                {categories.slice(0, 3).map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-600">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Parameters */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Supported Parameters</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">
                  See all
                </button>
              </div>
              <div className="space-y-1">
                {parameters.slice(0, 3).map((param) => (
                  <div key={param} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`param-${param}`}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedParameters.includes(param)}
                      onChange={() => toggleFilter('param', param)}
                    />
                    <label htmlFor={`param-${param}`} className="ml-2 text-sm text-gray-600">
                      {param}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Providers */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Providers</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">
                  See all
                </button>
              </div>
              <div className="space-y-1">
                {providers.slice(0, 3).map((provider) => (
                  <div key={provider} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`provider-${provider}`}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedProviders.includes(provider)}
                      onChange={() => toggleFilter('provider', provider)}
                    />
                    <label htmlFor={`provider-${provider}`} className="ml-2 text-sm text-gray-600">
                      {provider}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Clear All Filters button */}
            <button 
              onClick={resetFilters}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear All Filters
            </button>
          </div>

          {/* Main Content - Updated with left padding for separation */}
          <div className="flex-1 pl-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Models</h1>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  {filteredModels.length === models.length 
                    ? `${models.length} models` 
                    : `${filteredModels.length} of ${models.length} models`}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded ${viewMode === "table" ? "bg-gray-100" : ""}`}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Filter models" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-200"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Active Filters */}
                {(selectedModalities.length > 0 || 
                  selectedSeries.length > 0 || 
                  selectedCategories.length > 0 || 
                  selectedParameters.length > 0 || 
                  selectedProviders.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 mr-1 pt-1">Active filters:</span>
                    
                    {selectedModalities.map(modality => (
                      <span 
                        key={modality} 
                        className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                      >
                        {modality}
                        <button 
                          type="button" 
                          className="ml-1 inline-flex items-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600"
                          onClick={() => toggleFilter('modality', modality)}
                        >
                          <span className="sr-only">Remove filter for {modality}</span>
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    
                    {selectedSeries.map(series => (
                      <span 
                        key={series} 
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {series}
                        <button 
                          type="button" 
                          className="ml-1 inline-flex items-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                          onClick={() => toggleFilter('series', series)}
                        >
                          <span className="sr-only">Remove filter for {series}</span>
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    
                    {selectedCategories.map(category => (
                      <span 
                        key={category} 
                        className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                      >
                        {category}
                        <button 
                          type="button" 
                          className="ml-1 inline-flex items-center rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                          onClick={() => toggleFilter('category', category)}
                        >
                          <span className="sr-only">Remove filter for {category}</span>
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    
                    {selectedParameters.map(param => (
                      <span 
                        key={param} 
                        className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                      >
                        {param}
                        <button 
                          type="button" 
                          className="ml-1 inline-flex items-center rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                          onClick={() => toggleFilter('param', param)}
                        >
                          <span className="sr-only">Remove filter for {param}</span>
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    
                    {selectedProviders.map(provider => (
                      <span 
                        key={provider} 
                        className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                      >
                        {provider}
                        <button 
                          type="button" 
                          className="ml-1 inline-flex items-center rounded-full text-amber-400 hover:bg-amber-200 hover:text-amber-600"
                          onClick={() => toggleFilter('provider', provider)}
                        >
                          <span className="sr-only">Remove filter for {provider}</span>
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Model Name & ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Input ($/1M tokens)
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Output ($/1M tokens)
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Context (tokens)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Series
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredModels.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">{model.name}</span>
                                {model.isFree && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Free</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-1">{model.modelId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                          ${model.inputCost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                          ${model.outputCost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                          {model.context.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span 
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              model.series === 'Gemini' ? 'bg-indigo-50 text-indigo-700' : 
                              model.series === 'Claude' ? 'bg-blue-50 text-blue-700' : 
                              'bg-pink-50 text-pink-700'
                            }`}
                          >
                            {model.series}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModels.map((model) => (
                  <div key={model.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 bg-white relative overflow-hidden">
                    {/* Top colored accent bar based on model series */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        model.series === 'Gemini' ? 'bg-indigo-500' : 
                        model.series === 'Claude' ? 'bg-blue-500' : 
                        'bg-pink-500'
                      }`}
                    ></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-indigo-600 text-base hover:text-indigo-700 transition-colors">
                          {model.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">{model.modelId}</p>
                      </div>
                      <div className="flex space-x-2">
                        {model.isFree && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Free</span>
                        )}
                        <span 
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            model.series === 'Gemini' ? 'bg-indigo-50 text-indigo-700' : 
                            model.series === 'Claude' ? 'bg-blue-50 text-blue-700' : 
                            'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {model.series}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2 overflow-hidden text-ellipsis min-h-[40px]">
                      {model.description}
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4 text-xs">
                      <div className="flex flex-col">
                        <div className="text-gray-500 mb-1">Input</div>
                        <div className="font-medium">${model.inputCost.toFixed(2)}/1M</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-gray-500 mb-1">Output</div>
                        <div className="font-medium">${model.outputCost.toFixed(2)}/1M</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-gray-500 mb-1">Context</div>
                        <div className="font-medium">{(model.context / 1000)}K</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {model.categories.map(category => (
                          <span key={category} className="inline-block text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <button className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors rounded-md font-medium">
                        Try model
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 