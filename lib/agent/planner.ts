import OpenAI from 'openai';

export type PlannerAction =
  | 'check_visa'
  | 'generate_itinerary'
  | 'estimate_budget'
  | 'travel_tips'
  | 'get_weather'
  | string;

export interface PlannerStep {
  id: number;
  action: PlannerAction;
  input: Record<string, unknown>;
}

export interface Plan {
  goal: string;
  steps: PlannerStep[];
}

export interface PlannerContext {
  travelContext?: Record<string, unknown>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const PLANNER_SYSTEM_PROMPT = `
You are a travel planning agent. Break user goals into structured executable steps.

You MUST respond with pure JSON only, no markdown, no comments.

JSON schema:
{
  "goal": string,
  "steps": [
    { "id": number, "action": string, "input": object }
  ]
}

Guidance:
- First, understand the user's high-level goal (e.g. "plan a 10 day trip to Italy in spring").
- Then decompose it into concrete actions such as:
  - "check_visa"            (visa and transit rules)
  - "generate_itinerary"    (day-by-day or high level plan)
  - "estimate_budget"       (rough cost ranges)
  - "travel_tips"           (practical tips and cautions)
  - "get_weather"           (7-day weather forecast)
- Always start ids at 1 and increment by 1.
- The "input" object should contain any structured fields you know
  (e.g. passport country, origin, destination, duration in days, travel style, interests).
`.trim();

export async function createPlan(
  userGoal: string,
  context: PlannerContext = {},
): Promise<Plan> {
  const userPayload: Record<string, unknown> = {
    userGoal,
  };

  if (context.travelContext) {
    userPayload.travelContext = context.travelContext;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify(userPayload),
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0].message?.content || '';

  try {
    const parsed = JSON.parse(raw) as Plan;

    if (!parsed.goal || !Array.isArray(parsed.steps)) {
      throw new Error('Planner response missing goal or steps');
    }

    const normalizedSteps: PlannerStep[] = parsed.steps.map((step, index) => ({
      id: typeof step.id === 'number' ? step.id : index + 1,
      action: step.action || 'check_visa',
      input: (step.input ?? {}) as Record<string, unknown>,
    }));

    return {
      goal: parsed.goal || userGoal,
      steps: normalizedSteps,
    };
  } catch (error) {
    // Fallback: simple deterministic plan
    return {
      goal: userGoal,
      steps: [
        {
          id: 1,
          action: 'check_visa',
          input: context.travelContext ?? {},
        },
        {
          id: 2,
          action: 'generate_itinerary',
          input: context.travelContext ?? {},
        },
        {
          id: 3,
          action: 'estimate_budget',
          input: context.travelContext ?? {},
        },
        {
          id: 4,
          action: 'travel_tips',
          input: context.travelContext ?? {},
        },
      ],
    };
  }
}

