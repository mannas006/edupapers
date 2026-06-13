import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    pg_id: v.optional(v.string()),
    email: v.string(),
    full_name: v.optional(v.union(v.string(), v.null())),
    avatar_url: v.optional(v.union(v.string(), v.null())),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
    university_id: v.optional(v.union(v.string(), v.null())),
    course_id: v.optional(v.union(v.string(), v.null())),
    role: v.optional(v.union(v.string(), v.null())),
  }).index("by_email", ["email"]),

  questions: defineTable({
    pg_id: v.optional(v.string()),
    university_id: v.string(),
    course_id: v.string(),
    semester: v.string(),
    subject_name: v.string(),
    content: v.string(),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
    user_id: v.optional(v.union(v.string(), v.null())),
  }).index("by_route", ["university_id", "course_id", "semester", "subject_name"]),

  papers: defineTable({
    pg_id: v.optional(v.union(v.string(), v.number())),
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
    created_at: v.optional(v.string()),
    processed_at: v.optional(v.union(v.string(), v.null())),
    questions_count: v.optional(v.union(v.number(), v.null())),
    questions_data: v.optional(v.any()),
  }),
});
