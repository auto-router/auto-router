"use client"

import React from "react";

const StatsSection = () => {
    const stats = [
        { value: "7.9T", label: "Tokens Processed" },
        { value: "1.9M", label: "Satisfied Users" },
        { value: "70%", label: "Average Cost Savings" },
        { value: "300+", label: "Supported Models", highlight: true }
    ];

    return (
        <section className="w-full pt-8 pb-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-medium text-center mb-10">Why Choose Auto-Router?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                            <div className={`text-4xl font-bold mb-2 ${stat.highlight ? "text-indigo-500" : "text-gray-800"}`}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 text-center">
                    <h3 className="text-xl font-medium mb-4">Intelligent Routing System</h3>
                    <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                        Our proprietary AI router intelligently analyzes your prompt content and context to select 
                        the most appropriate model for each task, optimizing for cost, performance, and quality.
                    </p>
                    <a href="#learn-more" className="text-indigo-500 hover:text-indigo-600 font-medium">Learn More About Our Technology →</a>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;