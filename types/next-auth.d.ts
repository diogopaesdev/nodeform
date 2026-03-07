import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      onboardingCompleted?: boolean;
      trialEnd?: string;
      subscriptionStatus?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboardingCompleted?: boolean;
    trialEnd?: string;
    subscriptionStatus?: string;
  }
}
