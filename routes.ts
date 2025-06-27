import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSurveyResponseSchema,
  insertWorkoutEntrySchema,
  insertDietEntrySchema,
  insertRoutineSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Survey routes
  app.get('/api/survey', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const survey = await storage.getSurveyResponse(userId);
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  app.post('/api/survey', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const surveyData = insertSurveyResponseSchema.parse({
        ...req.body,
        userId
      });
      
      const survey = await storage.createSurveyResponse(surveyData);
      
      // Mark onboarding as completed
      await storage.updateUserOnboarding(userId, true);
      
      res.json(survey);
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  // Workout routes
  app.get('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const workouts = await storage.getWorkoutEntries(userId, start, end);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.post('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workoutData = insertWorkoutEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const workout = await storage.createWorkoutEntry(workoutData);
      res.json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.put('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const workoutData = req.body;
      
      const workout = await storage.updateWorkoutEntry(id, workoutData);
      res.json(workout);
    } catch (error) {
      console.error("Error updating workout:", error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  app.delete('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWorkoutEntry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting workout:", error);
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Diet routes
  app.get('/api/diet/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      
      const diet = await storage.getDietEntry(userId, date);
      res.json(diet);
    } catch (error) {
      console.error("Error fetching diet:", error);
      res.status(500).json({ message: "Failed to fetch diet" });
    }
  });

  app.post('/api/diet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dietData = insertDietEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const diet = await storage.upsertDietEntry(dietData);
      res.json(diet);
    } catch (error) {
      console.error("Error saving diet:", error);
      res.status(500).json({ message: "Failed to save diet" });
    }
  });

  // Routine routes
  app.get('/api/routines', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routines = await storage.getUserRoutines(userId);
      res.json(routines);
    } catch (error) {
      console.error("Error fetching routines:", error);
      res.status(500).json({ message: "Failed to fetch routines" });
    }
  });

  app.post('/api/routines', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routineData = insertRoutineSchema.parse({
        ...req.body,
        userId
      });
      
      const routine = await storage.createRoutine(routineData);
      res.json(routine);
    } catch (error) {
      console.error("Error creating routine:", error);
      res.status(500).json({ message: "Failed to create routine" });
    }
  });

  app.put('/api/routines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const routineData = req.body;
      
      const routine = await storage.updateRoutine(id, routineData);
      res.json(routine);
    } catch (error) {
      console.error("Error updating routine:", error);
      res.status(500).json({ message: "Failed to update routine" });
    }
  });

  app.delete('/api/routines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRoutine(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting routine:", error);
      res.status(500).json({ message: "Failed to delete routine" });
    }
  });

  // Stats routes
  app.get('/api/stats/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streak = await storage.getStreakData(userId);
      res.json(streak);
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  app.get('/api/stats/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getWeeklyStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  // Update user preferences
  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { currentTheme, darkMode, notificationsEnabled, mascotName } = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        currentTheme,
        darkMode,
        notificationsEnabled,
        mascotName,
        updatedAt: new Date(),
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
