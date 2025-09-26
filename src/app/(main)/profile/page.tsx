"use client";
import type React from "react";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";
import { Mail, User, Calendar, Award, Target, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User as UserProfile } from "@/generated/prisma";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Manage loading state locally
  const { status } = useSession();
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Replace with your actual API call
      const response = await axios.get("/api/user/get", {
        headers: {
          // Assuming token is stored in sessionStorage as per original code
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.status !== 200) {
        console.error(response.data.message);
        toast.error(response.data.message);
        setUser(null);
        return;
      }

      // Map API response to UserProfile type
      const apiUser = response.data.data;
      setUser(apiUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message);
        toast.error(
          error.response?.data?.message || "Failed to load profile data.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
      setUser(null); // Ensure user is null on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const response = await signOut();
      if (response) {
        toast.success("Successfully signed out.");
      }
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out.");
    }
  }, [router]);

  useEffect(() => {
    // Only fetch user data if session is loaded and authenticated
    if (status === "authenticated") {
      fetchUser();
    } else if (status === "unauthenticated") {
      setLoading(false); // Stop loading if not authenticated
      setUser(null); // Clear user data if not authenticated
      toast.info("Please sign in to view your profile.");
    }
  }, [status, fetchUser]);

  if (loading || status === "loading") {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="border-primary/20 h-12 w-12 rounded-full border-4"></div>
            <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Loading your profile...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <User className="text-muted-foreground h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold md:text-3xl/8">Profile Not Found</h2>
        <p className="text-muted-foreground max-w-md text-sm md:text-lg">
          We couldn&apos;t load your profile. This might happen if you&apos;re
          not logged in or if there&apos;s an issue with your account.
        </p>
        {status === "unauthenticated" && (
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl/8">
            My Profile
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            Manage your personal information and account settings.
          </p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
          size="icon"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card className="overflow-hidden">
        <CardHeader className="relative p-0">
          <div className="from-primary/20 to-primary/10 h-32 bg-gradient-to-r" />
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage
                src={user.image || "/placeholder.svg"}
                alt={user.name || "User Avatar"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-semibold">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pt-20 pb-6">
          <div className="space-y-1">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              {user.subscriptionId && <Badge>Premium</Badge>}
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="text-muted-foreground flex items-center gap-3">
              <Mail className="text-primary h-5 w-5" />
              <span>{user.email}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-3">
              <Calendar className="text-primary h-5 w-5" />
              <span>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ProfilePage;
