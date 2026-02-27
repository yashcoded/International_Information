import type { Plan, PlannerStep } from './planner';
import { AgentMemory } from './memory';
import { callTool, type ToolContext, type ToolResult } from './tools';

export interface StepExecutionResult extends ToolResult {
  id: number;
  action: string;
  input: Record<string, unknown>;
}

export interface ExecuteOptions {
  toolContext?: ToolContext;
}

export async function executePlan(
  plan: Plan,
  memory: AgentMemory,
  options: ExecuteOptions = {},
): Promise<StepExecutionResult[]> {
  const results: StepExecutionResult[] = [];
  const toolContext = options.toolContext ?? {};

  for (const step of plan.steps) {
    const result = await executeStep(step, memory, toolContext);
    const stepResult: StepExecutionResult = {
      id: step.id,
      action: step.action,
      input: step.input,
      summary: result.summary,
      data: result.data,
    };

    results.push(stepResult);
    memory.addStep({
      id: stepResult.id,
      action: stepResult.action,
      input: stepResult.input,
      output: stepResult.summary,
    });
  }

  return results;
}

async function executeStep(
  step: PlannerStep,
  memory: AgentMemory,
  toolContext: ToolContext,
): Promise<ToolResult> {
  return callTool(step.action, step.input, toolContext, memory);
}

