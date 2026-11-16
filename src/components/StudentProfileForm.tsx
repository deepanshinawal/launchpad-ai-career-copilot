import React, { useState } from "react";
import { Plus, X, ArrowRight, RotateCcw } from "lucide-react";
import type { ExperienceLevel, StudentProfile } from "../types/career";

interface StudentProfileFormProps {
  initialProfile: StudentProfile;
  isSubmitting: boolean;
  onSubmit: (profile: StudentProfile) => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Beginner (Coursework Only)",
  "Intermediate (Campus & Personal Projects)",
  "Advanced (Prior Internship)",
];

const SUGGESTED_ROLES = [
  "Full-Stack Software Engineer",
  "Machine Learning Engineer",
  "Data Analyst",
  "Product Designer (UX/UI)",
  "Product Manager",
  "Cloud & DevOps Engineer",
];

const SUGGESTED_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "SQL",
  "Git",
  "Java",
  "Data Structures",
  "Figma",
  "Docker",
  "Node.js",
  "Statistics",
];

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  initialProfile,
  isSubmitting,
  onSubmit,
}) => {
  const [name, setName] = useState(initialProfile.name);
  const [education, setEducation] = useState(initialProfile.education);
  const [currentSkills, setCurrentSkills] = useState<string[]>(initialProfile.currentSkills);
  const [skillInput, setSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialProfile.experienceLevel
  );
  const [targetRole, setTargetRole] = useState(initialProfile.targetRole);
  const [validationError, setValidationError] = useState<string | null>(null);

  const addSkill = (rawSkill: string) => {
    const parts = rawSkill
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setCurrentSkills((prev) => {
      const existingLower = new Set(prev.map((s) => s.toLowerCase()));
      const next = [...prev];
      for (const item of parts) {
        if (!existingLower.has(item.toLowerCase())) {
          existingLower.add(item.toLowerCase());
          next.push(item);
        }
      }
      return next;
    });
    setSkillInput("");
    setValidationError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    setCurrentSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleLoadSample = () => {
    setName("Aarav Mehta");
    setEducation("B.S. in Computer Science, Junior (Class of 2027)");
    setCurrentSkills(["Python", "JavaScript", "HTML/CSS", "SQL", "Git", "Data Structures"]);
    setExperienceLevel("Intermediate (Campus & Personal Projects)");
    setTargetRole("Full-Stack Software Engineer");
    setSkillInput("");
    setValidationError(null);
  };

  const handleReset = () => {
    setName("");
    setEducation("");
    setCurrentSkills([]);
    setSkillInput("");
    setExperienceLevel("Beginner (Coursework Only)");
    setTargetRole("");
    setValidationError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Flush any uncommitted text in skillInput before validating
    let finalSkills = [...currentSkills];
    if (skillInput.trim()) {
      const extra = skillInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const existingLower = new Set(finalSkills.map((s) => s.toLowerCase()));
      for (const item of extra) {
        if (!existingLower.has(item.toLowerCase())) {
          existingLower.add(item.toLowerCase());
          finalSkills.push(item);
        }
      }
      setCurrentSkills(finalSkills);
      setSkillInput("");
    }

    if (!name.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }
    if (!education.trim()) {
      setValidationError("Please enter your degree, major, or graduation year.");
      return;
    }
    if (finalSkills.length === 0) {
      setValidationError("Please add at least one current skill or coursework area.");
      return;
    }
    if (!targetRole.trim()) {
      setValidationError("Please specify your target career role.");
      return;
    }

    setValidationError(null);
    onSubmit({
      name: name.trim(),
      education: education.trim(),
      currentSkills: finalSkills,
      experienceLevel,
      targetRole: targetRole.trim(),
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221]">
            Student Career Profile
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Tell LaunchPad AI about your academic background and target role to generate your
            personalized gap analysis, 30-day roadmap, and project briefs.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            Fill Sample Profile
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8"
      >
        {validationError && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 font-medium"
          >
            {validationError}
          </div>
        )}

        {/* Section 1: Name & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="student-name"
              className="block text-sm font-semibold text-[#0B1221] mb-2"
            >
              Full Name
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Patel"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="student-education"
              className="block text-sm font-semibold text-[#0B1221] mb-2"
            >
              Education & Graduation Year
            </label>
            <input
              id="student-education"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.S. Computer Science, Junior (2027)"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Section 2: Target Career Role */}
        <div className="pt-6 border-t border-slate-200">
          <label
            htmlFor="target-role"
            className="block text-sm font-semibold text-[#0B1221] mb-2"
          >
            Target Career Role
          </label>
          <input
            id="target-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer, Data Analyst, Product Designer"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 disabled:bg-slate-50"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Common roles:</span>
            {SUGGESTED_ROLES.map((role) => {
              const active = targetRole.toLowerCase() === role.toLowerCase();
              return (
                <button
                  key={role}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setTargetRole(role)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-[#0B1221] text-white border-[#0B1221]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Experience Level */}
        <div className="pt-6 border-t border-slate-200">
          <span className="block text-sm font-semibold text-[#0B1221] mb-3">
            Current Experience Level
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {EXPERIENCE_LEVELS.map((level) => {
              const selected = experienceLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setExperienceLevel(level)}
                  className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                    selected
                      ? "bg-violet-50 border-violet-600 text-[#0B1221]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {level.split(" (")[0]}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selected ? "border-violet-600 bg-violet-600" : "border-slate-300"
                      }`}
                    >
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {level.match(/\(([^)]+)\)/)?.[1]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Current Skills */}
        <div className="pt-6 border-t border-slate-200">
          <label
            htmlFor="skills-input"
            className="block text-sm font-semibold text-[#0B1221] mb-2"
          >
            Current Skills & Coursework
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Add programming languages, tools, frameworks, or domain subjects (press Enter or click Add).
          </p>

          <div className="flex gap-2">
            <input
              id="skills-input"
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="e.g. Python, React, SQL, Figma"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 disabled:bg-slate-50"
            />
            <button
              type="button"
              disabled={isSubmitting || !skillInput.trim()}
              onClick={() => addSkill(skillInput)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#0B1221] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Skill</span>
            </button>
          </div>

          {currentSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {currentSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0B1221] bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-md transition-colors cursor-pointer"
                >
                  <span>{skill}</span>
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Quick add:</span>
            {SUGGESTED_SKILLS.filter(
              (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
            )
              .slice(0, 8)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => addSkill(skill)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500">
            Powered by Gemini AI. Analysis typically completes in 5–10 seconds.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-violet-700 hover:bg-violet-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <span>{isSubmitting ? "Analyzing Profile..." : "Generate Career Plan"}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
