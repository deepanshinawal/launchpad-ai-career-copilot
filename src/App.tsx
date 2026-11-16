import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { DashboardWorkspace } from "./components/DashboardWorkspace";
import type {
  CareerAnalysisResponse,
  DashboardSection,
  StudentProfile,
} from "./types/career";

const STORAGE_ANALYSIS_KEY = "launchpad_ai_career_analysis_v1";
const STORAGE_MILESTONES_KEY = "launchpad_ai_milestones_v1";
const STORAGE_DELIVERABLES_KEY = "launchpad_ai_deliverables_v1";

const DEFAULT_PROFILE: StudentProfile = {
  name: "",
  education: "",
  currentSkills: [],
  experienceLevel: "Beginner (Coursework Only)",
  targetRole: "",
};

export default function App() {
  const [view, setView] = useState<"landing" | "workspace">("landing");
  const [activeSection, setActiveSection] = useState<DashboardSection>("profile");
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [analysis, setAnalysis] = useState<CareerAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [completedDeliverables, setCompletedDeliverables] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem(STORAGE_ANALYSIS_KEY);
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis) as CareerAnalysisResponse;
        if (parsed && parsed.plan && parsed.profile) {
          setAnalysis(parsed);
          setProfile(parsed.profile);
        }
      }
      const savedMilestones = localStorage.getItem(STORAGE_MILESTONES_KEY);
      if (savedMilestones) {
        setCompletedMilestones(JSON.parse(savedMilestones));
      }
      const savedDeliverables = localStorage.getItem(STORAGE_DELIVERABLES_KEY);
      if (savedDeliverables) {
        setCompletedDeliverables(JSON.parse(savedDeliverables));
      }
    } catch {
      // Ignore malformed localStorage entries
    }
  }, []);

  const handleStartNow = () => {
    setView("workspace");
    if (analysis) {
      setActiveSection("overview");
    } else {
      setActiveSection("profile");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGeneratePlan = async (submittedProfile: StudentProfile) => {
    setProfile(submittedProfile);
    setError(null);
    setIsLoading(true);
    setActiveSection("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await fetch("/api/career-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submittedProfile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      const result = data as CareerAnalysisResponse;
      setAnalysis(result);
      setCompletedMilestones({});
      setCompletedDeliverables({});

      try {
        localStorage.setItem(STORAGE_ANALYSIS_KEY, JSON.stringify(result));
        localStorage.removeItem(STORAGE_MILESTONES_KEY);
        localStorage.removeItem(STORAGE_DELIVERABLES_KEY);
      } catch {
        // Ignore storage quota errors
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while contacting Gemini AI.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMilestone = (key: string) => {
    setCompletedMilestones((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_MILESTONES_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleToggleDeliverable = (key: string) => {
    setCompletedDeliverables((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_DELIVERABLES_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  if (view === "landing") {
    return (
      <LandingPage
        onStartNow={handleStartNow}
        hasExistingPlan={Boolean(analysis)}
      />
    );
  }

  return (
    <DashboardWorkspace
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      onBackToLanding={() => {
        setView("landing");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      profile={profile}
      analysis={analysis}
      isLoading={isLoading}
      error={error}
      onGeneratePlan={handleGeneratePlan}
      completedMilestones={completedMilestones}
      onToggleMilestone={handleToggleMilestone}
      completedDeliverables={completedDeliverables}
      onToggleDeliverable={handleToggleDeliverable}
    />
  );
}
