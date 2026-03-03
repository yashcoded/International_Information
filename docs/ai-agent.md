## AI Agent (Explained Like You're 5)

Imagine you have a very smart **robot travel assistant**.

You say:

> “Plan a trip for me from New York to Tokyo.”

The robot doesn’t answer right away.  
First, it **thinks** and writes a to‑do list for itself:

- 1️⃣ Check visas  
- 2️⃣ Check weather  
- 3️⃣ Make itinerary  
- 4️⃣ Estimate budget  
- 5️⃣ Give tips  
- 6️⃣ Convert money  
- 7️⃣ Check local time  
- 8️⃣ Check holidays  

Then it **does all of these** one by one, by calling different tools.

### Important Files

- `lib/agent/agent.ts` – the **boss** function:
  - `runAgent(userInput, options)`:
    - Calls the planner.
    - Executes the plan.
    - Summarizes everything for the user.

- `lib/agent/planner.ts` – the **planner**:
  - Uses OpenAI to turn a **goal string** into a JSON **plan**:
    - Each step has:
      - `id` – step number.
      - `action` – name of the tool (e.g. `get_weather`).
      - `input` – small object with data (e.g. `{ destination: "Tokyo" }`).

- `lib/agent/tools.ts` – the **tools** (hands and eyes):
  - ChatGPT‑style tools:
    - `checkVisaTool`
    - `generateItineraryTool`
    - `budgetEstimatorTool`
    - `travelTipsTool`
  - Real‑world tools:
    - `weatherForecastTool` – calls Open‑Meteo.
    - `convertCurrencyTool` – calls Frankfurter.
    - `getLocalTimeTool` – calls TimeAPI.io.
    - `checkPublicHolidaysTool` – calls Nager.Date.

- `lib/agent/executor.ts` – the **worker**:
  - Runs each step from the plan:
    - For each step:
      - Calls `callTool(action, input, context, memory)`.
      - Saves result into memory.
  - Has retry logic:
    - If a tool fails with `"External API Error"`, tries **one more time**.

- `lib/agent/memory.ts` – the **notebook**:
  - Keeps track of:
    - Conversation history with the user.
    - Which steps ran and what they returned.

### Where is it used in the UI?

- `pages/TripPlanner.tsx` (React page):
  - Sends `goalText` + `travelContext` to:
    - `pages/api/plan-trip.ts`
  - API route calls:
    - `runAgent(...)` from `lib/agent/agent.ts`
  - Then it renders:
    - **Plan steps** (`plan.steps`) in the right column.
    - **Trip overview** (`finalText`) using `ReactMarkdown`.

