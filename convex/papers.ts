import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    user_id: v.string(),
    university: v.string(),
    course: v.string(),
    semester: v.string(),
    year: v.number(),
    subject: v.string(),
    file_url: v.string(),
    file_name: v.string(),
    uploader_name: v.string(),
    processing_status: v.string(),
  },
  handler: async (ctx, args) => {
    const paperId = await ctx.db.insert("papers", {
      ...args,
      created_at: new Date().toISOString(),
    });
    return { id: paperId };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
