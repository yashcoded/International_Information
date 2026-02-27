import type { NextApiRequest, NextApiResponse } from 'next';
import { runAgent } from '../../lib/agent/agent';
import type { TravelContext } from '../../lib/agent/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Fast path for e2e tests to avoid slow OpenAI calls
  if (process.env.NEXT_PUBLIC_TEST_MODE === '1') {
    const { goalText } = req.body || {};
    const safeGoal = goalText || 'Plan a short sample trip.';

    return res.status(200).json({
      finalText: `Stubbed trip plan for testing.\n\nYou asked: "${safeGoal}".\n\nThis is a short, fake summary so Playwright tests can run quickly.`,
      plan: {
        goal: safeGoal,
        steps: [
          { id: 1, action: 'check_visa', input: {} },
          { id: 2, action: 'generate_itinerary', input: {} },
          { id: 3, action: 'estimate_budget', input: {} },
          { id: 4, action: 'travel_tips', input: {} },
        ],
      },
      steps: [
        {
          id: 1,
          action: 'check_visa',
          input: {},
          summary: 'Stubbed visa check: no visa required for short stays in test mode.',
        },
        {
          id: 2,
          action: 'generate_itinerary',
          input: {},
          summary: 'Stubbed 3-day itinerary for testing.',
        },
        {
          id: 3,
          action: 'estimate_budget',
          input: {},
          summary: 'Stubbed budget estimate: low / medium / high ranges.',
        },
        {
          id: 4,
          action: 'travel_tips',
          input: {},
          summary: 'Stubbed travel tips: arrive early, keep documents handy.',
        },
      ],
    });
  }

  const { goalText, travelContext = {} } = req.body || {};

  if (!goalText || typeof goalText !== 'string') {
    res.status(400).json({ error: 'Missing goalText in request body.' });
    return;
  }

  try {
    const context: TravelContext = {
      ...(travelContext || {}),
    };

    const result = await runAgent(goalText, {
      travelContext: context,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error planning trip:', error);
    res.status(500).json({ error: 'Error planning trip' });
  }
}

