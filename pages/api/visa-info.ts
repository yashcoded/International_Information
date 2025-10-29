import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
    let messages: any[] = [];
    
    // If it's a follow-up question, use conversation history
    if (followUpQuestion) {
      // Add conversation history
      conversationHistory.forEach((msg: ConversationMessage) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
      
      // Add the follow-up question
      messages.push({
        role: "user",
        content: followUpQuestion
      });
    } else {
      // Initial query - validate required fields
      if (!passportFrom || !travelFrom || !travelTo || !transitCountry || !layoverDuration || !willLeaveAirport) {
        res.status(400).json({ error: 'All fields (passportFrom, travelFrom, travelTo, transitCountry, layoverDuration, willLeaveAirport) are required.' });
        return;
      }

      const systemPrompt = `You are an expert international travel assistant specializing in visa requirements and travel regulations. You provide accurate, helpful, and comprehensive information about visa requirements, transit rules, and travel advice.

Your responses should be:
- Clear and well-structured
- Include official links when available
- Provide practical advice
- Be conversational and helpful
- Include relevant follow-up suggestions
- Include useful travel resources and links

IMPORTANT: Always include practical links for:
- Official visa application websites
- Embassy/consulate websites
- Flight booking and price comparison websites
- Airport information and services
- Travel insurance options
- Currency exchange and banking
- Local transportation options

Useful travel websites to reference:
- Flight booking: Google Flights, Skyscanner, Kayak, Expedia, Booking.com
- Visa information: Official embassy websites, VisaHQ, iVisa
- Airport services: Official airport websites
- Travel insurance: World Nomads, Allianz Travel, Travel Guard
- Currency: XE.com, OANDA, local bank websites

Format your responses with clear sections and bullet points for easy reading.`;

      // Check if there are multiple layovers
      const hasMultipleLayovers = secondTransitCountry && secondLayoverDuration && secondWillLeaveAirport;
      
      const airportStatus = willLeaveAirport === 'yes' ? 'plans to leave the airport' : 'will stay in the airport transit area';
      
      let userPrompt = '';
      
      if (hasMultipleLayovers) {
        // Multiple layovers scenario
        const secondAirportStatus = secondWillLeaveAirport === 'yes' ? 'plans to leave the airport' : 'will stay in the airport transit area';
        userPrompt = `A traveler with a ${passportFrom} passport is traveling from ${travelFrom} to ${travelTo} with TWO layovers:
        
FIRST LAYOVER: ${layoverDuration} hours in ${transitCountry} - The traveler ${airportStatus}.
SECOND LAYOVER: ${secondLayoverDuration} hours in ${secondTransitCountry} - The traveler ${secondAirportStatus}.

Please provide comprehensive information about BOTH layovers including:
1. Whether a transit visa is required for EACH country
2. Official application links if a visa is needed for each transit country
3. Official documentation sources for verification
4. Additional visa requirements and considerations for both countries
5. Alternative options if no visa is required for either country
6. Any special conditions or restrictions for each transit country
7. Recommended actions and next steps

IMPORTANT: You MUST provide separate, detailed visa information for BOTH ${transitCountry} and ${secondTransitCountry}.`;
      } else {
        // Single layover scenario
        userPrompt = `A traveler with a ${passportFrom} passport is traveling from ${travelFrom} to ${travelTo} with a ${layoverDuration}-hour layover in ${transitCountry}. The traveler ${airportStatus}.

Please provide comprehensive information about:
1. Whether a transit visa is required
2. Official application links if a visa is needed
3. Official documentation sources for verification
4. Additional visa requirements and considerations
5. Alternative options if no visa is required
6. Any special conditions or restrictions
7. Recommended actions and next steps`;
      }

      // Add common resources section for both cases
      const resourcesSection = `

IMPORTANT: Also include practical travel resources:
- Flight booking websites and price comparison tools
- Airport information and services
- Travel insurance options
- Currency exchange information
- Local transportation options
- Accommodation options if needed

Please provide specific, clickable links to useful websites and services.

IMPORTANT: At the end of your response, add a section titled "Suggested follow-up questions:" followed by 3-4 specific questions that the traveler might want to ask. Format each question on a new line starting with "- " (dash and space).`;

      userPrompt += resourcesSection;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message?.content?.trim() || 'No visa information available';
    
    // Extract suggestions from the response
    const suggestions = extractSuggestions(response);
    
    // Clean the response by removing suggestions
    const cleanResponse = response.replace(/\n\nSuggested follow-up questions:[\s\S]*$/, '').trim();

    res.status(200).json({ 
      visaInfo: cleanResponse,
      conversationId: currentConversationId,
      suggestions: suggestions
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
