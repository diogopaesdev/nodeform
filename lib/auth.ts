import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getFirebaseAdmin } from "./firebase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { db } = getFirebaseAdmin();

          const userRef = db.collection("users").doc(user.id);
          const userDoc = await userRef.get();

          if (!userDoc.exists) {
            await userRef.set({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              onboardingCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            await userRef.update({
              name: user.name,
              email: user.email,
              image: user.image,
              updatedAt: new Date().toISOString(),
            });
          }

          return true;
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // No primeiro login ou ao forçar atualização, lê onboardingCompleted do Firestore
      if (user || trigger === "update") {
        try {
          const { db } = getFirebaseAdmin();
          const userId = token.sub!;
          const userDoc = await db.collection("users").doc(userId).get();
          if (userDoc.exists) {
            const data = userDoc.data()!;
            token.onboardingCompleted = data.onboardingCompleted ?? false;
          }
        } catch {
          // mantém o valor anterior em caso de erro
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
