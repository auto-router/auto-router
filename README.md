# Auto Router

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

**Auto Router** is a unified interface for LLMs (Large Language Models) that automatically switches to the provider with the lowest combined cost (input + output price). Built with Next.js 13+ App Router and Tailwind CSS for a modern, responsive UI.

## Features
- **Auto-switch LLM provider**: Selects the cheapest provider based on real-time pricing.
- **Modern UI**: Built with Tailwind CSS and Framer Motion.
- **Component-based architecture**: Easy to extend and maintain.
- **No subscription required**: Pay only for what you use.

## Project Structure

```
auto-router/
├── next.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── app/
│   ├── layout.tsx          # App layout (shared NavBar, Footer)
│   ├── page.tsx            # Home page (hero, ChatInput, FeaturedModels, StatsSection, TopApps)
│   └── globals.css         # Global CSS imports for Tailwind
├── components/
│   ├── NavBar.tsx
│   ├── ChatInput.tsx
│   ├── FeaturedModels.tsx
│   ├── StatsSection.tsx
│   ├── TopApps.tsx
│   └── Footer.tsx
├── context/
│   └── AutoSwitchContext.tsx
├── lib/
│   └── providers.ts
└── tsconfig.json
```

## Key Components

- **NavBar.tsx**: Top navigation bar, site branding, and navigation links.
- **Footer.tsx**: Footer with copyright and links.
- **ChatInput.tsx**: User input for chat/messages.
- **FeaturedModels.tsx**: Displays featured LLM models and highlights the currently auto-switched provider.
- **StatsSection.tsx**: Shows usage statistics and metrics.
- **TopApps.tsx**: Highlights top applications using the platform.

## AutoSwitch Logic

The auto-switching logic is implemented in `context/AutoSwitchContext.tsx`:
- Fetches available LLM providers and their pricing from `lib/providers.ts`.
- Selects the provider with the lowest combined input and output price.
- Makes the selected provider available throughout the app via React Context.

**Example:**
```ts
// context/AutoSwitchContext.tsx
const best = list.reduce((a, b) =>
  a.inputPrice + a.outputPrice < b.inputPrice + b.outputPrice ? a : b
);
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
