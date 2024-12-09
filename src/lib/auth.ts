import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Add this to handle errors by redirecting to login page
    signOut: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user = {
          ...session.user,
          id: token.sub!,
        };
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Add this to handle the redirect after sign in
    async redirect({ url, baseUrl }) {
      // If the url is relative, prefix it with the base url
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the url is already absolute but on the same host, return it
      else if (new URL(url).origin === baseUrl) return url;
      // Return to the homepage by default
      return baseUrl;
    },
  },
};
