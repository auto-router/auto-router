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
                            <svg className="w-8 h-8 mr-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 444 444">
                                <path d="M 223 207 L 221 209 L 220 209 L 218 211 L 217 211 L 216 212 L 215 212 L 213 214 L 212 214 L 211 215 L 211 217 L 212 217 L 213 218 L 214 218 L 216 220 L 217 220 L 219 222 L 220 222 L 221 223 L 222 223 L 224 225 L 225 225 L 227 227 L 228 227 L 231 230 L 232 230 L 233 231 L 234 231 L 237 234 L 238 234 L 246 242 L 246 243 L 247 244 L 247 245 L 248 246 L 248 247 L 249 248 L 249 251 L 250 252 L 250 347 L 248 349 L 247 349 L 245 351 L 244 351 L 243 352 L 242 352 L 235 359 L 235 360 L 233 362 L 233 363 L 232 364 L 232 365 L 231 366 L 231 369 L 230 370 L 230 374 L 229 375 L 229 381 L 230 382 L 230 385 L 231 386 L 231 388 L 232 389 L 232 390 L 233 391 L 233 392 L 234 393 L 234 394 L 237 397 L 237 398 L 238 398 L 241 401 L 242 401 L 244 403 L 245 403 L 246 404 L 247 404 L 248 405 L 250 405 L 251 406 L 253 406 L 254 407 L 263 407 L 264 406 L 267 406 L 268 405 L 269 405 L 270 404 L 272 404 L 273 403 L 274 403 L 276 401 L 277 401 L 280 398 L 281 398 L 281 397 L 284 394 L 284 393 L 286 391 L 286 389 L 287 388 L 287 387 L 288 386 L 288 384 L 289 383 L 289 372 L 288 371 L 288 368 L 287 367 L 287 366 L 286 365 L 286 364 L 285 363 L 285 362 L 282 359 L 282 358 L 279 355 L 278 355 L 274 351 L 272 351 L 268 347 L 268 258 L 267 257 L 267 249 L 266 248 L 266 245 L 265 244 L 265 241 L 264 240 L 264 239 L 263 238 L 263 237 L 262 236 L 262 235 L 261 234 L 261 233 L 259 231 L 259 230 L 252 223 L 251 223 L 248 220 L 247 220 L 243 216 L 242 216 L 240 214 L 239 214 L 236 211 L 235 211 L 234 210 L 233 210 L 230 207 Z M 270 38 L 269 39 L 267 39 L 266 40 L 264 40 L 263 41 L 262 41 L 259 44 L 258 44 L 253 49 L 253 50 L 252 51 L 252 52 L 251 53 L 251 54 L 250 55 L 250 56 L 249 57 L 249 59 L 248 60 L 248 63 L 247 64 L 247 68 L 248 69 L 248 74 L 249 75 L 249 77 L 250 78 L 250 79 L 251 80 L 251 81 L 252 82 L 252 83 L 254 85 L 254 86 L 259 91 L 260 91 L 263 94 L 265 94 L 268 97 L 268 121 L 267 122 L 267 128 L 266 129 L 266 131 L 265 132 L 265 133 L 264 134 L 264 135 L 263 136 L 263 137 L 261 139 L 261 140 L 258 143 L 258 144 L 254 148 L 253 148 L 248 153 L 247 153 L 245 155 L 244 155 L 242 157 L 241 157 L 240 158 L 239 158 L 237 160 L 236 160 L 234 162 L 233 162 L 231 164 L 230 164 L 229 165 L 228 165 L 225 168 L 224 168 L 222 170 L 221 170 L 220 171 L 219 171 L 217 173 L 216 173 L 214 175 L 213 175 L 211 177 L 210 177 L 208 179 L 207 179 L 205 181 L 204 181 L 203 182 L 202 182 L 201 183 L 200 183 L 198 181 L 197 181 L 191 175 L 190 175 L 188 173 L 188 172 L 185 169 L 185 168 L 184 167 L 184 166 L 183 165 L 183 163 L 182 162 L 182 154 L 181 153 L 181 127 L 182 126 L 182 124 L 183 123 L 184 123 L 185 122 L 186 122 L 187 121 L 188 121 L 190 119 L 191 119 L 196 114 L 196 113 L 198 111 L 198 110 L 199 109 L 199 108 L 200 107 L 200 105 L 201 104 L 201 102 L 202 101 L 202 89 L 201 88 L 201 85 L 200 84 L 200 83 L 199 82 L 199 81 L 198 80 L 198 79 L 196 77 L 196 76 L 190 70 L 189 70 L 188 69 L 187 69 L 186 68 L 185 68 L 184 67 L 183 67 L 182 66 L 180 66 L 179 65 L 167 65 L 166 66 L 163 66 L 162 67 L 161 67 L 160 68 L 159 68 L 158 69 L 157 69 L 155 71 L 154 71 L 150 75 L 150 76 L 148 78 L 148 79 L 147 80 L 147 81 L 146 82 L 146 84 L 145 85 L 145 86 L 144 87 L 144 102 L 145 103 L 145 104 L 146 105 L 146 107 L 147 108 L 147 110 L 149 112 L 149 113 L 155 119 L 156 119 L 158 121 L 159 121 L 160 122 L 161 122 L 163 124 L 163 125 L 164 126 L 164 136 L 163 137 L 163 158 L 164 159 L 164 164 L 165 165 L 165 167 L 166 168 L 166 169 L 167 170 L 167 172 L 168 173 L 168 174 L 169 175 L 169 176 L 170 177 L 170 178 L 172 180 L 172 181 L 177 186 L 177 187 L 178 187 L 179 188 L 179 189 L 180 189 L 184 193 L 184 194 L 181 197 L 180 197 L 179 198 L 178 198 L 176 200 L 175 200 L 168 207 L 167 207 L 167 208 L 163 212 L 163 213 L 161 215 L 161 216 L 159 218 L 159 219 L 157 221 L 157 222 L 156 223 L 156 224 L 155 225 L 155 227 L 154 228 L 154 230 L 153 231 L 153 233 L 152 234 L 152 236 L 151 237 L 151 243 L 150 244 L 150 294 L 147 297 L 146 297 L 145 298 L 143 298 L 141 300 L 140 300 L 140 301 L 134 307 L 134 308 L 133 309 L 133 310 L 132 311 L 132 312 L 131 313 L 131 317 L 130 318 L 130 329 L 131 330 L 131 334 L 132 335 L 132 337 L 133 338 L 133 339 L 135 341 L 135 342 L 143 350 L 145 350 L 146 351 L 147 351 L 148 352 L 149 352 L 150 353 L 154 353 L 155 354 L 163 354 L 164 353 L 167 353 L 168 352 L 170 352 L 171 351 L 172 351 L 173 350 L 174 350 L 175 349 L 176 349 L 183 342 L 183 341 L 185 339 L 185 338 L 186 337 L 186 335 L 187 334 L 187 331 L 188 330 L 188 319 L 187 318 L 187 315 L 186 314 L 186 312 L 185 311 L 185 310 L 183 308 L 183 307 L 182 306 L 182 305 L 176 299 L 175 299 L 174 298 L 173 298 L 172 297 L 171 297 L 170 296 L 169 296 L 168 295 L 168 293 L 167 292 L 167 246 L 168 245 L 168 241 L 169 240 L 169 237 L 170 236 L 170 235 L 171 234 L 171 233 L 172 232 L 172 231 L 174 229 L 174 228 L 176 226 L 176 225 L 179 222 L 180 222 L 180 221 L 183 218 L 184 218 L 187 215 L 188 215 L 191 212 L 192 212 L 194 210 L 195 210 L 197 208 L 198 208 L 200 206 L 201 206 L 203 204 L 204 204 L 206 202 L 207 202 L 209 200 L 210 200 L 212 198 L 213 198 L 215 196 L 216 196 L 217 195 L 218 195 L 220 193 L 221 193 L 223 191 L 224 191 L 225 190 L 226 190 L 228 188 L 229 188 L 231 186 L 232 186 L 234 184 L 235 184 L 237 182 L 238 182 L 240 180 L 241 180 L 242 179 L 243 179 L 245 177 L 246 177 L 248 175 L 249 175 L 251 173 L 252 173 L 254 171 L 255 171 L 258 168 L 259 168 L 265 162 L 266 162 L 271 157 L 271 156 L 275 152 L 275 151 L 277 149 L 277 148 L 278 147 L 278 146 L 279 145 L 279 144 L 281 142 L 281 140 L 282 139 L 282 138 L 283 137 L 283 135 L 284 134 L 284 132 L 285 131 L 285 127 L 286 126 L 286 97 L 289 94 L 290 94 L 292 92 L 293 92 L 294 91 L 295 91 L 300 86 L 300 85 L 302 83 L 302 82 L 304 80 L 304 79 L 305 78 L 305 75 L 306 74 L 306 69 L 307 68 L 307 65 L 306 64 L 306 60 L 305 59 L 305 57 L 304 56 L 304 55 L 303 54 L 303 53 L 302 52 L 302 51 L 299 48 L 299 47 L 298 46 L 297 46 L 293 42 L 292 42 L 291 41 L 290 41 L 289 40 L 288 40 L 287 39 L 284 39 L 283 38 Z M 156 312 L 157 311 L 161 311 L 162 312 L 164 312 L 170 318 L 170 319 L 171 320 L 171 328 L 169 330 L 169 331 L 166 334 L 165 334 L 164 335 L 163 335 L 162 336 L 156 336 L 155 335 L 153 335 L 152 334 L 151 334 L 149 332 L 149 331 L 147 329 L 147 328 L 146 327 L 146 320 L 148 318 L 148 317 L 152 313 L 153 313 L 154 312 Z M 168 84 L 169 83 L 177 83 L 179 85 L 180 85 L 183 88 L 183 89 L 184 90 L 184 91 L 185 92 L 185 98 L 184 99 L 184 100 L 182 102 L 182 103 L 180 105 L 179 105 L 178 106 L 177 106 L 176 107 L 169 107 L 168 106 L 167 106 L 166 105 L 165 105 L 164 104 L 164 103 L 163 103 L 162 102 L 162 101 L 161 100 L 161 99 L 160 98 L 160 93 L 161 92 L 161 90 L 163 88 L 163 87 L 164 86 L 165 86 L 167 84 Z" fill="#22c55e" stroke="#22c55e" strokeWidth="6" />
                            </svg>

                            <span className="font-medium text-xl text-white">Route-llm</span>
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