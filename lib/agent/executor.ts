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
  const MAX_RETRIES = 1;
  let attempts = 0;
  
  while (attempts <= MAX_RETRIES) {
    try {
      attempts++;
      const result = await callTool(step.action, step.input, toolContext, memory);
      
      // If the tool returned a structured external API error, retry
      if ((result.data as Record<string, unknown> | undefined)?.errorType === 'external_api') {
         throw new Error(result.summary);
      }
      
      return result;
    } catch (error) {
      if (attempts > MAX_RETRIES) {
        return {
          summary: `Failed to execute action "${step.action}" after ${attempts} attempts. Error: ${error}`,
          data: { error: String(error) }
        };
      }
      // Wait a short delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { summary: 'Unexpected execution failure.' };
}

