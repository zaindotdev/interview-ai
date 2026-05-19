import NextAuth from "next-auth";
import { Role } from "@/lib/types";
import {authOptions} from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      hasOnboarded?: boolean;
      emailVerified?: boolean;
      [key: string]: unknown;
    };
  }
  interface User {
    role?: Role;
  }
}



const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
