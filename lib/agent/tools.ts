import OpenAI from 'openai';
import type { AgentMemory } from './memory';

export interface TravelContext {
  passportFrom?: string;
  travelFrom?: string;
  travelTo?: string;
  transitCountry?: string;
  layoverDuration?: string;
  willLeaveAirport?: string;
  secondTransitCountry?: string;
  secondLayoverDuration?: string;
  secondWillLeaveAirport?: string;
  followUpQuestion?: string;
  conversationId?: string | null;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ToolContext {
  travelContext?: TravelContext;
}

export interface ToolResult {
  summary: string;
  data?: unknown;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

async function checkVisaTool(
  input: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const followUpQuestion =
    (input.followUpQuestion as string | undefined) ?? travel.followUpQuestion;

  const conversationHistory =
    (input.conversationHistory as TravelContext['conversationHistory']) ??
    travel.conversationHistory ??
    [];

  if (followUpQuestion) {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })) as { role: 'user' | 'assistant'; content: string }[];

    messages.push({
      role: 'user',
      content: followUpQuestion,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const response =
      completion.choices[0].message?.content?.trim() ||
      'No visa information available';

    return {
      summary: response,
    };
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
  } = travel;

  const hasMultipleLayovers =
    !!secondTransitCountry && !!secondLayoverDuration && !!secondWillLeaveAirport;

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

  const airportStatus =
    willLeaveAirport === 'yes'
      ? 'plans to leave the airport'
      : 'will stay in the airport transit area';

  let userPrompt = '';

  if (hasMultipleLayovers) {
    const secondAirportStatus =
      secondWillLeaveAirport === 'yes'
        ? 'plans to leave the airport'
        : 'will stay in the airport transit area';
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

  const messages: { role: 'system' | 'user'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 2000,
    temperature: 0.7,
  });

  const response =
    completion.choices[0].message?.content?.trim() ||
    'No visa information available';

  return {
    summary: response,
  };
}

async function generateItineraryTool(
  input: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const days = (input.days as number | undefined) ?? 7;

  const destination =
    (input.destination as string | undefined) ??
    travel.travelTo ??
    'your destination';

  const prompt = `Create a concise, practical ${days}-day travel itinerary for a trip to ${destination}.

Focus on:
- Balanced sightseeing, rest, and local experiences
- Clear day-by-day structure
- Short, scannable bullet points

Return a markdown-style outline.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a concise but helpful travel itinerary generator. Be practical and avoid fluff.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 900,
  });

  const summary =
    completion.choices[0].message?.content?.trim() ||
    `Day-by-day plan for ${destination}.`;

  return {
    summary,
  };
}

async function budgetEstimatorTool(
  input: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const days = (input.days as number | undefined) ?? 7;
  const style =
    (input.style as string | undefined) ||
    (travel as any).travelStyle ||
    'mid-range';

  const destination =
    (input.destination as string | undefined) ??
    travel.travelTo ??
    'the destination country';

  const prompt = `Estimate a rough budget for a ${days}-day trip to ${destination} for a ${style} traveler.

Break down:
- Accommodation
- Food
- Local transport
- Activities / attractions
- Misc / buffer

Return:
- Bullet list cost breakdown
- Low / mid / high total estimate range in local currency and USD.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a practical travel budget estimator. Use sensible, clearly-labeled rough ranges and disclaimers.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 700,
  });

  const summary =
    completion.choices[0].message?.content?.trim() ||
    `Budget estimate for ${days}-day ${style} trip to ${destination}.`;

  return {
    summary,
  };
}

async function travelTipsTool(
  input: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const destination =
    (input.destination as string | undefined) ??
    travel.travelTo ??
    'this trip';

  const prompt = `Provide practical, safety-conscious travel tips for ${destination}.

Focus on:
- Entry / border control expectations
- Local customs and etiquette
- Safety basics
- Health considerations
- Connectivity (SIM / eSIM / Wi‑Fi)
- Packing highlights

Keep it concise and skimmable.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an experienced traveler sharing practical, safety-conscious tips. Avoid generic platitudes.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 700,
  });

  const summary =
    completion.choices[0].message?.content?.trim() ||
    `Travel tips for ${destination}.`;

  return {
    summary,
  };
}

export async function callTool(
  action: string,
  input: Record<string, unknown>,
  context: ToolContext,
  _memory: AgentMemory,
): Promise<ToolResult> {
  switch (action) {
    case 'check_visa':
      return checkVisaTool(input, context);
    case 'generate_itinerary':
      return generateItineraryTool(input, context);
    case 'estimate_budget':
      return budgetEstimatorTool(input, context);
    case 'travel_tips':
      return travelTipsTool(input, context);
    default:
      return {
        summary: `No tool implemented for action "${action}".`,
        data: null,
      };
  }
}

export const openAiToolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'check_visa',
      description: 'Check visa and transit requirements for a given itinerary.',
      parameters: {
        type: 'object',
        properties: {
          passportFrom: { type: 'string' },
          travelFrom: { type: 'string' },
          travelTo: { type: 'string' },
          transitCountry: { type: 'string' },
          layoverDuration: { type: 'string' },
          willLeaveAirport: { type: 'string', enum: ['yes', 'no'] },
          secondTransitCountry: { type: 'string' },
          secondLayoverDuration: { type: 'string' },
          secondWillLeaveAirport: { type: 'string', enum: ['yes', 'no'] },
        },
        required: ['passportFrom', 'travelFrom', 'travelTo'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_itinerary',
      description: 'Generate a day-by-day itinerary for a trip.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
          days: { type: 'number', minimum: 1, maximum: 60 },
        },
        required: ['destination'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'estimate_budget',
      description: 'Estimate a rough travel budget for a trip.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
          days: { type: 'number', minimum: 1, maximum: 60 },
          style: {
            type: 'string',
            enum: ['budget', 'mid-range', 'luxury'],
          },
        },
        required: ['destination', 'days'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'travel_tips',
      description:
        'Provide practical travel tips, customs, and safety considerations.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
        },
        required: ['destination'],
      },
    },
  },
];

