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
        <section className="w-full pt-8 pb-16 bg-black">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-white text-center mb-10">Why Choose Auto-Router?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`text-4xl font-extrabold mb-2 ${stat.highlight ? "text-green-400" : "text-white"}`}>
                                {stat.value}
                            </div>
                            <div className="text-base text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;