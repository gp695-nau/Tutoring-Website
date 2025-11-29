import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
  "in_progress",
]);

// User storage table - Required for Replit Auth with role-based access control
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutors table
export const tutors = pgTable("tutors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  hourlyRate: varchar("hourly_rate", { length: 50 }),
  availability: text("availability").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutoring Sessions table
export const tutoringSessions = pgTable("tutoring_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id")
    .notNull()
    .references(() => tutors.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning Materials table
export const learningMaterials = pgTable("learning_materials", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 255 }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }),
  uploadedById: varchar("uploaded_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lecture Videos table
export const lectureVideos = pgTable("lecture_videos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 255 }).notNull(),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: varchar("duration", { length: 50 }),
  tutorId: varchar("tutor_id")
    .references(() => tutors.id, { onDelete: "set null" }),
  uploadedById: varchar("uploaded_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback status enum
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "pending",
  "reviewed",
  "resolved",
]);

// Student Feedback table
export const feedback = pgTable("feedback", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  rating: varchar("rating", { length: 10 }),
  status: feedbackStatusEnum("status").notNull().default("pending"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback relations
export const feedbackRelations = relations(feedback, ({ one }) => ({
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.id],
  }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(tutoringSessions),
  uploadedMaterials: many(learningMaterials),
  uploadedVideos: many(lectureVideos),
  feedback: many(feedback),
}));

export const tutorsRelations = relations(tutors, ({ many }) => ({
  sessions: many(tutoringSessions),
  videos: many(lectureVideos),
}));

export const tutoringSessionsRelations = relations(
  tutoringSessions,
  ({ one }) => ({
    student: one(users, {
      fields: [tutoringSessions.studentId],
      references: [users.id],
    }),
    tutor: one(tutors, {
      fields: [tutoringSessions.tutorId],
      references: [tutors.id],
    }),
  }),
);

export const learningMaterialsRelations = relations(
  learningMaterials,
  ({ one }) => ({
    uploadedBy: one(users, {
      fields: [learningMaterials.uploadedById],
      references: [users.id],
    }),
  }),
);

export const lectureVideosRelations = relations(
  lectureVideos,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [lectureVideos.tutorId],
      references: [tutors.id],
    }),
    uploadedBy: one(users, {
      fields: [lectureVideos.uploadedById],
      references: [users.id],
    }),
  }),
);

// Insert Schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTutorSchema = createInsertSchema(tutors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutoringSessionSchema = createInsertSchema(
  tutoringSessions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export const insertLearningMaterialSchema = createInsertSchema(
  learningMaterials,
).omit({
  id: true,
  createdAt: true,
});

export const insertLectureVideoSchema = createInsertSchema(
  lectureVideos,
).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  adminResponse: true,
  status: true,
});

export const updateFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  studentId: true,
  subject: true,
  message: true,
  rating: true,
}).partial();

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Tutor = typeof tutors.$inferSelect;

export type InsertTutoringSession = z.infer<typeof insertTutoringSessionSchema>;
export type TutoringSession = typeof tutoringSessions.$inferSelect;

export type InsertLearningMaterial = z.infer<
  typeof insertLearningMaterialSchema
>;
export type LearningMaterial = typeof learningMaterials.$inferSelect;

// Extended types for frontend use with relations
export type TutoringSessionWithRelations = TutoringSession & {
  student: User;
  tutor: Tutor;
};

export type LearningMaterialWithRelations = LearningMaterial & {
  uploadedBy: User;
};

export type InsertLectureVideo = z.infer<typeof insertLectureVideoSchema>;
export type LectureVideo = typeof lectureVideos.$inferSelect;

export type LectureVideoWithRelations = LectureVideo & {
  tutor: Tutor | null;
  uploadedBy: User;
};

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type UpdateFeedback = z.infer<typeof updateFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type FeedbackWithRelations = Feedback & {
  student: User;
};
