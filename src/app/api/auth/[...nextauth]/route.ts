import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
    };
  }
  interface User {
    role?: Role;
  }
}

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
        if (!credentials?.email || !credentials.password) return null;
        console.log(credentials)

        const user = await db.user.findUnique({
          where:{
            email:credentials.email
          }
        })
        if (!user) return null;

        if(!user.password) return null;

        const pwValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!pwValid) return null;

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
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },
  events: {
    async createUser({ user }) {
      console.log(user);
      await db.user.update({
        where: { id: user.id },
        data:{
          role:"CANDIDATE",
          username:user?.name ? user.name.replace(/\s/g, "").toLowerCase() : "",
          
        }
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (token.role && session.user) session.user.role = token.role as Role;
      return session;
    },
  },

  pages: { signIn: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
