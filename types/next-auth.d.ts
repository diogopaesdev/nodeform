import "next-auth";
import { WorkspaceAddons } from "./addon";

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
      addons?: WorkspaceAddons;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboardingCompleted?: boolean;
    trialEnd?: string;
    subscriptionStatus?: string;
    addons?: WorkspaceAddons;
  }
}
