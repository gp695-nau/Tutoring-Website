// Database storage implementation using Drizzle ORM
// Reference: javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  tutors,
  tutoringSessions,
  learningMaterials,
  lectureVideos,
  feedback,
  type User,
  type UpsertUser,
  type Tutor,
  type InsertTutor,
  type TutoringSession,
  type InsertTutoringSession,
  type LearningMaterial,
  type InsertLearningMaterial,
  type LectureVideo,
  type InsertLectureVideo,
  type Feedback,
  type InsertFeedback,
  type UpdateFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPassword(userData: { email: string; password: string; firstName: string; lastName: string; role: "student" | "admin" }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: "student" | "admin"): Promise<User>;

  // Tutor operations
  getAllTutors(): Promise<Tutor[]>;
  getTutor(id: string): Promise<Tutor | undefined>;
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  updateTutor(id: string, tutor: Partial<InsertTutor>): Promise<Tutor>;
  deleteTutor(id: string): Promise<void>;

  // Tutoring Session operations
  getAllSessions(): Promise<TutoringSession[]>;
  getSessionsByStudentId(studentId: string): Promise<TutoringSession[]>;
  getUpcomingSessions(studentId: string): Promise<TutoringSession[]>;
  createSession(session: InsertTutoringSession): Promise<TutoringSession>;
  updateSession(id: string, session: Partial<InsertTutoringSession>): Promise<TutoringSession>;

  // Learning Material operations
  getAllMaterials(): Promise<LearningMaterial[]>;
  createMaterial(material: InsertLearningMaterial): Promise<LearningMaterial>;
  deleteMaterial(id: string): Promise<void>;

  // Lecture Video operations
  getAllVideos(): Promise<LectureVideo[]>;
  createVideo(video: InsertLectureVideo): Promise<LectureVideo>;
  deleteVideo(id: string): Promise<void>;

  // Feedback operations
  getAllFeedback(): Promise<Feedback[]>;
  getFeedbackByStudentId(studentId: string): Promise<Feedback[]>;
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, feedbackData: UpdateFeedback): Promise<Feedback>;
  deleteFeedback(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUserWithPassword(userData: { email: string; password: string; firstName: string; lastName: string; role: "student" | "admin" }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: "student" | "admin"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Tutor operations
  async getAllTutors(): Promise<Tutor[]> {
    return await db.select().from(tutors).orderBy(desc(tutors.createdAt));
  }

  async getTutor(id: string): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
    return tutor;
  }

  async createTutor(tutorData: InsertTutor): Promise<Tutor> {
    // Remove id from insertData to prevent client-supplied IDs
    const { id: _id, ...insertData } = tutorData as any;
    const [tutor] = await db.insert(tutors).values(insertData).returning();
    return tutor;
  }

  async updateTutor(id: string, tutorData: Partial<InsertTutor>): Promise<Tutor> {
    // Remove id and timestamps from updateData to prevent overwriting
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...updateData } = tutorData as any;
    const [tutor] = await db
      .update(tutors)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tutors.id, id))
      .returning();
    return tutor;
  }

  async deleteTutor(id: string): Promise<void> {
    await db.delete(tutors).where(eq(tutors.id, id));
  }

  // Tutoring Session operations
  async getAllSessions(): Promise<TutoringSession[]> {
    return await db.select().from(tutoringSessions).orderBy(desc(tutoringSessions.scheduledDate));
  }

  async getSessionsByStudentId(studentId: string): Promise<TutoringSession[]> {
    return await db
      .select()
      .from(tutoringSessions)
      .where(eq(tutoringSessions.studentId, studentId))
      .orderBy(desc(tutoringSessions.scheduledDate));
  }

  async getUpcomingSessions(studentId: string): Promise<TutoringSession[]> {
    const now = new Date();
    return await db
      .select()
      .from(tutoringSessions)
      .where(
        and(
          eq(tutoringSessions.studentId, studentId),
          eq(tutoringSessions.status, "scheduled"),
          gte(tutoringSessions.scheduledDate, now)
        )
      )
      .orderBy(tutoringSessions.scheduledDate);
  }

  async createSession(sessionData: InsertTutoringSession): Promise<TutoringSession> {
    // Remove id from insertData to prevent client-supplied IDs
    const { id: _id, ...insertData } = sessionData as any;
    const [session] = await db.insert(tutoringSessions).values(insertData).returning();
    return session;
  }

  async updateSession(id: string, sessionData: Partial<InsertTutoringSession>): Promise<TutoringSession> {
    // Remove id and timestamps from updateData to prevent overwriting
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, studentId: _studentId, tutorId: _tutorId, ...updateData } = sessionData as any;
    const [session] = await db
      .update(tutoringSessions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tutoringSessions.id, id))
      .returning();
    return session;
  }

  // Learning Material operations
  async getAllMaterials(): Promise<LearningMaterial[]> {
    return await db.select().from(learningMaterials).orderBy(desc(learningMaterials.createdAt));
  }

  async createMaterial(materialData: InsertLearningMaterial): Promise<LearningMaterial> {
    // Remove id from insertData to prevent client-supplied IDs
    const { id: _id, ...insertData } = materialData as any;
    const [material] = await db.insert(learningMaterials).values(insertData).returning();
    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(learningMaterials).where(eq(learningMaterials.id, id));
  }

  // Lecture Video operations
  async getAllVideos(): Promise<LectureVideo[]> {
    return await db.select().from(lectureVideos).orderBy(desc(lectureVideos.createdAt));
  }

  async createVideo(videoData: InsertLectureVideo): Promise<LectureVideo> {
    const { id: _id, ...insertData } = videoData as any;
    const [video] = await db.insert(lectureVideos).values(insertData).returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(lectureVideos).where(eq(lectureVideos.id, id));
  }

  // Feedback operations
  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByStudentId(studentId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.studentId, studentId))
      .orderBy(desc(feedback.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const { id: _id, ...insertData } = feedbackData as any;
    const [newFeedback] = await db.insert(feedback).values(insertData).returning();
    return newFeedback;
  }

  async updateFeedback(id: string, feedbackData: UpdateFeedback): Promise<Feedback> {
    const { id: _id, createdAt: _createdAt, ...updateData } = feedbackData as any;
    const [updatedFeedback] = await db
      .update(feedback)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id));
  }
}

export const storage = new DatabaseStorage();
