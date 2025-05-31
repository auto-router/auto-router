"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const { setAuthenticated, refreshAuthState } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("access_token");
        if (token) {
            localStorage.setItem("auth_token", token);
            authService.getToken = () => token; // Optionally update token in service
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
