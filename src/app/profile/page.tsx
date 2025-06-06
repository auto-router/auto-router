"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAuthenticated, refreshAuthState } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setProfile(userData);
      } catch (err) {
        setError("Failed to load profile");
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuthenticated(false);
      refreshAuthState(); // Ensure persisted state is updated
      router.push('/login');
    } catch (err) {
      setError("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#181818] border border-green-700 text-green-500 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#181818] shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Sign out
              </button>
            </div>

            {profile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Username</label>
                    <div className="mt-1 text-sm text-gray-100">{profile.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <div className="mt-1 text-sm text-gray-100">{profile.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">First Name</label>
                    <div className="mt-1 text-sm text-gray-100">{profile.firstname}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Last Name</label>
                    <div className="mt-1 text-sm text-gray-100">{profile.lastname}</div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-[#181818] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Change Password
                    </button>
                    <button
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-[#181818] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}