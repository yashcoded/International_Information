import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { passportFrom, travelFrom, travelTo, transitCountry, layoverDuration } = req.body;

  if (!passportFrom || !travelFrom || !travelTo || !transitCountry || !layoverDuration) {
    res.status(400).json({ error: 'All fields (fromCountry, toCountry, transitCountry, layoverDuration) are required.' });
    return;
  }

  const prompt = `
    A traveler with a passport from ${passportFrom} is traveling from ${travelFrom} to ${travelTo}  with a layover in ${transitCountry} of ${layoverDuration} hours in the transit country. 
    Please provide:
    - Whether a transit visa is required.

    - A link to the official application page if a visa is required.

    - A link to the official documentation source for verification.

    - Any additional information about the visa requirements for the traveler.

    - options for the traveler if a visa is not required.
  `;


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const visaInfo = completion.choices[0].message && completion.choices[0].message.content ? completion.choices[0].message.content.trim() : 'No visa information available';

    res.status(200).json({ visaInfo });
  } catch (error) {
    console.error('Error fetching visa information:', error);
    res.status(500).json({ error: 'Error fetching visa information' });
  }
}
