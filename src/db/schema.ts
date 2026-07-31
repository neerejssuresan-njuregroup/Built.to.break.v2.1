import { integer, pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the 'users' table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'certificates' table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  certCode: text("cert_code").notNull().unique(),
  userName: text("user_name").notNull(),
  userState: text("user_state"),
  finalScorePercent: integer("final_score_percent").notNull(),
  certDate: text("cert_date").notNull(),
  activeTab: text("active_tab").notNull(), // 'nbc' or 'show'
  driveFileId: text("drive_file_id"),
  driveViewUrl: text("drive_view_url"),
  status: text("status"),
  userPhoto: text("user_photo"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  idPhoto: text("id_photo"),
  driveIdFileId: text("drive_id_file_id"),
  driveIdViewUrl: text("drive_id_view_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'questions' table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionId: text("question_id").notNull().unique(), // unique string identifier from JS
  title: text("title").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  points: integer("points").notNull(),
  options: jsonb("options").notNull(), // array of options: { id, text, explanation }
  correctId: text("correct_id").notNull(),
  nbcClauses: jsonb("nbc_clauses").notNull(), // array of clauses (strings)
  bnsSection: text("bns_section").notNull(),
  hazardLevel: text("hazard_level").notNull(),
  fact: text("fact").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  certificates: many(certificates),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
}));
