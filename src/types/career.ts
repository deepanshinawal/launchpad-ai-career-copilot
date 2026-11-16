export type ExperienceLevel =
  | "Beginner (Coursework Only)"
  | "Intermediate (Campus & Personal Projects)"
  | "Advanced (Prior Internship)";

export interface StudentProfile {
  name: string;
  education: string;
  currentSkills: string[];
  experienceLevel: ExperienceLevel;
  targetRole: string;
}

export interface StrengthItem {
  skill: string;
  leverageNote: string;
}

export type SkillPriority = "Critical" | "High" | "Recommended";

export interface MissingSkillItem {
  skill: string;
  priority: SkillPriority;
  reason: string;
  howToAcquire: string;
}

export interface RoadmapMilestone {
  dayLabel: string;
  task: string;
  deliverable: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  dayRange: string;
  theme: string;
  objective: string;
  focusTopics: string[];
  milestones: RoadmapMilestone[];
}

export interface RecommendedProject {
  title: string;
  difficulty: string;
  estimatedTime: string;
  summary: string;
  techStack: string[];
  deliverables: string[];
  resumeImpact: string;
}

export interface CareerPlan {
  executiveSummary: string;
  readinessHeadline: string;
  marketPositioning: string;
  estimatedWeeklyHours: number;
  strengths: StrengthItem[];
  missingSkills: MissingSkillItem[];
  roadmap: RoadmapWeek[];
  projects: RecommendedProject[];
}

export interface CareerAnalysisResponse {
  profile: StudentProfile;
  plan: CareerPlan;
  generatedAt: string;
}

export type DashboardSection =
  | "profile"
  | "overview"
  | "skills"
  | "roadmap"
  | "projects";
