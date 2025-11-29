// API routes implementation with Replit Auth and role-based access control
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertTutorSchema, insertTutoringSessionSchema, insertLearningMaterialSchema, insertLectureVideoSchema, insertFeedbackSchema, updateFeedbackSchema, feedback } from "@shared/schema";
import { db } from "./db";
import { users, tutors, tutoringSessions, lectureVideos } from "@shared/schema";
import { eq, count, and, gte, sql } from "drizzle-orm";

// Dummy credentials for demo purposes
const DEMO_USERS = {
  "gnaneswari@gmail.com": {
    password: "password123",
    firstName: "Gnaneswari",
    lastName: "Student",
    role: "student" as const,
  },
  "admin@tutorhub.com": {
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin" as const,
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ==================== Email/Password Auth Routes ====================
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Check demo credentials
      const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
      if (demoUser && demoUser.password === password) {
        // Create or get user in database
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create new user
          user = await storage.createUserWithPassword({
            email,
            password,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            role: demoUser.role,
          });
        }
        
        // Set session
        req.session.userId = user.id;
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Failed to save session" });
          }
          res.json({ success: true, user });
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // ==================== Auth Routes ====================
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for email/password session first
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        return res.json(user || null);
      }
      
      // Fall back to Replit OIDC
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==================== Tutor Routes ====================
  app.get("/api/tutors", isAuthenticated, async (req, res) => {
    try {
      const tutorsList = await storage.getAllTutors();
      res.json(tutorsList);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.post("/api/tutors", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertTutorSchema.parse(req.body);
      const tutor = await storage.createTutor(validatedData);
      res.json(tutor);
    } catch (error: any) {
      console.error("Error creating tutor:", error);
      res.status(400).json({ message: error.message || "Failed to create tutor" });
    }
  });

  app.put("/api/tutors/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTutorSchema.partial().parse(req.body);
      const tutor = await storage.updateTutor(id, validatedData);
      res.json(tutor);
    } catch (error: any) {
      console.error("Error updating tutor:", error);
      res.status(400).json({ message: error.message || "Failed to update tutor" });
    }
  });

  app.delete("/api/tutors/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTutor(id);
      res.json({ message: "Tutor deleted successfully" });
    } catch (error) {
      console.error("Error deleting tutor:", error);
      res.status(500).json({ message: "Failed to delete tutor" });
    }
  });

  // Helper function to get userId from either session or OIDC
  const getUserId = (req: any): string | null => {
    if (req.session?.userId) {
      return req.session.userId;
    }
    return req.user?.claims?.sub || null;
  };

  // ==================== Session Routes ====================
  app.get("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const sessions = await storage.getSessionsByStudentId(userId);
      
      if (!sessions || sessions.length === 0) {
        return res.json([]);
      }
      
      // Fetch related tutor and student data for each session
      const sessionsWithRelations = await Promise.all(
        sessions.map(async (session) => {
          const [tutor] = await db.select().from(tutors).where(eq(tutors.id, session.tutorId));
          const [student] = await db.select().from(users).where(eq(users.id, session.studentId));
          return { ...session, tutor: tutor || null, student: student || null };
        })
      );
      
      res.json(sessionsWithRelations);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/upcoming", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const sessions = await storage.getUpcomingSessions(userId);
      
      if (!sessions || sessions.length === 0) {
        return res.json([]);
      }
      
      const sessionsWithRelations = await Promise.all(
        sessions.map(async (session) => {
          const [tutor] = await db.select().from(tutors).where(eq(tutors.id, session.tutorId));
          const [student] = await db.select().from(users).where(eq(users.id, session.studentId));
          return { ...session, tutor: tutor || null, student: student || null };
        })
      );
      
      res.json(sessionsWithRelations);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming sessions" });
    }
  });

  app.get("/api/sessions/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const allSessions = await storage.getSessionsByStudentId(userId);
      const now = new Date();

      const totalSessions = allSessions.length;
      const completedSessions = allSessions.filter(s => s.status === "completed").length;
      const upcomingSessions = allSessions.filter(
        s => s.status === "scheduled" && new Date(s.scheduledDate) > now
      ).length;

      res.json({
        totalSessions,
        completedSessions,
        upcomingSessions,
      });
    } catch (error) {
      console.error("Error fetching session stats:", error);
      res.status(500).json({ message: "Failed to fetch session stats" });
    }
  });

  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const validatedData = insertTutoringSessionSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error: any) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: error.message || "Failed to create session" });
    }
  });

  app.put("/api/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // Check if user is admin or session owner
      const existingSession = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, id));
      if (!existingSession || existingSession.length === 0) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const user = await storage.getUser(userId);
      const isAdmin = user?.role === "admin";
      const isOwner = existingSession[0].studentId === userId;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Forbidden: You can only update your own sessions" });
      }
      
      // Students can only update status and notes, admins can update all fields
      const allowedFields = isAdmin 
        ? req.body 
        : { status: req.body.status, notes: req.body.notes };
      
      const validatedData = insertTutoringSessionSchema.partial().parse(allowedFields);
      const session = await storage.updateSession(id, validatedData);
      res.json(session);
    } catch (error: any) {
      console.error("Error updating session:", error);
      res.status(400).json({ message: error.message || "Failed to update session" });
    }
  });

  // ==================== Learning Material Routes ====================
  app.get("/api/materials", isAuthenticated, async (req, res) => {
    try {
      const materials = await storage.getAllMaterials();
      
      if (!materials || materials.length === 0) {
        return res.json([]);
      }
      
      const materialsWithRelations = await Promise.all(
        materials.map(async (material) => {
          const [uploadedBy] = await db.select().from(users).where(eq(users.id, material.uploadedById));
          return { ...material, uploadedBy: uploadedBy || null };
        })
      );
      
      res.json(materialsWithRelations);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post("/api/materials", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const validatedData = insertLearningMaterialSchema.parse({
        ...req.body,
        uploadedById: userId,
      });
      const material = await storage.createMaterial(validatedData);
      res.json(material);
    } catch (error: any) {
      console.error("Error creating material:", error);
      res.status(400).json({ message: error.message || "Failed to create material" });
    }
  });

  app.delete("/api/materials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaterial(id);
      res.json({ message: "Material deleted successfully" });
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // ==================== Lecture Video Routes ====================
  app.get("/api/videos", isAuthenticated, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      
      if (!videos || videos.length === 0) {
        return res.json([]);
      }
      
      const videosWithRelations = await Promise.all(
        videos.map(async (video) => {
          const [uploadedBy] = await db.select().from(users).where(eq(users.id, video.uploadedById));
          let tutor = null;
          if (video.tutorId) {
            const [t] = await db.select().from(tutors).where(eq(tutors.id, video.tutorId));
            tutor = t || null;
          }
          return { ...video, uploadedBy: uploadedBy || null, tutor };
        })
      );
      
      res.json(videosWithRelations);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post("/api/videos", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const validatedData = insertLectureVideoSchema.parse({
        ...req.body,
        uploadedById: userId,
      });
      const video = await storage.createVideo(validatedData);
      res.json(video);
    } catch (error: any) {
      console.error("Error creating video:", error);
      res.status(400).json({ message: error.message || "Failed to create video" });
    }
  });

  app.delete("/api/videos/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // ==================== Admin Routes ====================
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [studentsResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "student"));

      const [tutorsResult] = await db
        .select({ count: count() })
        .from(tutors);

      const [totalSessionsResult] = await db
        .select({ count: count() })
        .from(tutoringSessions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [sessionsTodayResult] = await db
        .select({ count: count() })
        .from(tutoringSessions)
        .where(
          and(
            gte(tutoringSessions.scheduledDate, today),
            sql`${tutoringSessions.scheduledDate} < ${tomorrow}`
          )
        );

      res.json({
        totalStudents: studentsResult.count,
        totalTutors: tutorsResult.count,
        totalSessions: totalSessionsResult.count,
        sessionsToday: sessionsTodayResult.count,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/students", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/admin/sessions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      
      if (!sessions || sessions.length === 0) {
        return res.json([]);
      }
      
      const sessionsWithRelations = await Promise.all(
        sessions.map(async (session) => {
          const [tutor] = await db.select().from(tutors).where(eq(tutors.id, session.tutorId));
          const [student] = await db.select().from(users).where(eq(users.id, session.studentId));
          return { ...session, tutor: tutor || null, student: student || null };
        })
      );
      
      res.json(sessionsWithRelations);
    } catch (error) {
      console.error("Error fetching all sessions:", error);
      res.status(500).json({ message: "Failed to fetch all sessions" });
    }
  });

  app.put("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (role !== "student" && role !== "admin") {
        return res.status(400).json({ message: "Invalid role. Must be 'student' or 'admin'" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // ==================== Feedback Routes ====================
  // Get all feedback (admin) or student's own feedback
  app.get("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const user = await storage.getUser(userId);
      
      let feedbackList;
      if (user?.role === "admin") {
        // Admin gets all feedback
        feedbackList = await storage.getAllFeedback();
      } else {
        // Students get only their own feedback
        feedbackList = await storage.getFeedbackByStudentId(userId);
      }
      
      if (!feedbackList || feedbackList.length === 0) {
        return res.json([]);
      }
      
      // Add student relations
      const feedbackWithRelations = await Promise.all(
        feedbackList.map(async (fb) => {
          const [student] = await db.select().from(users).where(eq(users.id, fb.studentId));
          return { ...fb, student: student || null };
        })
      );
      
      res.json(feedbackWithRelations);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Create feedback (students)
  app.post("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const newFeedback = await storage.createFeedback(validatedData);
      res.json(newFeedback);
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: error.message || "Failed to create feedback" });
    }
  });

  // Update feedback status/response (admin only)
  app.put("/api/feedback/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateFeedbackSchema.parse(req.body);
      const updatedFeedback = await storage.updateFeedback(id, validatedData);
      res.json(updatedFeedback);
    } catch (error: any) {
      console.error("Error updating feedback:", error);
      res.status(400).json({ message: error.message || "Failed to update feedback" });
    }
  });

  // Delete feedback (admin only)
  app.delete("/api/feedback/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFeedback(id);
      res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ message: "Failed to delete feedback" });
    }
  });

  // Get feedback stats for admin
  app.get("/api/feedback/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      const pendingCount = allFeedback.filter(f => f.status === "pending").length;
      const reviewedCount = allFeedback.filter(f => f.status === "reviewed").length;
      const resolvedCount = allFeedback.filter(f => f.status === "resolved").length;
      
      res.json({
        total: allFeedback.length,
        pending: pendingCount,
        reviewed: reviewedCount,
        resolved: resolvedCount,
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ message: "Failed to fetch feedback stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
