import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

interface StudentProfileInput {
  name: string;
  education: string;
  currentSkills: string[];
  experienceLevel: string;
  targetRole: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please verify the key in the Settings > Secrets panel."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function generateWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("RESOURCE_EXHAUSTED");
      if (!isRetryable || attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

const careerPlanSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description:
        "A concise, encouraging, and concrete 3-4 sentence career readiness assessment tailored specifically to the student's background, current skills, experience level, and target role.",
    },
    readinessHeadline: {
      type: Type.STRING,
      description:
        "A short 5-8 word positioning statement describing the student's current standing toward the target role (e.g., 'Strong algorithmic foundation, ready for production stack').",
    },
    marketPositioning: {
      type: Type.STRING,
      description:
        "2-3 sentences explaining how the student should position their education and existing skills on resumes and interviews for the target role.",
    },
    estimatedWeeklyHours: {
      type: Type.INTEGER,
      description:
        "Recommended weekly study and building hours (between 8 and 20) to complete the 30-day plan realistically as a college student.",
    },
    strengths: {
      type: Type.ARRAY,
      description: "3 to 5 specific existing strengths derived from the student's education, skills, and experience.",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: {
            type: Type.STRING,
            description: "The strength or skill area.",
          },
          leverageNote: {
            type: Type.STRING,
            description: "How this strength directly accelerates success in the target career role.",
          },
        },
        required: ["skill", "leverageNote"],
      },
    },
    missingSkills: {
      type: Type.ARRAY,
      description: "4 to 6 essential skills, tools, or concepts missing for the target career role.",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: {
            type: Type.STRING,
            description: "Name of the missing skill, framework, or competency.",
          },
          priority: {
            type: Type.STRING,
            description: "Must be one of: Critical, High, Recommended.",
          },
          reason: {
            type: Type.STRING,
            description: "Why employers require this skill for the target role and what gap it closes.",
          },
          howToAcquire: {
            type: Type.STRING,
            description: "Concrete action or resource approach to build proficiency within 30 days.",
          },
        },
        required: ["skill", "priority", "reason", "howToAcquire"],
      },
    },
    roadmap: {
      type: Type.ARRAY,
      description: "Exactly 4 weeks representing a cohesive 30-day learning and building roadmap.",
      items: {
        type: Type.OBJECT,
        properties: {
          weekNumber: {
            type: Type.INTEGER,
            description: "Week number: 1, 2, 3, or 4.",
          },
          dayRange: {
            type: Type.STRING,
            description: "Day span such as 'Days 1–7', 'Days 8–14', 'Days 15–21', or 'Days 22–30'.",
          },
          theme: {
            type: Type.STRING,
            description: "Short focused title for this week.",
          },
          objective: {
            type: Type.STRING,
            description: "1-2 sentences stating the concrete learning and execution outcome of the week.",
          },
          focusTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 to 4 key concepts or tools covered this week.",
          },
          milestones: {
            type: Type.ARRAY,
            description: "4 to 5 concrete, actionable daily/multi-day tasks for the student to check off.",
            items: {
              type: Type.OBJECT,
              properties: {
                dayLabel: {
                  type: Type.STRING,
                  description: "Specific day or day span inside the week, e.g., 'Days 1–2' or 'Day 5'.",
                },
                task: {
                  type: Type.STRING,
                  description: "Clear, actionable study or hands-on implementation task.",
                },
                deliverable: {
                  type: Type.STRING,
                  description: "Tangible output produced by completing the task.",
                },
              },
              required: ["dayLabel", "task", "deliverable"],
            },
          },
        },
        required: ["weekNumber", "dayRange", "theme", "objective", "focusTopics", "milestones"],
      },
    },
    projects: {
      type: Type.ARRAY,
      description: "Exactly 3 practical, portfolio-worthy projects tailored to the target role and experience level.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Compelling, realistic project title.",
          },
          difficulty: {
            type: Type.STRING,
            description: "One of: Foundation, Intermediate, Capstone.",
          },
          estimatedTime: {
            type: Type.STRING,
            description: "Realistic timeframe within the 30-day window, e.g., '5–7 days'.",
          },
          summary: {
            type: Type.STRING,
            description: "2-3 sentences describing what the project does and why hiring managers care.",
          },
          techStack: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 to 6 specific technologies, libraries, or tools used.",
          },
          deliverables: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 to 4 concrete technical features or artifacts to build.",
          },
          resumeImpact: {
            type: Type.STRING,
            description: "One strong, realistic resume bullet point the student can adapt after shipping this project.",
          },
        },
        required: [
          "title",
          "difficulty",
          "estimatedTime",
          "summary",
          "techStack",
          "deliverables",
          "resumeImpact",
        ],
      },
    },
  },
  required: [
    "executiveSummary",
    "readinessHeadline",
    "marketPositioning",
    "estimatedWeeklyHours",
    "strengths",
    "missingSkills",
    "roadmap",
    "projects",
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.post("/api/career-plan", async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<StudentProfileInput>;
      const name = (body.name ?? "").trim();
      const education = (body.education ?? "").trim();
      const experienceLevel = (body.experienceLevel ?? "").trim();
      const targetRole = (body.targetRole ?? "").trim();
      const currentSkills = Array.isArray(body.currentSkills)
        ? body.currentSkills.map((s) => String(s).trim()).filter(Boolean)
        : [];

      if (!name || !education || !experienceLevel || !targetRole || currentSkills.length === 0) {
        res.status(400).json({
          error:
            "Please complete all profile fields (name, education, at least one current skill, experience level, and target career role).",
        });
        return;
      }

      const ai = getGeminiClient();

      const prompt = `Analyze the following college student profile and build a practical, realistic, high-impact career acceleration plan.

Student Profile:
- Name: ${name}
- Education: ${education}
- Current Skills: ${currentSkills.join(", ")}
- Experience Level: ${experienceLevel}
- Target Career Role: ${targetRole}

Requirements:
1. Evaluate their strengths honestly based on the exact skills and education provided, showing how each transfers to ${targetRole}.
2. Identify 4 to 6 critical missing skills or competency gaps required for entry-level or internship roles as a ${targetRole}.
3. Build a structured 30-day learning roadmap divided into exactly 4 weeks (Week 1: Days 1–7, Week 2: Days 8–14, Week 3: Days 15–21, Week 4: Days 22–30). Make tasks concrete, specific to ${targetRole}, and achievable alongside college coursework.
4. Recommend exactly 3 practical portfolio projects ordered from Foundation to Capstone that directly close the identified skill gaps and align with ${targetRole}. Avoid generic to-do apps or toy tutorials; propose realistic, demonstrable projects with clear deliverables and a resume bullet point.`;

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: prompt,
          config: {
            systemInstruction:
              "You are a senior technical career strategist and university engineering mentor. Provide specific, industry-accurate, actionable career guidance tailored to college students entering competitive job and internship markets. Avoid vague fluff, buzzwords, or generic advice. Always follow the provided JSON schema strictly.",
            responseMimeType: "application/json",
            responseSchema: careerPlanSchema,
          },
        })
      );

      const rawText = response.text?.trim();
      if (!rawText) {
        throw new Error("Gemini returned an empty response. Please try generating your plan again.");
      }

      const parsedPlan = JSON.parse(rawText);
      res.json({
        profile: {
          name,
          education,
          currentSkills,
          experienceLevel,
          targetRole,
        },
        plan: parsedPlan,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Career plan generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate career plan.";

      if (message.includes("PERMISSION_DENIED") || message.includes("API_KEY_INVALID") || message.includes("403")) {
        res.status(401).json({
          error:
            "API authentication failed. Please check that GEMINI_API_KEY is valid in Settings > Secrets.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error:
            "AI quota limit reached temporarily. Please wait a moment and try again.",
        });
        return;
      }

      res.status(500).json({
        error: message,
      });
    }
  });

  if (!isProduction) {
    let viteMiddleware: RequestHandler | null = null;
    const viteReady = import("vite")
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        })
      )
      .then((vite) => {
        viteMiddleware = vite.middlewares;
        return vite;
      })
      .catch((err) => {
        console.error("Failed to initialize Vite dev middleware:", err);
        throw err;
      });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (viteMiddleware) {
        viteMiddleware(req, res, next);
        return;
      }
      viteReady
        .then(() => {
          if (viteMiddleware) {
            viteMiddleware(req, res, next);
          } else {
            next(new Error("Vite middleware unavailable"));
          }
        })
        .catch(next);
    });
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LaunchPad AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
