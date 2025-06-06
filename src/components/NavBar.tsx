"use client"

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const NavBar = () => {
    const { isAuthenticated } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{ firstname?: string; lastname?: string; email?: string; avatar_url?: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Fetch user info if authenticated
        if (isAuthenticated) {
            authService.getCurrentUser()
                .then(u => setUser(u))
                .catch(() => setUser(null));
        } else {
            setUser(null);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="w-full bg-black border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-medium text-lg text-white">Auto-Router</span>
                        </Link>
                        {/* Show logged-in user name if available */}
                        {mounted && isAuthenticated && user?.firstname && (
                            <span className="ml-4 text-green-400 font-semibold text-base hidden sm:inline-block">
                                Hi, {user.firstname}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search models"
                                className="w-64 bg-[#181818] border border-gray-800 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                <span className="text-xs px-1.5 py-0.5 bg-[#222] rounded">⌘K</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Link href="/models" className="text-green-500 hover:text-green-400 hover:underline-offset-4 hover:underline text-sm transition-all duration-200">Models</Link>
                            <Link href="/chat" className="text-green-500 hover:text-green-400 hover:underline-offset-4 hover:underline text-sm transition-all duration-200">Chat</Link>
                            <Link href="#rankings" className="text-green-500 hover:text-green-400 hover:underline-offset-4 hover:underline text-sm transition-all duration-200">Rankings</Link>
                            <Link href="#docs" className="text-green-500 hover:text-green-400 hover:underline-offset-4 hover:underline text-sm transition-all duration-200">Docs</Link>
                        </div>

                        {mounted && isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-9 h-9 flex items-center justify-center bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 border-2 border-green-400"
                                    aria-label="User menu"
                                    aria-expanded={isDropdownOpen}
                                >
                                    {user?.avatar_url && user.avatar_url !== "null" && user.avatar_url !== "" ? (
                                        <img
                                            src={user.avatar_url}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-black font-semibold text-lg">
                                            {(user?.firstname?.[0] || user?.email?.[0] || "U").toUpperCase()}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.18, ease: "easeOut" }}
                                            className="absolute right-0 mt-2 w-72 bg-[#181818] rounded-xl shadow-2xl border border-[#232323] z-50 overflow-hidden ring-1 ring-black/10"
                                            style={{ transformOrigin: "top right" }}
                                        >
                                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#232323] bg-[#161616]">
                                                {user?.avatar_url && user.avatar_url !== "null" && user.avatar_url !== "" ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt="avatar"
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-lg font-bold text-white border-2 border-green-400">
                                                        {(user?.firstname?.[0] || user?.email?.[0] || "U").toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-white text-base">
                                                        {user?.firstname || "User"} {user?.lastname || ""}
                                                    </div>
                                                    <div className="text-xs text-gray-400">{user?.email}</div>
                                                </div>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/profile" className="flex items-center gap-2 px-5 py-2 text-sm text-gray-200 hover:bg-[#232323] transition-colors duration-150">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Link>
                                                <Link href="/credits" className="flex items-center gap-2 px-5 py-2 text-sm text-gray-200 hover:bg-[#232323] transition-colors duration-150">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Credits
                                                </Link>
                                                <Link href="/keys" className="flex items-center gap-2 px-5 py-2 text-sm text-gray-200 hover:bg-[#232323] transition-colors duration-150">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                    Keys
                                                </Link>
                                                <Link href="/activity" className="flex items-center gap-2 px-5 py-2 text-sm text-gray-200 hover:bg-[#232323] transition-colors duration-150">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Activity
                                                </Link>
                                                <Link href="/settings" className="flex items-center gap-2 px-5 py-2 text-sm text-gray-200 hover:bg-[#232323] transition-colors duration-150">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Settings
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#232323]">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-5 py-3 text-sm text-white bg-green-500 hover:bg-green-600 transition-colors duration-150 font-semibold"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Sign out
                                                </button>
                                            </div>

                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-black-900 border-green-300 border-1 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800 hover:text-white transition-colors duration-200"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;