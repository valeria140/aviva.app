import {
  users,
  surveyResponses,
  workoutEntries,
  dietEntries,
  routines,
  type User,
  type UpsertUser,
  type SurveyResponse,
  type InsertSurveyResponse,
  type WorkoutEntry,
  type InsertWorkoutEntry,
  type DietEntry,
  type InsertDietEntry,
  type Routine,
  type InsertRoutine,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserOnboarding(userId: string, hasCompleted: boolean): Promise<User>;
  
  // Survey operations
  getSurveyResponse(userId: string): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  
  // Workout operations
  getWorkoutEntries(userId: string, startDate?: Date, endDate?: Date): Promise<WorkoutEntry[]>;
  createWorkoutEntry(entry: InsertWorkoutEntry): Promise<WorkoutEntry>;
  updateWorkoutEntry(id: number, entry: Partial<InsertWorkoutEntry>): Promise<WorkoutEntry>;
  deleteWorkoutEntry(id: number): Promise<void>;
  
  // Diet operations
  getDietEntry(userId: string, date: string): Promise<DietEntry | undefined>;
  upsertDietEntry(entry: InsertDietEntry): Promise<DietEntry>;
  
  // Routine operations
  getUserRoutines(userId: string): Promise<Routine[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, routine: Partial<InsertRoutine>): Promise<Routine>;
  deleteRoutine(id: number): Promise<void>;
  
  // Stats operations
  getStreakData(userId: string): Promise<{ current: number; best: number }>;
  getWeeklyStats(userId: string): Promise<{ trainedDays: number; totalHours: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserOnboarding(userId: string, hasCompleted: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        hasCompletedOnboarding: hasCompleted,
        isFirstTime: false,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Survey operations
  async getSurveyResponse(userId: string): Promise<SurveyResponse | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.userId, userId));
    return response;
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [created] = await db
      .insert(surveyResponses)
      .values(response)
      .returning();
    return created;
  }

  // Workout operations
  async getWorkoutEntries(userId: string, startDate?: Date, endDate?: Date): Promise<WorkoutEntry[]> {
    let query = db.select().from(workoutEntries).where(eq(workoutEntries.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(workoutEntries.userId, userId),
          gte(workoutEntries.date, startDate.toISOString().split('T')[0]),
          lte(workoutEntries.date, endDate.toISOString().split('T')[0])
        )
      );
    }
    
    return await query.orderBy(desc(workoutEntries.date));
  }

  async createWorkoutEntry(entry: InsertWorkoutEntry): Promise<WorkoutEntry> {
    const [created] = await db
      .insert(workoutEntries)
      .values(entry)
      .returning();
    return created;
  }

  async updateWorkoutEntry(id: number, entry: Partial<InsertWorkoutEntry>): Promise<WorkoutEntry> {
    const [updated] = await db
      .update(workoutEntries)
      .set(entry)
      .where(eq(workoutEntries.id, id))
      .returning();
    return updated;
  }

  async deleteWorkoutEntry(id: number): Promise<void> {
    await db.delete(workoutEntries).where(eq(workoutEntries.id, id));
  }

  // Diet operations
  async getDietEntry(userId: string, date: string): Promise<DietEntry | undefined> {
    const [entry] = await db
      .select()
      .from(dietEntries)
      .where(and(eq(dietEntries.userId, userId), eq(dietEntries.date, date)));
    return entry;
  }

  async upsertDietEntry(entry: InsertDietEntry): Promise<DietEntry> {
    const [upserted] = await db
      .insert(dietEntries)
      .values(entry)
      .onConflictDoUpdate({
        target: [dietEntries.userId, dietEntries.date],
        set: {
          ...entry,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // Routine operations
  async getUserRoutines(userId: string): Promise<Routine[]> {
    return await db
      .select()
      .from(routines)
      .where(eq(routines.userId, userId))
      .orderBy(desc(routines.createdAt));
  }

  async createRoutine(routine: InsertRoutine): Promise<Routine> {
    const [created] = await db
      .insert(routines)
      .values(routine)
      .returning();
    return created;
  }

  async updateRoutine(id: number, routine: Partial<InsertRoutine>): Promise<Routine> {
    const [updated] = await db
      .update(routines)
      .set({
        ...routine,
        updatedAt: new Date(),
      })
      .where(eq(routines.id, id))
      .returning();
    return updated;
  }

  async deleteRoutine(id: number): Promise<void> {
    await db.delete(routines).where(eq(routines.id, id));
  }

  // Stats operations
  async getStreakData(userId: string): Promise<{ current: number; best: number }> {
    const entries = await db
      .select()
      .from(workoutEntries)
      .where(and(eq(workoutEntries.userId, userId), eq(workoutEntries.type, "trained")))
      .orderBy(desc(workoutEntries.date));

    if (entries.length === 0) {
      return { current: 0, best: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevEntryDate = new Date(entries[i - 1].date);
        const daysBetween = Math.floor((prevEntryDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween === 1) {
          tempStreak++;
          if (i === 1 && currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          if (i === 1) currentStreak = 0;
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);
    
    return { current: currentStreak, best: bestStreak };
  }

  async getWeeklyStats(userId: string): Promise<{ trainedDays: number; totalHours: number }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const entries = await this.getWorkoutEntries(userId, weekAgo, new Date());
    const trainedEntries = entries.filter(entry => entry.type === "trained");
    
    const trainedDays = trainedEntries.length;
    const totalMinutes = trainedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal place
    
    return { trainedDays, totalHours };
  }
}

export const storage = new DatabaseStorage();
