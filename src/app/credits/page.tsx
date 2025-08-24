"use client";
import React, { useState, useEffect } from "react";

interface Token {
    id: string;
    token_name: string;
    credit_limit: number;
    expiry: number;
    enabled: boolean;
    created_at?: string;
    updated_at?: string;
    token?: string; // The actual JWT token
}

interface Transaction {
    id: string;
    type: 'purchase' | 'usage' | 'refund';
    amount: number;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
}

interface JWTPayload {
    exp?: number;
    iat?: number;
    sub?: string;
    credit_limit?: number;
    token_name?: string;
}

export default function CreditsPage() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [creditAmount, setCreditAmount] = useState(10.00);
    const [availableCredits, setAvailableCredits] = useState(0);
    const [newToken, setNewToken] = useState({
        token_name: "",
        credit_limit: 5.00,
        expiry: 30,
        enabled: true
    });

    // Update API base URL to match your backend
    const API_BASE = 'http://localhost:8080';

    // Get auth token from localStorage
    const getAuthToken = () => localStorage.getItem('auth_token');

    // Fetch tokens list
    const fetchTokens = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/listTokens`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTokens(data || []);
            } else if (response.status === 401) {
                // Redirect to login if unauthorized
                window.location.href = '/login';
            } else {
                console.error('Failed to fetch tokens');
            }
        } catch (error) {
            console.error('Error fetching tokens:', error);
        } finally {
            setLoading(false);
        }
    };

    // For now, mock the missing endpoints until backend is updated
    const fetchTransactions = async () => {
        try {
            // TODO: Implement when backend adds transactions endpoint
            console.log('Transactions endpoint not yet implemented');
            setTransactions([]);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchCredits = async () => {
        try {
            // TODO: Implement when backend adds credits endpoint
            console.log('Credits endpoint not yet implemented');
            setAvailableCredits(0);
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const buyCredits = async () => {
        try {
            setIsBuying(true);
            // TODO: Implement when backend adds buyCredits endpoint
            console.log('Buy credits endpoint not yet implemented');
            alert('Credit purchase feature coming soon!');
        } catch (error) {
            console.error('Error purchasing credits:', error);
        } finally {
            setIsBuying(false);
        }
    };

    // Generate new token
    const generateToken = async () => {
        try {
            setIsCreating(true);
            const response = await fetch(`${API_BASE}/generateToken`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newToken)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Token generated:', data);
                // Reset form
                setNewToken({
                    token_name: "",
                    credit_limit: 5.00,
                    expiry: 30,
                    enabled: true
                });
                // Refresh tokens list
                await fetchTokens();
            } else if (response.status === 401) {
                window.location.href = '/login';
            } else {
                console.error('Failed to generate token');
            }
        } catch (error) {
            console.error('Error generating token:', error);
        } finally {
            setIsCreating(false);
        }
    };

    // Delete token
    const deleteToken = async (id: string) => {
        if (!confirm('Are you sure you want to delete this token?')) return;

        try {
            const response = await fetch(`${API_BASE}/deleteToken`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                // Refresh tokens list
                await fetchTokens();
            } else if (response.status === 401) {
                window.location.href = '/login';
            } else {
                console.error('Failed to delete token');
            }
        } catch (error) {
            console.error('Error deleting token:', error);
        }
    };

    // Decode JWT token
    const decodeJWT = (token: string): JWTPayload | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    // Get token expiration status
    const getTokenStatus = (token: Token) => {
        if (!token.token) return { status: 'unknown', expiresAt: null, isExpired: false };

        const payload = decodeJWT(token.token);
        if (!payload?.exp) return { status: 'unknown', expiresAt: null, isExpired: false };

        const expiresAt = new Date(payload.exp * 1000);
        const isExpired = expiresAt < new Date();

        return {
            status: isExpired ? 'expired' : token.enabled ? 'active' : 'disabled',
            expiresAt,
            isExpired
        };
    };

    // Format expiration date
    const formatExpiration = (expiresAt: Date | null) => {
        if (!expiresAt) return 'Unknown';

        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Expired ${Math.abs(diffDays)} days ago`;
        } else if (diffDays === 0) {
            return 'Expires today';
        } else if (diffDays === 1) {
            return 'Expires tomorrow';
        } else if (diffDays <= 7) {
            return `Expires in ${diffDays} days`;
        } else {
            return expiresAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Only fetch tokens for now, until other endpoints are implemented
        fetchTokens();
        fetchTransactions();
        fetchCredits();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credits & API Tokens</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your API tokens and credit balance</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Credits</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${availableCredits.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tokens</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {tokens.filter(t => t.enabled).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credits</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${tokens.reduce((sum, t) => sum + t.credit_limit, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tokens.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Buy Credits */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Buy Credits
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Purchase additional credits for your account</p>
                        </div>

                        <div className="px-6 py-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Credit Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    {[10, 25, 50, 100].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setCreditAmount(amount)}
                                            className="px-3 py-1 text-sm border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded transition duration-200"
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={buyCredits}
                                    disabled={isBuying || creditAmount <= 0}
                                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 px-4 rounded-md transition duration-200 font-medium"
                                >
                                    {isBuying ? 'Processing...' : `Purchase $${creditAmount.toFixed(2)} Credits`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Recent Transactions
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Your recent credit activity</p>
                        </div>

                        <div className="px-6 py-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">No transactions yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {transactions.slice(0, 5).map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${transaction.type === 'purchase'
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : transaction.type === 'usage'
                                                        ? 'bg-red-100 dark:bg-red-900/30'
                                                        : 'bg-blue-100 dark:bg-blue-900/30'
                                                    }`}>
                                                    <svg className={`w-4 h-4 ${transaction.type === 'purchase'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : transaction.type === 'usage'
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-blue-600 dark:text-blue-400'
                                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d={transaction.type === 'purchase' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M20 12H4"} />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {transaction.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(transaction.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${transaction.type === 'purchase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {transaction.type === 'purchase' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                </p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'completed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : transaction.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Create Token */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Generate New Token
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create a new API token with custom settings</p>
                    </div>

                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Token Name
                                </label>
                                <input
                                    type="text"
                                    value={newToken.token_name}
                                    onChange={(e) => setNewToken({ ...newToken, token_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="My API Token"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Credit Limit ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newToken.credit_limit}
                                    onChange={(e) => setNewToken({ ...newToken, credit_limit: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expiry (days)
                                </label>
                                <input
                                    type="number"
                                    value={newToken.expiry}
                                    onChange={(e) => setNewToken({ ...newToken, expiry: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={generateToken}
                                    disabled={isCreating || !newToken.token_name.trim()}
                                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 px-4 rounded-md transition duration-200"
                                >
                                    {isCreating ? 'Generating...' : 'Generate Token'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tokens List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                            </svg>
                            API Tokens
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your active tokens</p>
                    </div>

                    <div className="px-6 py-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tokens...</p>
                            </div>
                        ) : tokens.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400">No tokens found. Generate your first token above.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Token Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Credit Limit
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Expires
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Token Preview
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {tokens.map((token) => {
                                            const tokenStatus = getTokenStatus(token);
                                            return (
                                                <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8">
                                                                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                                    <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                                                        {token.token_name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {token.token_name}
                                                                </div>
                                                                {token.created_at && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Created {formatDate(token.created_at)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        ${token.credit_limit.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatExpiration(tokenStatus.expiresAt)}
                                                        </div>
                                                        {tokenStatus.expiresAt && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {tokenStatus.expiresAt.toLocaleString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tokenStatus.status === 'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : tokenStatus.status === 'expired'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                            <svg className={`w-1.5 h-1.5 mr-1.5 ${tokenStatus.status === 'active' ? 'text-green-400' :
                                                                tokenStatus.status === 'expired' ? 'text-red-400' : 'text-gray-400'
                                                                }`} fill="currentColor" viewBox="0 0 8 8">
                                                                <circle cx={4} cy={4} r={3} />
                                                            </svg>
                                                            {tokenStatus.status === 'active' ? 'Active' :
                                                                tokenStatus.status === 'expired' ? 'Expired' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {token.token ? (
                                                            <div className="flex items-center space-x-2">
                                                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-300">
                                                                    {token.token.substring(0, 20)}...
                                                                </code>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(token.token || '')}
                                                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Copy token"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">Not available</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => deleteToken(token.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}