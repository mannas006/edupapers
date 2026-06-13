import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    universityId: v.string(),
    courseId: v.string(),
    semester: v.string(),
    subjectName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_route", (q) =>
        q
          .eq("university_id", args.universityId)
          .eq("course_id", args.courseId)
          .eq("semester", args.semester)
          .eq("subject_name", args.subjectName)
      )
      .unique();
  },
});

export const upsert = mutation({
  args: {
    universityId: v.string(),
    courseId: v.string(),
    semester: v.string(),
    subjectName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("questions")
      .withIndex("by_route", (q) =>
        q
          .eq("university_id", args.universityId)
          .eq("course_id", args.courseId)
          .eq("semester", args.semester)
          .eq("subject_name", args.subjectName)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updated_at: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert("questions", {
        university_id: args.universityId,
        course_id: args.courseId,
        semester: args.semester,
        subject_name: args.subjectName,
        content: args.content,
        updated_at: new Date().toISOString(),
      });
    }
  },
});

export const listForSemester = query({
  args: {
    universityId: v.string(),
    courseId: v.string(),
    semester: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_route", (q) =>
        q
          .eq("university_id", args.universityId)
          .eq("course_id", args.courseId)
          .eq("semester", args.semester)
      )
      .collect();
  },
});

export const renameSubject = mutation({
  args: {
    universityId: v.string(),
    courseId: v.string(),
    semester: v.string(),
    oldSubjectName: v.string(),
    newSubjectName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("questions")
      .withIndex("by_route", (q) =>
        q
          .eq("university_id", args.universityId)
          .eq("course_id", args.courseId)
          .eq("semester", args.semester)
          .eq("subject_name", args.oldSubjectName)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        subject_name: args.newSubjectName,
        updated_at: new Date().toISOString(),
      });
    }
  },
});

export const deleteSubject = mutation({
  args: {
    universityId: v.string(),
    courseId: v.string(),
    semester: v.string(),
    subjectName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("questions")
      .withIndex("by_route", (q) =>
        q
          .eq("university_id", args.universityId)
          .eq("course_id", args.courseId)
          .eq("semester", args.semester)
          .eq("subject_name", args.subjectName)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
