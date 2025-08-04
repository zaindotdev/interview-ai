import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role, User } from "@/generated/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const pwValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!pwValid) {
          console.error("Invalid password");
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          hasOnboarded: user.hasOnboarded, // Include hasOnboarded from DB
        };
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On sign in, set initial token data
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, hasOnboarded: true }
        });

        token.role = dbUser?.role;
        token.hasOnboarded = dbUser?.hasOnboarded;
        token.userId = dbUser?.id;
      }

      // Handle token refresh - fetch fresh data from database
      // This happens when the token is accessed and needs to be refreshed
      if (trigger === "update" || (!user && token.email)) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! },
            select: { id: true, role: true, hasOnboarded: true }
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.hasOnboarded = dbUser.hasOnboarded;
            token.userId = dbUser.id;
          }
        } catch (error) {
          console.error("Error refreshing token data:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as Role;
        (session.user as any).hasOnboarded = token.hasOnboarded;
        (session.user as any).userId = token.userId;
      }
      return session;
    },

    async signIn({ account, profile, user }) {
      try {
        // For OAuth providers (Google/GitHub)
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await db.user.findFirst({
            where: {
              email: profile?.email,
            },
          });

          // If user doesn't exist, create them
          if (!existingUser) {
            try {
              await db.user.create({
                data: {
                  name: profile?.name || "",
                  email: profile?.email || "",
                  username:
                    profile?.name?.replace(/\s/g, "").toLowerCase() || "",
                  role: "CANDIDATE",
                  hasOnboarded: false, // Explicitly set to false for new users
                },
              });
            } catch (createError) {
              console.error("Error creating OAuth user:", createError);
              return false;
            }
          }

          return true;
        }

        return true;
      } catch (error) {
        console.error(
          "--------------------------- Authentication Error ---------------------------",
        );
        console.error(error);
        return false;
      }
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};