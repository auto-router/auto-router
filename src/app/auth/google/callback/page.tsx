"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, useAuth } from "@/context/AuthContext";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const { setAuthenticated, refreshAuthState } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const userId = params.get("user_id");

        if (token) {
            // Store all authentication data
            localStorage.setItem("auth_token", token);
            if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
            if (userId) localStorage.setItem("user_id", userId);

            // Update authService tokens in memory
            // @ts-ignore
            authService.token = token;
            // @ts-ignore
            if (refreshToken) authService.refreshToken = refreshToken;
            // @ts-ignore
            if (userId) authService.userId = userId;

            setAuthenticated(true);
            refreshAuthState();
            router.replace("/");
            setTimeout(() => {
                window.location.reload();
            }, 100); // Give router.replace time to complete
        } else {
            router.replace("/login");
        }
    }, [router, setAuthenticated, refreshAuthState]);

    return <div>Signing you in...</div>;
}

