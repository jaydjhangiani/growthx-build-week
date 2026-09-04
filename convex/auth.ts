import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const name = String(params.name ?? "").trim();

        if (!emailPattern.test(email)) {
          throw new Error("Enter a valid email address.");
        }

        return { email, ...(name ? { name } : {}) };
      },
      validatePasswordRequirements(password) {
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
          throw new Error("Use 8 or more characters with a letter, number, and symbol.");
        }
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId !== null) return;
      await ctx.db.insert("profiles", {
        userId,
        onboardingComplete: false,
        createdAt: Date.now(),
      });
    },
  },
});
