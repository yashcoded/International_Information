import type { NextApiRequest, NextApiResponse } from 'next';
import { runAgent } from '../../lib/agent/agent';
import type { TravelContext } from '../../lib/agent/tools';
import type { ConversationMessage } from '../../lib/agent/memory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  // Fast path for e2e tests to avoid slow OpenAI calls
  if (process.env.NEXT_PUBLIC_TEST_MODE === '1') {
    const { conversationId } = req.body || {};
    const quickId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return res.status(200).json({
      visaInfo: 'Test mode: stubbed visa info response for fast E2E.\n\n- Transit visa not required for short stays.\n- Always verify with official sources.',
      conversationId: quickId,
      suggestions: [
        'Do I need any additional documents?',
        'What are the transit area rules?',
        'How long can I stay without a visa?'
      ]
    });
  }

  const { 
    passportFrom, 
    travelFrom, 
    travelTo, 
    transitCountry, 
    layoverDuration,
    willLeaveAirport,
    secondTransitCountry,
    secondLayoverDuration,
    secondWillLeaveAirport,
    followUpQuestion,
    conversationId,
    conversationHistory = []
  } = req.body;

  // Generate a conversation ID if not provided
  const currentConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Initial query validation (keep existing behavior)
    if (!followUpQuestion) {
      if (!passportFrom || !travelFrom || !travelTo || !transitCountry || !layoverDuration || !willLeaveAirport) {
        res.status(400).json({ error: 'All fields (passportFrom, travelFrom, travelTo, transitCountry, layoverDuration, willLeaveAirport) are required.' });
        return;
      }
    }

    const travelContext: TravelContext = {
      passportFrom,
      travelFrom,
      travelTo,
      transitCountry,
      layoverDuration,
      willLeaveAirport,
      secondTransitCountry,
      secondLayoverDuration,
      secondWillLeaveAirport,
      followUpQuestion,
      conversationId: currentConversationId,
      conversationHistory: (conversationHistory || []).filter(
        (msg: any) => msg && (msg.role === 'user' || msg.role === 'assistant'),
      ) as { role: 'user' | 'assistant'; content: string }[],
    };

    const userGoal = followUpQuestion
      ? followUpQuestion
      : `Provide detailed visa and transit information and practical travel guidance for a traveler with a ${passportFrom} passport going from ${travelFrom} to ${travelTo} via ${transitCountry}${secondTransitCountry ? ' and ' + secondTransitCountry : ''}.`;

    const agentResult = await runAgent(userGoal, {
      travelContext,
      priorMessages: (conversationHistory || []) as ConversationMessage[],
    });

    const rawResponse = agentResult.finalText || 'No visa information available';

    const suggestions = extractSuggestions(rawResponse);

    const cleanResponse = rawResponse.replace(/\n\nSuggested follow-up questions:[\s\S]*$/, '').trim();

    res.status(200).json({ 
      visaInfo: cleanResponse,
      conversationId: currentConversationId,
      suggestions: suggestions,
      plan: agentResult.plan,
      stepResults: agentResult.steps,
    });
  } catch (error) {
    console.error('Error fetching visa information:', error);
    res.status(500).json({ error: 'Error fetching visa information' });
  }
}

function extractSuggestions(response: string): string[] {
  const suggestions: string[] = [];
  
  // Look for the specific "Suggested follow-up questions:" section
  const followUpMatch = response.match(/Suggested follow-up questions:\s*([\s\S]*?)(?:\n\n|$)/i);
  
  if (followUpMatch) {
    const followUpSection = followUpMatch[1];
    // Extract bullet points starting with "- "
    const bulletMatches = followUpSection.match(/^-\s*(.+)$/gm);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const question = match.replace(/^-\s*/, '').trim();
        if (question && question.length > 10) {
          suggestions.push(question);
        }
      });
    }
  }
  
  // Fallback: Look for other common patterns
  if (suggestions.length === 0) {
    const suggestionPatterns = [
      /(?:suggested|follow-up|you might also want to know|additional questions):\s*(.+?)(?:\n|$)/gi,
      /(?:ask about|consider asking|you may want to know):\s*(.+?)(?:\n|$)/gi,
      /(?:questions to consider|things to ask):\s*(.+?)(?:\n|$)/gi
    ];
    
    suggestionPatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const suggestion = match.replace(/^(?:suggested|follow-up|you might also want to know|additional questions|ask about|consider asking|you may want to know|questions to consider|things to ask):\s*/i, '').trim();
          if (suggestion && suggestion.length > 10) {
            suggestions.push(suggestion);
          }
        });
      }
    });
  }
  
  // If still no suggestions found, provide some default ones
  if (suggestions.length === 0) {
    suggestions.push(
      "What documents do I need to prepare?",
      "How long does the visa process take?",
      "Are there any health requirements?",
      "What if my layover is longer than planned?"
    );
  }
  
  return suggestions.slice(0, 4); // Limit to 4 suggestions
}
