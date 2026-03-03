## Project Architecture (Explained Like You're 5)

Imagine this app as a **travel office**:

- The **front desk** is what you see in the browser (React pages).
- The **back office** is where smart helpers think and call APIs (Next.js API routes + AI agent).
- The **super-brain** is the **AI Agent** in `lib/agent`.

### Big Pieces (Modules)

- `pages/`  
  - Contains the **screens** (pages) the user sees.
  - Examples:
    - `TravelInfo.tsx` – the visa information form.
    - `TripPlanner.tsx` – the AI Trip Planner page.
    - `api/visa-info.ts` – API route for visa info.
    - `api/plan-trip.ts` – API route that talks to the AI Agent.

- `lib/agent/` – **AI Agent brain**
  - `planner.ts` – **The Planner**
    - You say: “Plan a 10 day trip to Italy.”
    - The planner turns this into **steps**:
      - Step 1: `check_visa`
      - Step 2: `get_weather`
      - Step 3: `generate_itinerary`
      - Step 4: `estimate_budget`
      - Step 5: `travel_tips`
      - Step 6: `convert_currency`
      - Step 7: `get_local_time`
      - Step 8: `check_public_holidays`
  - `tools.ts` – **The Tools (Hands and Eyes)**
    - Each tool is like a helper:
      - `checkVisaTool` – reads your passport + route and asks OpenAI for visa info.
      - `generateItineraryTool` – asks OpenAI to make a day‑by‑day plan.
      - `budgetEstimatorTool` – asks OpenAI to guess costs.
      - `travelTipsTool` – asks OpenAI to list tips.
      - `weatherForecastTool` – calls **Open-Meteo API** for **real weather**.
      - `convertCurrencyTool` – calls **Frankfurter API** for **real exchange rates**.
      - `getLocalTimeTool` – calls **TimeAPI.io** to get **local time**.
      - `checkPublicHolidaysTool` – calls **Nager.Date API** to get holidays.
  - `executor.ts` – **The Executor (Worker)**
    - Takes the plan from the planner and runs each step **in order**.
    - For each step it calls `callTool(...)` from `tools.ts`.
    - Has a **retry** mechanism:
      - If a tool says “External API Error”, it tries again one more time.
  - `memory.ts` – **The Notebook**
    - Remembers:
      - What the user said before.
      - What each step did and answered.
  - `agent.ts` – **The Boss**
    - Function: `runAgent(userInput, options)`
    - Flow:
      1. Ask `planner` to create a **plan**.
      2. Ask `executor` to **run all steps** (tools).
      3. Ask OpenAI one last time to **summarize all step results** into a final answer.
    - This is what `pages/api/plan-trip.ts` calls.

- `lib/countries.ts`
  - Simple list of countries used for the **smart dropdowns** on the Trip Planner page.

### How a Trip Plan Flows (Step‑by‑Step)

1. **User** types a goal in `TripPlanner.tsx`.
2. Frontend calls `/api/plan-trip` (Next.js API route).
3. `/api/plan-trip.ts` calls `runAgent(goalText, { travelContext })`.
4. `runAgent`:
   - Uses `planner.ts` → makes JSON plan (`steps`).
   - Uses `executor.ts` → calls tools in `tools.ts`.
   - Uses `memory.ts` → remembers steps.
   - Calls OpenAI → builds final text summary.
5. API returns `{ finalText, plan, steps }` to the browser.
6. `TripPlanner.tsx`:
   - Shows the **Plan steps** list.
   - Shows **Trip overview** rendered via `ReactMarkdown`.

