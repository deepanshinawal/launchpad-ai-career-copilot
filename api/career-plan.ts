import type { IncomingMessage, ServerResponse } from "node:http";
import { GoogleGenAI, Type } from "@google/genai";

interface StudentProfileInput {
  name: string;
  education: string;
  currentSkills: string[];
  experienceLevel: string;
  targetRole: string;
}

interface RequestWithParsedBody extends IncomingMessage {
  body?: unknown;
}

const MAX_BODY_BYTES = 1024 * 1024;

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req: RequestWithParsedBody): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        throw new SyntaxError("Invalid JSON request body.");
      }
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer);
    totalBytes += buf.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new RangeError("Request body exceeds 1MB limit.");
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new SyntaxError("Invalid JSON request body.");
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY in your environment variables."
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
      description:
        "3 to 5 specific existing strengths derived from the student's education, skills, and experience.",
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
            description:
              "Day span such as 'Days 1–7', 'Days 8–14', 'Days 15–21', or 'Days 22–30'.",
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
            description:
              "4 to 5 concrete, actionable daily/multi-day tasks for the student to check off.",
            items: {
              type: Type.OBJECT,
              properties: {
                dayLabel: {
                  type: Type.STRING,
                  description:
                    "Specific day or day span inside the week, e.g., 'Days 1–2' or 'Day 5'.",
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
      description:
        "Exactly 3 practical, portfolio-worthy projects tailored to the target role and experience level.",
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
            description:
              "One strong, realistic resume bullet point the student can adapt after shipping this project.",
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

export default async function handler(
  req: RequestWithParsedBody,
  res: ServerResponse
): Promise<void> {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    sendJson(res, 405, { error: "Method not allowed. Use POST /api/career-plan." });
    return;
  }

  try {
    const parsedBody = await parseJsonBody(req);
    const body = (parsedBody && typeof parsedBody === "object"
      ? parsedBody
      : {}) as Partial<StudentProfileInput>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const education = typeof body.education === "string" ? body.education.trim() : "";
    const experienceLevel =
      typeof body.experienceLevel === "string" ? body.experienceLevel.trim() : "";
    const targetRole = typeof body.targetRole === "string" ? body.targetRole.trim() : "";
    const currentSkills = Array.isArray(body.currentSkills)
      ? body.currentSkills.map((s) => String(s).trim()).filter(Boolean)
      : [];

    if (!name || !education || !experienceLevel || !targetRole || currentSkills.length === 0) {
      sendJson(res, 400, {
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

    let parsedPlan: unknown;
    try {
      parsedPlan = JSON.parse(rawText);
    } catch {
      throw new Error("Gemini returned an invalid JSON structure. Please try again.");
    }

    sendJson(res, 200, {
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

    if (error instanceof SyntaxError) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (error instanceof RangeError) {
      sendJson(res, 413, { error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Failed to generate career plan.";

    if (
      message.includes("PERMISSION_DENIED") ||
      message.includes("API_KEY_INVALID") ||
      message.includes("403")
    ) {
      sendJson(res, 401, {
        error:
          "API authentication failed. Please check that GEMINI_API_KEY is valid in your environment variables.",
      });
      return;
    }

    if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
      sendJson(res, 429, {
        error: "AI quota limit reached temporarily. Please wait a moment and try again.",
      });
      return;
    }

    sendJson(res, 500, {
      error: message,
    });
  }
}
