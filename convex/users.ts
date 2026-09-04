import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const [user, profile] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
    ]);

    if (user === null) return null;
    return {
      name: user.name ?? null,
      email: user.email ?? null,
      onboardingComplete: profile?.onboardingComplete ?? false,
    };
  },
});
