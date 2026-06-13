import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const update = mutation({
  args: {
    email: v.string(),
    full_name: v.optional(v.union(v.string(), v.null())),
    role: v.optional(v.union(v.string(), v.null())),
    university_id: v.optional(v.union(v.string(), v.null())),
    course_id: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        full_name: args.full_name,
        role: args.role,
        university_id: args.university_id,
        course_id: args.course_id,
        updated_at: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert("profiles", {
        email: args.email,
        full_name: args.full_name,
        role: args.role,
        university_id: args.university_id,
        course_id: args.course_id,
        updated_at: new Date().toISOString(),
      });
    }
  },
});
