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
          console.log("Missing credentials");
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          console.log("User not found");
          return null;
        }

        if (!user.password) {
          console.log("User has no password (probably OAuth)");
          return null;
        }

        const pwValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!pwValid) {
          console.log("Invalid password");
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
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

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as User).role;
      return token;
    },

    async session({ session, token }) {
      if (token.role && session.user) session.user.role = token.role as Role;
      return session;
    },

    async signIn({ account, profile }) {
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
                },
              });
              console.log("New OAuth user created successfully");
            } catch (createError) {
              console.error("Error creating OAuth user:", createError);
              return false;
            }
          }

          return true;
        }

        // For credentials provider, user already exists if we reach here
        return true;
      } catch (error) {
        console.error(
          "--------------------------- Authentication Error ---------------------------"
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
