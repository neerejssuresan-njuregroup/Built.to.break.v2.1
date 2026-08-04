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

// Define the 'admins' table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'ongoing_sessions' table
export const ongoingSessions = pgTable("ongoing_sessions", {
  id: serial("id").primaryKey(),
  sessionCode: text("session_code").notNull().unique(),
  userName: text("user_name").notNull(),
  userState: text("user_state"),
  startTime: timestamp("start_time").defaultNow(),
  status: text("status").notNull(), // 'ongoing', 'completed', 'disqualified'
  proctorLogs: jsonb("proctor_logs").notNull(), // Array of logs
  flags: integer("flags").default(0),
  currentQuestionIndex: integer("current_question_index").default(0),
  scorePercent: integer("score_percent").default(0),
  userPhoto: text("user_photo"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the 'support_tickets' table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketCode: text("ticket_code").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Technical Issue, Exam Proctoring Appeal, Account & Certificate, General Support
  priority: text("priority").notNull(), // P1 - Critical, P2 - High, P3 - Medium, P4 - Low
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("Open"), // Open, In Progress, Pending User Response, Resolved, Closed
  assignedTo: text("assigned_to").default("System Admin"),
  taskId: text("task_id"), // Google Tasks Task ID if synced
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the 'ticket_updates' table
export const ticketUpdates = pgTable("ticket_updates", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  author: text("author").notNull(), // 'User', 'Admin', 'System'
  authorName: text("author_name"),
  message: text("message").notNull(),
  statusChange: text("status_change"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  certificates: many(certificates),
  supportTickets: many(supportTickets),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  updates: many(ticketUpdates),
}));

export const ticketUpdatesRelations = relations(ticketUpdates, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketUpdates.ticketId],
    references: [supportTickets.id],
  }),
}));
