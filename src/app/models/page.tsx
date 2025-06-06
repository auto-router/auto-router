"use client";

import { useState, useEffect } from "react";
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

// Add this type for your API model data:
type ApiModel = {
  slug: string;
  name: string;
  description?: string;
  author?: string;
  context_length?: number;
  input_modalities?: string[];
  output_modalities?: string[];
  group?: string;
  permaslug?: string;
  categories?: string[];
  endpoint?: {
    provider_name?: string;
    pricing?: {
      prompt?: string;
      completion?: string;
    };
    context_length?: number;
    is_free?: boolean;
    supported_parameters?: string[];
  };
  // ...other fields as needed
};

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
  const [apiModels, setApiModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      try {
        const res = await fetch("/api/models");
        const json = await res.json();
        const mapped = (json.data || []).map((item: ApiModel, idx: number) => ({
          id: item.slug + "-" + (item.permaslug || "") + "-" + idx,
          name: item.name,
          description: item.description || "",
          provider: item.endpoint?.provider_name || item.author || "",
          inputCost: item.endpoint?.pricing?.prompt
            ? Number(item.endpoint.pricing.prompt) * 1_000_000
            : null,
          outputCost: item.endpoint?.pricing?.completion
            ? Number(item.endpoint.pricing.completion) * 1_000_000
            : null,
          context: item.context_length || item.endpoint?.context_length || 0,
          isFree: item.endpoint?.is_free || false,
          modelId: item.permaslug || item.slug || "",
          // Add these for filtering:
          inputModalities: item.input_modalities || [],
          supportedParameters: item.endpoint?.supported_parameters || [],
          series: item.group || "Other",
          categories: item.categories || [], // If categories exist, else []
        }));
        setApiModels(mapped);
      } catch (e) {
        setApiModels([]);
      }
      setLoading(false);
    }
    fetchModels();
  }, []);

  // Use apiModels instead of models
  const models: any[] = apiModels;

  // Dynamically generate filter options from loaded models
  const allProviders = Array.from(new Set(models.map(m => m.provider).filter(Boolean))).sort();
  const allModalities = Array.from(
    new Set(
      models.flatMap(m => m.inputModalities || []).map((m: string) => m.charAt(0).toUpperCase() + m.slice(1))
    )
  );
  const allSeries = Array.from(new Set(models.map(m => m.series).filter(Boolean))).sort();
  const allCategories = Array.from(
    new Set(models.flatMap(m => m.categories || []))
  );
  const allParameters = Array.from(
    new Set(models.flatMap(m => m.supportedParameters || []))
  );

  const modalityOptions = allModalities.length > 0 ? allModalities : ["Text", "Image", "File"];
  const providers = allProviders.length > 0 ? allProviders : ["AI21", "AlonLabs", "Alibaba", "More..."];
  const seriesOptions = allSeries.length > 0 ? allSeries : ["GPT", "Claude", "Gemini"];
  const categories = allCategories.length > 0 ? allCategories : ["Roleplay", "Programming", "Marketing", "More..."];
  const parameters = allParameters.length > 0 ? allParameters : ["tools", "temperature", "top_p", "More..."];

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

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-black">
        <SliderStyles />
        <div className="flex-1 flex items-center justify-center text-white text-lg">Loading models...</div>
      </main>
    );
  }

  // Helper for currency formatting
  const formatCurrency = (amount: number | null) =>
    amount === null
      ? <span className="text-gray-400">N/A</span>
      : <span>${amount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>;

  // Place toggleFilter INSIDE the ModelsPage component, before the return statement:
  const toggleFilter = (type: string, value: string) => {
    switch (type) {
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

  // Reset filters function
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

  // Filtering logic (add this before the return statement)
  const enhancedModels = models.map(model => ({
    ...model,
    categories: model.categories && model.categories.length > 0 ? model.categories : ["General"],
    supportedParameters: model.supportedParameters || [],
    series: model.series || "Other"
  }));

  const filteredModels = enhancedModels.filter(model => {
    // Text search filter
    const textMatch =
      model.name.toLowerCase().includes(filterText.toLowerCase()) ||
      model.description.toLowerCase().includes(filterText.toLowerCase()) ||
      model.modelId.toLowerCase().includes(filterText.toLowerCase());

    // Modality filter
    const modalityMatch =
      selectedModalities.length === 0 ||
      (model.inputModalities || []).some((mod: string) =>
        selectedModalities.includes(mod.charAt(0).toUpperCase() + mod.slice(1))
      );

    // Series filter
    const seriesMatch =
      selectedSeries.length === 0 ||
      selectedSeries.includes(model.series);

    // Category filter
    const categoryMatch =
      selectedCategories.length === 0 ||
      (model.categories || []).some((category: string) => selectedCategories.includes(category));

    // Parameter filter
    const parameterMatch =
      selectedParameters.length === 0 ||
      (model.supportedParameters || []).some((param: string) => selectedParameters.includes(param));

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
      (priceRange >= 20 && priceRange < 60 && model.inputCost !== null && model.inputCost <= 1.0) ||
      (priceRange >= 60);

    return textMatch && modalityMatch && seriesMatch && categoryMatch &&
      parameterMatch && providerMatch && contextMatch && priceMatch;
  });

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <SliderStyles />
      <div className="max-w-7xl mx-auto px-0 py-6 w-full">
        <div className="flex">
          {/* Left Sidebar */}
          <aside
            className="w-72 min-w-[18rem] max-w-[18rem] pr-0 border-r border-gray-800 bg-[#181a1b] rounded-xl shadow min-h-[calc(100vh-48px)] sticky top-0 overflow-y-auto max-h-[calc(100vh-48px)]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#23272b #181a1b"
            }}
          >
            <style jsx global>{`
              aside::-webkit-scrollbar {
                width: 8px;
                background: #181a1b;
                border-radius: 8px;
              }
              aside::-webkit-scrollbar-thumb {
                background: #23272b;
                border-radius: 8px;
              }
              aside::-webkit-scrollbar-thumb:hover {
                background: #2d3238;
              }
            `}</style>
            <div className="flex flex-col gap-4 py-4 px-4">
              {/* Input Modalities */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Input</h3>
                <div className="flex flex-wrap gap-2">
                  {modalityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-1 cursor-pointer text-xs text-gray-200">
                      <input
                        type="checkbox"
                        id={`modality-${option}`}
                        className="h-3 w-3 rounded border-gray-400 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedModalities.includes(option)}
                        onChange={() => toggleFilter('modality', option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Context length slider */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Context</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={contextLengthRange}
                  onChange={(e) => setContextLengthRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                  <span>4K</span>
                  <span>64K</span>
                  <span>1M</span>
                </div>
                <div className="mt-1 text-[11px] text-indigo-400 text-center font-semibold">
                  {contextLengthRange < 30
                    ? "4K-16K"
                    : contextLengthRange < 60
                      ? "32K-64K"
                      : "100K+"}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Price range slider */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Price</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer price-slider"
                />
                <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                  <span>Free</span>
                  <span>$0.5</span>
                  <span>$10+</span>
                </div>
                <div className="mt-1 text-[11px] text-green-500 text-center font-semibold">
                  {priceRange < 20
                    ? "Free"
                    : priceRange < 60
                      ? "< $1/1M"
                      : "Premium"}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Model Series */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Series</h3>
                <div className="flex flex-wrap gap-2">
                  {seriesOptions.slice(0, 8).map((series: string) => (
                    <label key={series} className="flex items-center gap-1 cursor-pointer text-xs text-gray-200">
                      <input
                        type="checkbox"
                        id={`series-${series}`}
                        className="h-3 w-3 rounded border-gray-400 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedSeries.includes(series)}
                        onChange={() => toggleFilter('series', series)}
                      />
                      {series}
                    </label>
                  ))}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Categories */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((category: string) => (
                    <label key={category} className="flex items-center gap-1 cursor-pointer text-xs text-gray-200">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        className="h-3 w-3 rounded border-gray-400 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleFilter('category', category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Parameters */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Parameters</h3>
                <div className="flex flex-wrap gap-2">
                  {parameters.slice(0, 8).map((param: string) => (
                    <label key={param} className="flex items-center gap-1 cursor-pointer text-xs text-gray-200">
                      <input
                        type="checkbox"
                        id={`param-${param}`}
                        className="h-3 w-3 rounded border-gray-400 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedParameters.includes(param)}
                        onChange={() => toggleFilter('param', param)}
                      />
                      {param}
                    </label>
                  ))}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Providers */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Providers</h3>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {providers.slice(0, 12).map((provider: string) => (
                    <label key={provider} className="flex items-center gap-1 cursor-pointer text-xs text-gray-200">
                      <input
                        type="checkbox"
                        id={`provider-${provider}`}
                        className="h-3 w-3 rounded border-gray-400 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedProviders.includes(provider)}
                        onChange={() => toggleFilter('provider', provider)}
                      />
                      {provider}
                    </label>
                  ))}
                </div>
              </section>
              <hr className="my-1 border-gray-700" />

              {/* Clear All Filters button */}
              <button
                onClick={resetFilters}
                className="w-full py-1.5 px-2 border border-gray-700 rounded text-xs font-semibold text-gray-200 bg-[#23272b] hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              >
                Clear All
              </button>
            </div>
          </aside>
          {/* Main Content */}
          <div className="flex-1 pl-8 max-w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white tracking-tight">Models</h1>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  {filteredModels.length === models.length
                    ? `${models.length} models`
                    : `${filteredModels.length} of ${models.length} models`}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded ${viewMode === "table" ? "bg-gray-900" : ""}`}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-900" : ""}`}
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
                    className="w-full bg-[#181818] border border-gray-800 rounded-md py-2 px-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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
              <div className="overflow-x-auto border border-gray-800 rounded-lg shadow bg-[#181818]">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#232323]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Model Name & ID</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Input ($/1M tokens)</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Output ($/1M tokens)</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Context (tokens)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Series</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#181818] divide-y divide-gray-800">
                    {filteredModels.map((model, idx) => (
                      <tr key={model.id || model.modelId || idx} className="hover:bg-[#232323] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div>
                              <div className="flex items-center">
                                <Link href={`/models/${model.id}`} className="text-sm font-semibold text-green-400 hover:underline">
                                  {model.name}
                                </Link>
                                {model.isFree && (
                                  <span className="ml-2 text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full font-medium">Free</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-1">{model.modelId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-300 text-center">
                          {formatCurrency(model.inputCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-300 text-center">
                          {formatCurrency(model.outputCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          {model.context ? model.context.toLocaleString() : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-800 text-gray-300">
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
                {filteredModels.map((model, idx) => (
                  <div key={model.id || model.modelId || idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 bg-white relative overflow-hidden">
                    {/* Top colored accent bar based on model series */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${model.series === 'Gemini' ? 'bg-indigo-500' :
                        model.series === 'Claude' ? 'bg-blue-500' :
                          'bg-pink-500'
                        }`}
                    ></div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/models/${model.id}`} className="font-medium text-indigo-600 text-base hover:text-indigo-700 transition-colors">
                          {model.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-mono mt-1">{model.modelId}</p>
                      </div>
                      <div className="flex space-x-2">
                        {model.isFree && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Free</span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${model.series === 'Gemini' ? 'bg-indigo-50 text-indigo-700' :
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
                        <div className="font-medium">
                          {model.context
                            ? `${(model.context / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`
                            : <span className="text-gray-400">N/A</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {(model.categories && model.categories.length > 0
                          ? model.categories
                          : ["General"]
                        ).map((category: string) => (
                          <span key={category} className="inline-block text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <Link href={`/models/${model.id}`} className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors rounded-md font-medium">
                        View details
                      </Link>
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