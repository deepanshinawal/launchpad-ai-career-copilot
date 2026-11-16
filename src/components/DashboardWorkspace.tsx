import React, { useState, useEffect } from "react";
import {
  User,
  LayoutDashboard,
  Target,
  CalendarDays,
  FolderGit2,
  ArrowLeft,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type {
  CareerAnalysisResponse,
  DashboardSection,
  StudentProfile,
} from "../types/career";
import { StudentProfileForm } from "./StudentProfileForm";

interface DashboardWorkspaceProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  onBackToLanding: () => void;
  profile: StudentProfile;
  analysis: CareerAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  onGeneratePlan: (profile: StudentProfile) => void;
  completedMilestones: Record<string, boolean>;
  onToggleMilestone: (key: string) => void;
  completedDeliverables: Record<string, boolean>;
  onToggleDeliverable: (key: string) => void;
}

const LOADING_STAGES = [
  "Evaluating degree, coursework, and current skill coverage",
  "Identifying role-specific strengths and missing competencies",
  "Structuring four-week 30-day learning sprints and milestones",
  "Scoping three practical portfolio projects and resume bullets",
];

const SECTION_LABELS: Record<DashboardSection, string> = {
  profile: "Student Profile",
  overview: "Career Overview",
  skills: "Strengths & Missing Skills",
  roadmap: "30-Day Learning Roadmap",
  projects: "Recommended Projects",
};

export const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
  activeSection,
  onSelectSection,
  onBackToLanding,
  profile,
  analysis,
  isLoading,
  error,
  onGeneratePlan,
  completedMilestones,
  onToggleMilestone,
  completedDeliverables,
  onToggleDeliverable,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [copiedProjectIdx, setCopiedProjectIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStageIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingStageIndex((prev) =>
        prev < LOADING_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  const handleNavClick = (section: DashboardSection) => {
    if (section !== "profile" && !analysis && !isLoading) return;
    onSelectSection(section);
    setMobileMenuOpen(false);
  };

  const handleCopyResumeBullet = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedProjectIdx(idx);
      window.setTimeout(() => setCopiedProjectIdx(null), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const totalMilestones = analysis
    ? analysis.plan.roadmap.reduce((acc, w) => acc + w.milestones.length, 0)
    : 0;

  const doneMilestones = analysis
    ? analysis.plan.roadmap.reduce(
        (acc, w) =>
          acc +
          w.milestones.filter(
            (_m, mIdx) => completedMilestones[`w${w.weekNumber}-m${mIdx}`]
          ).length,
        0
      )
    : 0;

  const navItems: {
    id: DashboardSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    requiresPlan: boolean;
  }[] = [
    { id: "profile", label: "Student Profile", icon: User, requiresPlan: false },
    { id: "overview", label: "Career Overview", icon: LayoutDashboard, requiresPlan: true },
    { id: "skills", label: "Strengths & Gaps", icon: Target, requiresPlan: true },
    { id: "roadmap", label: "30-Day Roadmap", icon: CalendarDays, requiresPlan: true },
    { id: "projects", label: "Project Lab", icon: FolderGit2, requiresPlan: true },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1221] text-white">
      <div className="px-6 h-16 flex items-center justify-between border-b border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onBackToLanding}
          className="font-display text-lg font-bold tracking-tight text-white hover:text-violet-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          LaunchPad AI
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-md cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Dashboard sections" className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.requiresPlan && !analysis && !isLoading;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-violet-700 text-white"
                  : isDisabled
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-slate-300 hover:bg-[#131F38] hover:text-white cursor-pointer"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        {analysis && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-slate-400">Active Profile</p>
            <p className="mt-0.5 text-sm font-semibold text-white truncate">
              {analysis.profile.name}
            </p>
            <p className="text-xs text-violet-300 truncate">
              {analysis.profile.targetRole}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onBackToLanding}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#131F38] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Back to Landing Page</span>
        </button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="max-w-5xl space-y-8" aria-live="polite" aria-busy="true">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-violet-50 text-violet-700 shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-[#0B1221]">
              Building career plan for {profile.targetRole || "your target role"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Gemini AI is analyzing your background, skill set, and experience level.
            </p>

            <ul className="mt-6 space-y-3">
              {LOADING_STAGES.map((stage, idx) => {
                const completed = idx < loadingStageIndex;
                const current = idx === loadingStageIndex;
                return (
                  <li
                    key={stage}
                    className={`flex items-center gap-3 text-sm ${
                      completed
                        ? "text-emerald-700 font-medium"
                        : current
                        ? "text-[#0B1221] font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    ) : current ? (
                      <Loader2 className="w-4 h-4 text-violet-700 animate-spin shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{stage}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Geometry-matched Skeleton Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-24 bg-white border border-slate-200 rounded-xl p-5 animate-pulse"
          >
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="mt-4 h-6 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="mt-4 space-y-2.5">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
            <div className="h-3 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-56 bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="mt-4 space-y-2.5">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
            <div className="h-3 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!analysis) return null;
    const { plan, profile: analyzedProfile } = analysis;
    const progressPct =
      totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

    return (
      <div className="max-w-6xl space-y-8">
        {/* Readiness Header Banner */}
        <section className="bg-[#0B1221] text-white rounded-xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium text-violet-300">
                Target Role: {analyzedProfile.targetRole} · {analyzedProfile.education}
              </p>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]">
                {plan.readinessHeadline}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                {plan.executiveSummary}
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onSelectSection("roadmap")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Start Week 1 Plan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Verifiable 4-Column Metric Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-6">
            <p className="text-xs font-medium text-slate-500">Recommended Pace</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#0B1221] tabular-nums">
              {plan.estimatedWeeklyHours} hrs / wk
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-slate-500">Identified Strengths</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#0B1221] tabular-nums">
              {plan.strengths.length}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-slate-500">Priority Skill Gaps</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#0B1221] tabular-nums">
              {plan.missingSkills.length}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-slate-500">30-Day Milestones</p>
            <p className="mt-2 font-display text-2xl font-bold text-violet-700 tabular-nums">
              {doneMilestones} / {totalMilestones} ({progressPct}%)
            </p>
          </div>
        </section>

        {/* Market Positioning & Current Skills Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-[#0B1221]">
              Resume & Interview Positioning
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {plan.marketPositioning}
            </p>
            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500">Current Skills Evaluated</p>
              <p className="mt-1.5 text-sm font-medium text-[#0B1221]">
                {analyzedProfile.currentSkills.join(" · ")}
              </p>
            </div>
          </section>

          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B1221]">
                Next Workspace Steps
              </h2>
              <div className="mt-4 divide-y divide-slate-200">
                <button
                  type="button"
                  onClick={() => onSelectSection("skills")}
                  className="w-full py-3 flex items-center justify-between text-left hover:text-violet-700 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Review {plan.strengths.length} strengths & {plan.missingSkills.length} missing skills
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection("roadmap")}
                  className="w-full py-3 flex items-center justify-between text-left hover:text-violet-700 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Track your 4-week, 30-day learning schedule
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSection("projects")}
                  className="w-full py-3 flex items-center justify-between text-left hover:text-violet-700 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Inspect {plan.projects.length} tailored portfolio projects
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderSkillsAudit = () => {
    if (!analysis) return null;
    const { strengths, missingSkills } = analysis.plan;

    const getPriorityStyle = (priority: string) => {
      const normalized = priority.toLowerCase();
      if (normalized === "critical") {
        return { text: "text-red-700", label: "Critical Priority" };
      }
      if (normalized === "high") {
        return { text: "text-amber-700", label: "High Priority" };
      }
      return { text: "text-violet-700", label: "Recommended" };
    };

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
            Strengths & Missing Skills
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            How your current capabilities align with {analysis.profile.targetRole} roles, and the
            exact gaps to close over the next 30 days.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Strengths Column */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[#0B1221]">
                  Existing Strengths
                </h2>
              </div>
              <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                {strengths.length} Verified
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {strengths.map((item, idx) => (
                <div key={`${item.skill}-${idx}`} className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-base font-semibold text-[#0B1221]">
                      {item.skill}
                    </h3>
                    <span className="text-xs font-medium text-emerald-700 shrink-0">
                      Transferable Asset
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item.leverageNote}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Missing Skills Column */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-violet-700 shrink-0" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[#0B1221]">
                  Missing Skills to Build
                </h2>
              </div>
              <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                {missingSkills.length} Gaps
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {missingSkills.map((item, idx) => {
                const priorityMeta = getPriorityStyle(item.priority);
                return (
                  <div key={`${item.skill}-${idx}`} className="p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-base font-semibold text-[#0B1221]">
                        {item.skill}
                      </h3>
                      <span className={`text-xs font-semibold shrink-0 ${priorityMeta.text}`}>
                        {priorityMeta.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {item.reason}
                    </p>
                    <p className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-[#0B1221]">
                      <span className="font-semibold text-violet-700">30-Day Action: </span>
                      {item.howToAcquire}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderRoadmap = () => {
    if (!analysis) return null;
    const weeks = analysis.plan.roadmap;
    const visibleWeeks =
      selectedWeek === "all"
        ? weeks
        : weeks.filter((w) => w.weekNumber === selectedWeek);
    const progressPct =
      totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

    return (
      <div className="max-w-6xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
              30-Day Learning Roadmap
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              Four structured weekly sprints (~{analysis.plan.estimatedWeeklyHours} hours/week)
              built for {analysis.profile.targetRole}.
            </p>
          </div>

          {/* Progress summary */}
          <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-lg p-4 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0B1221]">
              <span>Completion Progress</span>
              <span className="font-mono tabular-nums text-violet-700">
                {doneMilestones}/{totalMilestones} ({progressPct}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-700 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Week Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter roadmap by week"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedWeek === "all"}
            onClick={() => setSelectedWeek("all")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedWeek === "all"
                ? "bg-white text-[#0B1221] shadow-xs"
                : "text-slate-600 hover:text-[#0B1221]"
            }`}
          >
            All 4 Weeks
          </button>
          {weeks.map((week) => (
            <button
              key={week.weekNumber}
              type="button"
              role="tab"
              aria-selected={selectedWeek === week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                selectedWeek === week.weekNumber
                  ? "bg-white text-[#0B1221] shadow-xs"
                  : "text-slate-600 hover:text-[#0B1221]"
              }`}
            >
              Week {week.weekNumber} · {week.dayRange}
            </button>
          ))}
        </div>

        {/* Weeks List */}
        <div className="space-y-6">
          {visibleWeeks.map((week) => {
            const weekDone = week.milestones.filter(
              (_m, idx) => completedMilestones[`w${week.weekNumber}-m${idx}`]
            ).length;

            return (
              <section
                key={week.weekNumber}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="px-6 py-5 bg-[#0B1221] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-medium text-violet-300 tabular-nums">
                      Week 0{week.weekNumber} · {week.dayRange}
                    </p>
                    <h2 className="mt-1 font-display text-lg sm:text-xl font-bold">
                      {week.theme}
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-medium text-slate-300 tabular-nums shrink-0">
                    {weekDone} / {week.milestones.length} Tasks Completed
                  </span>
                </div>

                <div className="p-6 border-b border-slate-200 bg-slate-50/70">
                  <p className="text-sm text-slate-700 leading-relaxed">{week.objective}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Focus Topics:{" "}
                    <span className="text-[#0B1221]">
                      {week.focusTopics.join(" · ")}
                    </span>
                  </p>
                </div>

                <div className="divide-y divide-slate-200">
                  {week.milestones.map((milestone, mIdx) => {
                    const key = `w${week.weekNumber}-m${mIdx}`;
                    const checked = Boolean(completedMilestones[key]);
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-4 p-5 sm:px-6 cursor-pointer transition-colors ${
                          checked ? "bg-slate-50/80" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleMilestone(key)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-violet-700 focus:ring-violet-600 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-mono text-xs font-semibold text-violet-700 tabular-nums shrink-0">
                              {milestone.dayLabel}
                            </span>
                            <span
                              className={`text-sm sm:text-base font-medium ${
                                checked
                                  ? "line-through text-slate-400"
                                  : "text-[#0B1221]"
                              }`}
                            >
                              {milestone.task}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                            Deliverable: {milestone.deliverable}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!analysis) return null;
    const { projects } = analysis.plan;

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
            Recommended Practical Projects
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Three portfolio builds designed to close your missing skill gaps and demonstrate
            job-ready competence for {analysis.profile.targetRole}.
          </p>
        </div>

        <div className="space-y-6">
          {projects.map((project, pIdx) => {
            const doneCount = project.deliverables.filter(
              (_d, dIdx) => completedDeliverables[`p${pIdx}-d${dIdx}`]
            ).length;
            const isCopied = copiedProjectIdx === pIdx;

            return (
              <article
                key={`${project.title}-${pIdx}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="p-6 sm:p-8 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-medium text-slate-500">
                    <span className="font-mono tabular-nums text-violet-700 font-semibold">
                      Project 0{pIdx + 1} · {project.difficulty} · {project.estimatedTime}
                    </span>
                    <span className="font-mono tabular-nums">
                      {doneCount} / {project.deliverables.length} Deliverables Complete
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-[#0B1221]">
                    {project.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                    {project.summary}
                  </p>

                  <p className="mt-4 text-xs sm:text-sm text-slate-500">
                    <span className="font-semibold text-[#0B1221]">Tech Stack: </span>
                    {project.techStack.join(" · ")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Deliverables Checklist */}
                  <div className="lg:col-span-7 p-6 sm:p-8">
                    <h3 className="text-sm font-semibold text-[#0B1221] mb-4">
                      Core Build Deliverables
                    </h3>
                    <div className="space-y-3">
                      {project.deliverables.map((deliverable, dIdx) => {
                        const key = `p${pIdx}-d${dIdx}`;
                        const checked = Boolean(completedDeliverables[key]);
                        return (
                          <label
                            key={key}
                            className="flex items-start gap-3 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggleDeliverable(key)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-violet-700 focus:ring-violet-600 cursor-pointer shrink-0"
                            />
                            <span
                              className={
                                checked ? "line-through text-slate-400" : "text-slate-700"
                              }
                            >
                              {deliverable}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resume Impact Box */}
                  <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0B1221]">
                        Resume Bullet Impact
                      </h3>
                      <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                        &ldquo;{project.resumeImpact}&rdquo;
                      </p>
                    </div>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => handleCopyResumeBullet(project.resumeImpact, pIdx)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0B1221] bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            <span>Copied Bullet</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy Resume Bullet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-[#0B1221] rounded-md cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0 truncate">
              <span className="text-slate-400 hidden sm:inline">Workspace</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-display font-semibold text-[#0B1221] truncate">
                {SECTION_LABELS[activeSection]}
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {analysis && activeSection !== "profile" ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onGeneratePlan(analysis.profile)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#0B1221] bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span>Regenerate Plan</span>
              </button>
            ) : (
              analysis && (
                <button
                  type="button"
                  onClick={() => onSelectSection("overview")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-violet-700 hover:bg-violet-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>View Current Plan</span>
                </button>
              )
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10">
          {error && (
            <div
              role="alert"
              className="max-w-4xl mb-8 p-5 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-semibold text-red-900">
                    Unable to complete career analysis
                  </h2>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onGeneratePlan(profile)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {isLoading ? (
            renderLoadingState()
          ) : activeSection === "profile" || !analysis ? (
            <StudentProfileForm
              initialProfile={profile}
              isSubmitting={isLoading}
              onSubmit={onGeneratePlan}
            />
          ) : activeSection === "overview" ? (
            renderOverview()
          ) : activeSection === "skills" ? (
            renderSkillsAudit()
          ) : activeSection === "roadmap" ? (
            renderRoadmap()
          ) : (
            renderProjects()
          )}
        </main>
      </div>
    </div>
  );
};
