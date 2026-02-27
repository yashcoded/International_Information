export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
}

export interface MemoryStepEntry {
  id: number;
  action: string;
  input: Record<string, unknown>;
  output: unknown;
  timestamp: number;
}

export class AgentMemory {
  private steps: MemoryStepEntry[] = [];
  private conversation: ConversationMessage[] = [];

  addStep(entry: Omit<MemoryStepEntry, 'timestamp'>) {
    this.steps.push({
      ...entry,
      timestamp: Date.now(),
    });
  }

  getSteps(): MemoryStepEntry[] {
    return [...this.steps];
  }

  addMessage(message: ConversationMessage) {
    this.conversation.push(message);
  }

  addMessages(messages: ConversationMessage[]) {
    messages.forEach((m) => this.addMessage(m));
  }

  getConversation(limit?: number): ConversationMessage[] {
    if (typeof limit === 'number') {
      return this.conversation.slice(-limit);
    }
    return [...this.conversation];
  }
}

