## Getting Started (Like you're 5)

Imagine this project is a **smart travel friend** that lives inside your computer.  
You tell it: “I want to go from **here** to **there**”, and it:

- Checks **visas** (Can you go there?)
- Makes an **itinerary** (What can you do there?)
- Estimates **money** (How much might it cost?)
- Gives **tips** (What should you be careful about?)

To make this friend work on your machine, follow these simple steps.

### 1. Install the tools

- **Node.js**: This is like the “engine” that runs the code.
- **pnpm**: This is like a **shopping cart** that brings all the small code pieces (packages) your app needs.

Check Node:

```bash
node -v
```

Install pnpm (if you don’t have it):

```bash
npm install -g pnpm
```

### 2. Download the project

```bash
git clone https://github.com/yashcoded/International_Information.git
cd International_Information
```

### 3. Install dependencies

```bash
pnpm install
```

This pulls in everything the app needs (React, Next.js, OpenAI client, Playwright, etc.).

### 4. Add your secrets (env)

Create a file called `.env.local` in the project root:

```bash
touch .env.local
```

Put your OpenAI key inside:

```env
OPENAI_KEY=sk-...your-key-here...
```

> Think of this like giving your travel friend a **brain** so it can think.

### 5. Run the app

```bash
pnpm dev
```

Open this in your browser:

```text
http://localhost:3000
```

Now you can use:

- The **Visa Information** page to check requirements.
- The **Trip Planner** page to let the **AI Agent** plan your trip.

