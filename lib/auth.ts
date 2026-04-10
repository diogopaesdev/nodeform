import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getFirebaseAdmin } from "./firebase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { db } = getFirebaseAdmin();
        const snapshot = await db
          .collection("users")
          .where("email", "==", credentials.email)
          .limit(1)
          .get();

        if (snapshot.empty) return null;

        const user = snapshot.docs[0].data();

        if (user.provider !== "credentials" || !user.passwordHash) return null;
        if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
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
            // Verifica se já existe uma conta credentials com o mesmo email
            const emailSnapshot = await db
              .collection("users")
              .where("email", "==", user.email)
              .limit(1)
              .get();

            if (!emailSnapshot.empty) {
              // Email já cadastrado com outro provider — bloqueia o login
              return "/login?error=email-exists";
            }

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
            token.companyName = data.companyName ?? null;
            token.trialEnd = data.trialEnd ?? null;
            token.subscriptionStatus = data.subscriptionStatus ?? null;
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
        session.user.trialEnd = token.trialEnd ?? undefined;
        session.user.subscriptionStatus = token.subscriptionStatus ?? undefined;
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
