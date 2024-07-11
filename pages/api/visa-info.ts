import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { fromCountry, toCountry, transitCountry } = req.body;

  const prompt = `I need to know the visa requirements for a traveler going from ${fromCountry} to ${toCountry} with a transit in ${transitCountry}. Please provide the necessary visa information.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const visaInfo = completion.choices[0].message?.content.trim();

    res.status(200).json({ visaInfo });
  } catch (error) {
    console.error('Error fetching visa information:', error);
    res.status(500).json({ error: 'Error fetching visa information' });
  }
}
