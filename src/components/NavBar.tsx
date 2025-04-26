"use client"

import React from "react";
import Link from "next/link";

const NavBar = () => (
    <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium text-lg">Auto-Router</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search models" 
                            className="w-64 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-sm focus:outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <span className="text-xs">/</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <Link href="#models" className="text-gray-600 hover:text-gray-900 text-sm">Models</Link>
                        <Link href="#chat" className="text-gray-600 hover:text-gray-900 text-sm">Chat</Link>
                        <Link href="#rankings" className="text-gray-600 hover:text-gray-900 text-sm">Rankings</Link>
                        <Link href="#docs" className="text-gray-600 hover:text-gray-900 text-sm">Docs</Link>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 rounded-full">
                            <span className="text-black font-medium">S</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

export default NavBar;