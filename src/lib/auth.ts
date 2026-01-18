import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@/generated/prisma";

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
          hasOnboarded: user.hasOnboarded,
          emailVerified: user.emailVerified ?? false,
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
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger, account }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, hasOnboarded: true, emailVerified: true }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.hasOnboarded = dbUser.hasOnboarded ?? false;
          // Ensure emailVerified is always a boolean
          token.emailVerified = dbUser.emailVerified === true;
          token.userId = dbUser.id;
        }
      }
      if (trigger === "update") {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! },
            select: { id: true, role: true, hasOnboarded: true, emailVerified: true }
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.hasOnboarded = dbUser.hasOnboarded ?? false;
            token.emailVerified = dbUser.emailVerified === true;
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
        (session.user as any).hasOnboarded = token.hasOnboarded ?? false;
        (session.user as any).emailVerified = token.emailVerified === true;
        (session.user as any).userId = token.userId;
      }
      return session;
    },

    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await db.user.findFirst({
            where: {
              email: profile?.email,
            },
          });

          if (!existingUser) {
            try {
              await db.user.create({
                data: {
                  name: profile?.name || "",
                  email: profile?.email || "",
                  username:
                    profile?.name?.replace(/\s/g, "").toLowerCase() || "",
                  role: "CANDIDATE",
                  hasOnboarded: false,
                  emailVerified: true, 
                },
              });
            } catch (createError) {
              console.error("Error creating OAuth user:", createError);
              return false;
            }
          } else if (!existingUser.emailVerified) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: true },
            });
          }

          return true;
        }
        return true;
      } catch (error) {
        console.error("Authentication Error:", error);
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