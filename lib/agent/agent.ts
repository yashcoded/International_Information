import OpenAI from 'openai';
import { AgentMemory, type ConversationMessage } from './memory';
import { createPlan, type Plan } from './planner';
import { executePlan, type StepExecutionResult } from './executor';
import {
  openAiToolDefinitions,
  type ToolContext,
  type TravelContext,
} from './tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export interface AgentRunOptions {
  travelContext?: TravelContext;
  priorMessages?: ConversationMessage[];
}

export interface AgentRunResult {
  finalText: string;
  plan: Plan;
  steps: StepExecutionResult[];
}

const AGENT_SYSTEM_PROMPT = `
You are an autonomous AI Travel Agent.
You plan before acting.
You call tools when needed.
You think step-by-step internally but return only structured, helpful results to the user.

Rules:
- Do NOT expose your chain-of-thought.
- Focus on clear, practical travel advice.
- Do NOT include a section titled "Suggested follow-up questions" or explicit lists of next questions.
- The UI will surface follow-up questions separately; your reply should focus only on the main answer.
`.trim();

export async function runAgent(
  userInput: string,
  options: AgentRunOptions = {},
): Promise<AgentRunResult> {
  const memory = new AgentMemory();

  if (options.priorMessages?.length) {
    memory.addMessages(options.priorMessages);
  }

  const plan = await createPlan(userInput, {
    travelContext: options.travelContext as Record<string, unknown> | undefined,
  });

  const toolContext: ToolContext = {
    travelContext: options.travelContext,
  };

  const steps = await executePlan(plan, memory, { toolContext });

  const primary =
    steps.find((s) => s.action === 'check_visa') || steps[steps.length - 1];

  const finalText =
    (await synthesizeFinalAnswer(userInput, plan, steps, memory, primary)) ||
    primary?.summary ||
    'No response generated.';

  return {
    finalText,
    plan,
    steps,
  };
}

async function synthesizeFinalAnswer(
  userInput: string,
  plan: Plan,
  steps: StepExecutionResult[],
  memory: AgentMemory,
  primary: StepExecutionResult | undefined,
): Promise<string | null> {
  const summaryPayload = {
    goal: plan.goal,
    userInput,
    steps: steps.map((s) => ({
      id: s.id,
      action: s.action,
      summary: s.summary,
    })),
  };

  const messages: ConversationMessage[] = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    {
      role: 'user',
      content:
        'Summarize the following travel planning steps into a single, coherent answer. Focus on being practical and clear. Do NOT repeat internal reasoning.\n\n' +
        JSON.stringify(summaryPayload, null, 2),
    },
  ];

  memory.addMessages(messages);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: memory.getConversation().map((m) => ({
      role: m.role,
      content: m.content,
      name: m.name,
    })) as any,
    temperature: 0.6,
    max_tokens: 1200,
  });

  const choice = completion.choices[0];
  const message = choice.message;
  return message.content?.trim() || null;
}

