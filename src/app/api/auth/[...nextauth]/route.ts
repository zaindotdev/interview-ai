import NextAuth from "next-auth";
import { Role } from "@/generated/prisma";
import {authOptions} from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: any;
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



const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
