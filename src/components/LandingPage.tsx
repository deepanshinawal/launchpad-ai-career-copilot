import React, { useState } from "react";
import { ArrowRight, Compass, Layers, CheckSquare, FolderGit2 } from "lucide-react";

interface LandingPageProps {
  onStartNow: () => void;
  hasExistingPlan: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartNow,
  hasExistingPlan,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: Brand Wordmark — 4 Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-[#0B1221] whitespace-nowrap shrink-0"
          >
            LaunchPad AI
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
          >
            <a
              href="#overview"
              className="hover:text-[#0B1221] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <a
              href="#methodology"
              className="hover:text-[#0B1221] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Methodology
            </a>
            <a
              href="#roadmap"
              className="hover:text-[#0B1221] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Roadmap
            </a>
            <a
              href="#projects"
              className="hover:text-[#0B1221] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Projects
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onStartNow}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-700 hover:bg-violet-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {hasExistingPlan ? "Open Workspace" : "Start Now"}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Split Section */}
        <section id="overview" className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-sm font-medium text-violet-700 mb-4">
                  Career Planning Copilot for College Students
                </p>
                <h1
                  className="font-display font-bold tracking-tight text-[#0B1221] leading-[1.1] [text-wrap:balance]"
                  style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)" }}
                >
                  Turn your college coursework into a 30-day career launch plan.
                </h1>
                <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  LaunchPad AI analyzes your degree, current technical skills, and experience
                  level against your target role—identifying real skill gaps, structuring a
                  four-week study schedule, and scoping three portfolio projects.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onStartNow}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-violet-700 hover:bg-violet-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Start Now</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <a
                    href="#methodology"
                    className="inline-flex items-center px-5 py-3.5 text-sm font-semibold text-[#0B1221] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    See How It Works
                  </a>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                  <span>Skill Gap Audit</span>
                  <span aria-hidden="true">·</span>
                  <span>4-Week Structured Roadmap</span>
                  <span aria-hidden="true">·</span>
                  <span>3 Role-Aligned Capstone Projects</span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-[#0B1221]">
                  {!imageError ? (
                    <img
                      src="/src/assets/images/hero_career_workspace_1794760502521.jpg"
                      alt="University students collaborating on laptops in a bright engineering and design studio with navy acoustic panels"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0B1221] via-[#131F38] to-violet-950 flex flex-col items-center justify-center p-8 text-center">
                      <Compass className="w-12 h-12 text-violet-400 mb-4" aria-hidden="true" />
                      <p className="font-display text-lg font-semibold text-white">
                        LaunchPad AI Workspace
                      </p>
                      <p className="text-sm text-slate-300 mt-2 max-w-xs">
                        Structured career diagnostics, 30-day sprint planning, and portfolio engineering.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-width 4-column mechanism strip below Hero Split */}
            <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-xl bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-6">
                <p className="font-mono text-xs font-medium text-violet-700 tabular-nums">01</p>
                <h2 className="mt-2 font-display text-base font-semibold text-[#0B1221]">
                  Profile Calibration
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Capture your major, technical skills, and experience tier in under two minutes.
                </p>
              </div>
              <div className="p-6">
                <p className="font-mono text-xs font-medium text-violet-700 tabular-nums">02</p>
                <h2 className="mt-2 font-display text-base font-semibold text-[#0B1221]">
                  Strengths & Gaps
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  See which skills already transfer and which missing competencies block interviews.
                </p>
              </div>
              <div className="p-6">
                <p className="font-mono text-xs font-medium text-violet-700 tabular-nums">03</p>
                <h2 className="mt-2 font-display text-base font-semibold text-[#0B1221]">
                  30-Day Roadmap
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Follow four focused weekly sprints designed to fit around college classes.
                </p>
              </div>
              <div className="p-6">
                <p className="font-mono text-xs font-medium text-violet-700 tabular-nums">04</p>
                <h2 className="mt-2 font-display text-base font-semibold text-[#0B1221]">
                  3 Practical Projects
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  Build role-specific portfolio deliverables with ready-to-adapt resume bullets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology & Asymmetric Feature Bento */}
        <section id="methodology" className="py-16 lg:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-violet-700">How LaunchPad AI Works</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1221] [text-wrap:balance]">
                Built around the exact transition from classroom theory to hiring readiness.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Deep Navy Anchor Card (col-span-7) */}
              <div
                id="roadmap"
                className="lg:col-span-7 rounded-xl bg-[#0B1221] text-white p-8 flex flex-col justify-between border border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-3 text-violet-300">
                    <CheckSquare className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">30-Day Four-Week Execution Plan</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                    A structured weekly cadence instead of scattered tutorials.
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                    Generic career advice tells students to "learn more frameworks." LaunchPad AI
                    sequences your month into four progressive weeks—closing critical gaps first,
                    applying them in labs, and shipping verifiable work by Day 30.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                  <div className="p-4 rounded-lg bg-[#121C33] border border-slate-800">
                    <p className="font-mono text-xs text-violet-300 tabular-nums">Week 01 · Days 1–7</p>
                    <p className="mt-1.5 font-display text-sm font-semibold text-white">
                      Core Gap Closure & Tooling
                    </p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Bridge foundational prerequisites and configure your production workflow.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121C33] border border-slate-800">
                    <p className="font-mono text-xs text-violet-300 tabular-nums">Week 02 · Days 8–14</p>
                    <p className="mt-1.5 font-display text-sm font-semibold text-white">
                      Applied Architecture & Foundation Build
                    </p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Complete Project 1 while practicing role-specific patterns and testing.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121C33] border border-slate-800">
                    <p className="font-mono text-xs text-violet-300 tabular-nums">Week 03 · Days 15–21</p>
                    <p className="mt-1.5 font-display text-sm font-semibold text-white">
                      Integration & Intermediate Build
                    </p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Connect APIs, data models, or user research pipelines in Project 2.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121C33] border border-slate-800">
                    <p className="font-mono text-xs text-violet-300 tabular-nums">Week 04 · Days 22–30</p>
                    <p className="mt-1.5 font-display text-sm font-semibold text-white">
                      Capstone Delivery & Resume Packaging
                    </p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Ship Project 3, document architecture decisions, and refine application materials.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column Stacked Crisp White Panels (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="flex-1 rounded-xl bg-white border border-slate-200 p-8">
                  <div className="flex items-center gap-3 text-violet-700">
                    <Layers className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Diagnostic Skill Audit</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#0B1221]">
                    Clear separation between strengths and hiring blockers.
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    Every assessment maps your current skills directly to target role benchmarks—highlighting
                    how to pitch your strengths alongside a prioritized list of Critical, High, and
                    Recommended skills to learn next.
                  </p>
                </div>

                <div
                  id="projects"
                  className="flex-1 rounded-xl bg-white border border-slate-200 p-8"
                >
                  <div className="flex items-center gap-3 text-violet-700">
                    <FolderGit2 className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Portfolio Project Lab</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#0B1221]">
                    Three practical projects built for hiring manager scrutiny.
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    Receive three scoped project briefs—Foundation, Intermediate, and Capstone—complete
                    with tech stack specifications, verifiable deliverables, and an impact-oriented
                    resume bullet for each build.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Conversion Band */}
        <section className="bg-[#0B1221] text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]">
                Ready to map out your next 30 days?
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                Enter your degree, current skills, and target career role to generate a customized
                analysis, four-week roadmap, and three project briefs.
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={onStartNow}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Start Now</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-500">
          <span className="font-display font-semibold text-[#0B1221]">LaunchPad AI</span>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#overview" className="hover:text-slate-900 transition-colors">
              Overview
            </a>
            <a href="#methodology" className="hover:text-slate-900 transition-colors">
              Methodology
            </a>
            <a href="#roadmap" className="hover:text-slate-900 transition-colors">
              Roadmap
            </a>
            <button
              type="button"
              onClick={onStartNow}
              className="text-violet-700 font-medium hover:text-violet-900 transition-colors cursor-pointer"
            >
              Launch Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
