# 🌍 International Travel Assistant

> A modern Progressive Web App (PWA) that provides accurate visa and travel document requirements for international travelers, powered by AI.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://web.dev/progressive-web-apps/)

---

## 📖 About

This project was born from a personal experience as an international student traveling from the US to India with a layover in Germany. The documentation available online was contradictory and confusing, requiring multiple email exchanges to get accurate information (spoiler: you don't need a visa if you stay in the transit area!).

**International Travel Assistant** solves this problem by providing:
- 🎯 Accurate visa requirements based on your passport and destination
- ✈️ Transit visa information for layovers
- 🤖 AI-powered travel assistant for follow-up questions
- 📱 Works offline as a Progressive Web App
- 🌙 Beautiful dark/light theme

---

## ✨ Features

### Core Features
- **Smart Visa Checker**: Get visa requirements for any country combination
- **Transit Support**: Check if you need a visa for your layover country
- **AI Travel Agent**: Ask follow-up questions about your travel plans
- **Rate Limiting**: Built-in protection (5 requests per session)
- **Offline Support**: Works even without an internet connection

### Technical Features
- 🚀 **Progressive Web App (PWA)**: Install on any device
- 📱 **Fully Responsive**: Desktop, tablet, and mobile optimized
- 🎨 **Dark/Light Mode**: Seamless theme switching
- ⚡ **Server-Side Rendering**: Fast initial load times
- 🔒 **Secure**: API keys stored safely in environment variables
- ♿ **Accessible**: Built with web accessibility standards

---

## 🚀 Demo

Visit the live app: [https://international-information.vercel.app](https://international-information.vercel.app)

### Screenshots

*Add your screenshots here*

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with SSR |
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [OpenAI API](https://openai.com/) | AI-powered travel assistant |
| [Axios](https://axios-http.com/) | HTTP client |
| [next-pwa](https://github.com/shadowwalker/next-pwa) | Progressive Web App support |
| CSS Modules | Scoped styling |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or higher
- pnpm (recommended) or npm
- OpenAI API key

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yashcoded/International_Information.git
cd International_Information
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local file
touch .env.local

# Add your OpenAI API key
echo "OPENAI_KEY=sk-proj-your-key-here" > .env.local
```

4. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_KEY=your_openai_api_key_here
```

**Get your API key:** [OpenAI API Keys](https://platform.openai.com/api-keys)

⚠️ **Never commit `.env.local` to git!** (Already in `.gitignore`)

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
```bash
git push origin main
```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_KEY` with your API key
   - Select: Production, Preview, and Development

4. **Deploy**
   - Vercel will automatically deploy your app
   - Get your live URL!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- Self-hosted (with Docker)

---

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the website in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app!

### On Desktop (Chrome/Edge)
1. Open the website
2. Click the install icon in the address bar
3. Click "Install"

---

## 🎯 Usage

### Basic Flow
1. **Select your passport country**: Choose the country that issued your passport
2. **Select destination country**: Where you want to travel
3. **Add transit country (optional)**: If you have a layover
4. **Get visa information**: Instant results with official sources
5. **Ask follow-up questions**: Use the AI agent for specific queries

### Example Questions
- "Do I need travel insurance?"
- "What vaccines are required?"
- "Can I work with a tourist visa?"
- "How long can I stay without a visa?"

---

## 🏗️ Project Structure

```
International_Information/
├── app/                    # Next.js 13+ app directory
│   ├── layout.tsx         # Root layout with navbar
│   ├── page.tsx           # Home page
│   ├── theme.css          # Global theme styles
│   └── [routes]/          # Dynamic routes
├── pages/                 # Legacy pages directory
│   ├── api/               # API routes
│   │   └── visa-info.ts  # Visa info endpoint
│   ├── TravelInfo.tsx     # Main travel info page
│   ├── About.tsx          # About page
│   └── _app.tsx           # Custom App component
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── icon-*.png         # PWA icons
│   └── offline.html       # Offline fallback
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Commit with clear messages**
```bash
git commit -m "feat: add amazing feature"
```

5. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 🐛 Known Issues

- Country data may be cached for performance
- Rate limiting resets on page refresh
- Offline mode has limited AI functionality

See [Issues](https://github.com/yashcoded/International_Information/issues) for more.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yash**
- Website: [yashcoded.com](https://yashcoded.com)
- GitHub: [@yashcoded](https://github.com/yashcoded)

---

## 🙏 Acknowledgments

- OpenAI for the GPT API
- Next.js team for the amazing framework
- The open-source community

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yashcoded/International_Information?style=social)
![GitHub forks](https://img.shields.io/github/forks/yashcoded/International_Information?style=social)
![GitHub issues](https://img.shields.io/github/issues/yashcoded/International_Information)

---

## 🗺️ Roadmap

- [ ] Add support for more countries
- [ ] Implement user accounts
- [ ] Save favorite destinations
- [ ] Email alerts for visa changes
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

<p align="center">Made with ❤️ for travelers by travelers</p>
<p align="center">⭐ Star this repo if you found it helpful!</p>
