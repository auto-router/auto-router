"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
    requireValidToken?: boolean;
}

export const ProtectedRoute = ({
    children,
    redirectTo = '/login',
    requireValidToken = true
}: ProtectedRouteProps) => {
    const { isAuthenticated, hasValidAccessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const shouldRedirect = requireValidToken
            ? !hasValidAccessToken
            : !isAuthenticated;

        if (shouldRedirect) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, hasValidAccessToken, requireValidToken, redirectTo, router]);

    // Show loading or return null while redirecting
    if (requireValidToken ? !hasValidAccessToken : !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return <>{children}</>;
};

// HOC for page-level protection
export const withAuth = (
    Component: React.ComponentType,
    options: { requireValidToken?: boolean; redirectTo?: string } = {}
) => {
    return function AuthenticatedComponent(props: any) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
};
