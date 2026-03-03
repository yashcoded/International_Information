import OpenAI from 'openai';
import axios from 'axios';
import { COUNTRIES } from '../countries';
import type { AgentMemory } from './memory';

/** ISO 3166-1 alpha-3 to alpha-2 country code mapping. */
const CCA3_TO_CCA2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', AND: 'AD', AGO: 'AO', ARG: 'AR', ARM: 'AM', AUS: 'AU',
  AUT: 'AT', AZE: 'AZ', BHS: 'BS', BHR: 'BH', BGD: 'BD', BRB: 'BB', BLR: 'BY', BEL: 'BE',
  BLZ: 'BZ', BEN: 'BJ', BTN: 'BT', BOL: 'BO', BIH: 'BA', BWA: 'BW', BRA: 'BR', BRN: 'BN',
  BGR: 'BG', BFA: 'BF', BDI: 'BI', KHM: 'KH', CMR: 'CM', CAN: 'CA', CPV: 'CV', CAF: 'CF',
  TCD: 'TD', CHL: 'CL', CHN: 'CN', COL: 'CO', COM: 'KM', COG: 'CG', COD: 'CD', CRI: 'CR',
  HRV: 'HR', CUB: 'CU', CYP: 'CY', CZE: 'CZ', DNK: 'DK', DJI: 'DJ', DMA: 'DM', DOM: 'DO',
  ECU: 'EC', EGY: 'EG', SLV: 'SV', GNQ: 'GQ', ERI: 'ER', EST: 'EE', ETH: 'ET', FJI: 'FJ',
  FIN: 'FI', FRA: 'FR', GAB: 'GA', GMB: 'GM', GEO: 'GE', DEU: 'DE', GHA: 'GH', GRC: 'GR',
  GRD: 'GD', GTM: 'GT', GIN: 'GN', GNB: 'GW', GUY: 'GY', HTI: 'HT', HND: 'HN', HUN: 'HU',
  ISL: 'IS', IND: 'IN', IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL', ITA: 'IT',
  JAM: 'JM', JPN: 'JP', JOR: 'JO', KAZ: 'KZ', KEN: 'KE', KIR: 'KI', PRK: 'KP', KOR: 'KR',
  KWT: 'KW', KGZ: 'KG', LAO: 'LA', LVA: 'LV', LBN: 'LB', LSO: 'LS', LBR: 'LR', LBY: 'LY',
  LIE: 'LI', LTU: 'LT', LUX: 'LU', MKD: 'MK', MDG: 'MG', MWI: 'MW', MYS: 'MY', MDV: 'MV',
  MLI: 'ML', MLT: 'MT', MHL: 'MH', MRT: 'MR', MUS: 'MU', MEX: 'MX', FSM: 'FM', MDA: 'MD',
  MCO: 'MC', MNG: 'MN', MNE: 'ME', MAR: 'MA', MOZ: 'MZ', MMR: 'MM', NAM: 'NA', NRU: 'NR',
  NPL: 'NP', NLD: 'NL', NZL: 'NZ', NIC: 'NI', NER: 'NE', NGA: 'NG', NOR: 'NO', OMN: 'OM',
  PAK: 'PK', PLW: 'PW', PAN: 'PA', PNG: 'PG', PRY: 'PY', PER: 'PE', PHL: 'PH', POL: 'PL',
  PRT: 'PT', QAT: 'QA', ROU: 'RO', RUS: 'RU', RWA: 'RW', KNA: 'KN', LCA: 'LC', VCT: 'VC',
  WSM: 'WS', SMR: 'SM', STP: 'ST', SAU: 'SA', SEN: 'SN', SRB: 'RS', SYC: 'SC', SLE: 'SL',
  SGP: 'SG', SVK: 'SK', SVN: 'SI', SLB: 'SB', SOM: 'SO', ZAF: 'ZA', SSD: 'SS', ESP: 'ES',
  LKA: 'LK', SDN: 'SD', SUR: 'SR', SWE: 'SE', CHE: 'CH', SYR: 'SY', TWN: 'TW', TJK: 'TJ',
  TZA: 'TZ', THA: 'TH', TLS: 'TL', TGO: 'TG', TON: 'TO', TTO: 'TT', TUN: 'TN', TUR: 'TR',
  TKM: 'TM', TUV: 'TV', UGA: 'UG', UKR: 'UA', ARE: 'AE', GBR: 'GB', USA: 'US', URY: 'UY',
  UZB: 'UZ', VUT: 'VU', VAT: 'VA', VEN: 'VE', VNM: 'VN', YEM: 'YE', ZMB: 'ZM', ZWE: 'ZW',
};

/** Returns a JSON-serializable error object with an errorType flag for retry detection. */
function toSafeError(error: unknown): { errorType: 'external_api'; message: string; status?: number } {
  if (axios.isAxiosError(error)) {
    return { errorType: 'external_api', message: error.message, status: error.response?.status };
  }
  return { errorType: 'external_api', message: error instanceof Error ? error.message : String(error) };
}

/** US state/region names used to infer country code US when geocoding fails (e.g. "Fairbanks, Alaska"). */
const US_STATE_AND_REGION_NAMES = [
  'alaska', 'alabama', 'arkansas', 'arizona', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'iowa', 'idaho', 'illinois', 'indiana',
  'kansas', 'kentucky', 'louisiana', 'massachusetts', 'maryland', 'maine', 'michigan',
  'minnesota', 'missouri', 'mississippi', 'montana', 'north carolina', 'north dakota',
  'nebraska', 'new hampshire', 'new jersey', 'new mexico', 'nevada', 'new york',
  'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina',
  'south dakota', 'tennessee', 'texas', 'utah', 'virginia', 'vermont', 'washington',
  'wisconsin', 'west virginia', 'wyoming', 'district of columbia', 'puerto rico', 'guam',
];

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

async function weatherForecastTool(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const destination = (input.destination as string) || travel.travelTo || '';

  if (!destination) {
    return { summary: 'No destination provided for weather check.' };
  }

  try {
    const geo = await geocodeDestination(destination);
    if (!geo) {
      return { summary: `Could not find weather data for ${destination}.` };
    }
    const { latitude, longitude, name, country } = geo;

    // 2. Get Weather Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
    const weatherRes = await axios.get(weatherUrl);
    const daily = weatherRes.data.daily;

    // 3. Format Summary
    let summary = `Weather forecast for **${name}, ${country || ''}** (next 7 days):\n\n`;
    
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(5, daily.time.length); i++) { // Show 5 days
        const date = daily.time[i];
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const precip = daily.precipitation_probability_max[i];
        
        summary += `- **${date}**: High ${maxTemp}°C, Low ${minTemp}°C, 🌧️ ${precip}% rain\n`;
      }
    } else {
      summary += 'No daily forecast data available.';
    }

    summary += `\n*Data provided by Open-Meteo*`;

    return {
      summary,
      data: weatherRes.data
    };

  } catch (error) {
    return {
      summary: `Failed to fetch weather for ${destination}. (External API Error)`,
      data: toSafeError(error),
    };
  }
}

async function convertCurrencyTool(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  
  // Default to converting 100 USD to the destination currency if not specified
  const rawAmount = input.amount as number | undefined;
  const amount = rawAmount != null && isFinite(rawAmount) && rawAmount > 0 ? rawAmount : 100;
  const from = (input.from as string) || 'USD';
  let to = (input.to as string) || '';

  // Try to infer destination currency from travel context if not provided
  if (!to && travel.travelTo) {
    // Simple mapping for common destinations
    const dest = travel.travelTo.toLowerCase();
    if (dest.includes('uk') || dest.includes('london') || dest.includes('britain')) to = 'GBP';
    else if (dest.includes('japan') || dest.includes('tokyo')) to = 'JPY';
    else if (dest.includes('europe') || dest.includes('france') || dest.includes('germany') || dest.includes('italy') || dest.includes('spain')) to = 'EUR';
    else if (dest.includes('canada')) to = 'CAD';
    else if (dest.includes('australia')) to = 'AUD';
    else to = 'EUR'; // Default fallback
  } else if (!to) {
    to = 'EUR';
  }

  try {
    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
    const res = await axios.get(url);
    
    if (!res.data || !res.data.rates || !res.data.rates[to]) {
      return { summary: `Could not fetch exchange rate for ${from} to ${to}.` };
    }

    const convertedAmount = res.data.rates[to];
    const rate = convertedAmount / amount;

    return {
      summary: `Currency Conversion: **${amount} ${from}** = **${convertedAmount.toFixed(2)} ${to}** (Exchange Rate: 1 ${from} ≈ ${rate.toFixed(4)} ${to}).`,
      data: res.data
    };

  } catch (error) {
    return {
      summary: `Failed to convert currency from ${from} to ${to}. (External API Error)`,
      data: toSafeError(error),
    };
  }
}

/** Geocode a destination (e.g. "Fairbanks, Alaska"). Tries full string, then city-only; with US state adds city+countryCode=US. */
async function geocodeDestination(destination: string): Promise<{ latitude: number; longitude: number; name: string; country: string; country_code: string; timezone: string } | null> {
  const query = destination.trim();
  if (!query) return null;
  const cityOnly = query.includes(',') ? query.split(',')[0].trim() : '';
  const hasUSState = US_STATE_AND_REGION_NAMES.some(s => query.toLowerCase().includes(s));

  const urls: string[] = [];
  if (cityOnly && cityOnly !== query) {
    urls.push(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    urls.push(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOnly)}&count=1&language=en&format=json`);
    if (hasUSState) {
      urls.push(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOnly)}&count=5&language=en&format=json&countryCode=US`);
    }
  } else {
    urls.push(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  }

  for (const url of urls) {
    try {
      const res = await axios.get(url);
      const results = res.data?.results;
      if (Array.isArray(results) && results.length > 0) {
        const r = results[0];
        return {
          latitude: r.latitude,
          longitude: r.longitude,
          name: r.name,
          country: r.country ?? '',
          country_code: r.country_code ?? '',
          timezone: r.timezone ?? '',
        };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function getLocalTimeTool(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const destination = (input.destination as string) || travel.travelTo || '';

  if (!destination) {
    return { summary: 'No destination provided for time check.' };
  }

  try {
    const geo = await geocodeDestination(destination);
    if (!geo) {
      return { summary: `Could not find location data for ${destination}.` };
    }
    const { latitude, longitude, name, country, timezone } = geo;

    // 2. Get Current Time using TimeAPI.io
    const timeUrl = `https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`;
    const timeRes = await axios.get(timeUrl);
    
    const { time, date, dayOfWeek, timeZone } = timeRes.data;

    return {
      summary: `Current local time in **${name}, ${country || ''}** is **${time}** on **${dayOfWeek}, ${date}** (Timezone: ${timeZone}).`,
      data: timeRes.data
    };

  } catch (error) {
    return {
      summary: `Failed to fetch local time for ${destination}. (External API Error)`,
      data: toSafeError(error),
    };
  }
}

async function checkPublicHolidaysTool(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const travel = context.travelContext ?? {};
  const destination = (input.destination as string) || travel.travelTo || '';
  const year = (input.year as number) || new Date().getFullYear();

  if (!destination) {
    return { summary: 'No destination provided for holiday check.' };
  }

  try {
    let countryCode = '';
    let countryName = '';

    const geo = await geocodeDestination(destination);
    if (geo) {
      countryCode = geo.country_code;
      countryName = geo.country;
    }
    if (!countryCode) {
      const destLower = destination.toLowerCase();
      if (US_STATE_AND_REGION_NAMES.some(s => destLower.includes(s))) {
        countryCode = 'US';
        countryName = 'United States';
      }
    }
    if (!countryCode) {
      const found = COUNTRIES.find(c => c.name.common.toLowerCase() === destination.toLowerCase());
      if (found) {
        countryCode = CCA3_TO_CCA2[found.cca3] ?? '';
        countryName = found.name.common;
      }
    }

    if (!countryCode) {
      return { summary: `Could not determine country code for ${destination}.` };
    }

    // 2. Fetch Holidays
    const holidayUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const holidayRes = await axios.get(holidayUrl);
    
    const holidays = holidayRes.data;
    
    if (!holidays || holidays.length === 0) {
      return { summary: `No public holidays found for ${countryName} (${countryCode}) in ${year}.` };
    }

    // Filter for upcoming holidays if current year, or show all if future
    const today = new Date();
    const upcoming = holidays.filter((h: any) => new Date(h.date) >= today).slice(0, 5);
    
    let summary = `Upcoming Public Holidays in **${countryName}** for ${year}:\n`;
    if (upcoming.length === 0) {
        summary += "No more public holidays left this year.\n";
    } else {
        upcoming.forEach((h: any) => {
            summary += `- **${h.date}**: ${h.name} (${h.localName})\n`;
        });
    }

    return {
      summary,
      data: holidays
    };

  } catch (error) {
    return {
      summary: `Failed to fetch holidays for ${destination}. (External API Error)`,
      data: toSafeError(error),
    };
  }
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
    case 'get_weather':
      return weatherForecastTool(input, context);
    case 'convert_currency':
      return convertCurrencyTool(input, context);
    case 'get_local_time':
      return getLocalTimeTool(input, context);
    case 'check_public_holidays':
      return checkPublicHolidaysTool(input, context);
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
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get the 7-day weather forecast for a specific city or destination.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'City name to check weather for' },
        },
        required: ['destination'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'convert_currency',
      description: 'Convert currency from one currency to another using live exchange rates.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount to convert' },
          from: { type: 'string', description: 'Source currency code (e.g. USD)' },
          to: { type: 'string', description: 'Target currency code (e.g. EUR, JPY)' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_local_time',
      description: 'Get the current local time and timezone for a specific city or destination.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'City name' },
        },
        required: ['destination'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'check_public_holidays',
      description: 'Check for upcoming public holidays in the destination country.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'Country or City name' },
          year: { type: 'number', description: 'Year to check (optional, defaults to current)' },
        },
        required: ['destination'],
      },
    },
  },
];
