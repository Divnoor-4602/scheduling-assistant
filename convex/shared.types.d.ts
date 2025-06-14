import { Id } from "./_generated/dataModel";

// Project creation arguments
export interface CreateProjectArgs {
  clerkId: string;
  title: string;
  description: string;
  mainTasks: string[];
  deadline: string;
  dailyHours: number;
  weekendWork: boolean;
}

// Project status type
export type ProjectStatus = "active" | "complete" | "cancelled";

// Project creation result
export interface CreateProjectResult {
  projectId: Id<"projects">;
  project: {
    title: string;
    description: string;
    mainTasks: string[];
    deadline: string;
    dailyHours: number;
    weekendWork: boolean;
    status: ProjectStatus;
    createdAt: number;
  };
}
