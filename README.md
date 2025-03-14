# Web Portfolio

A modern personal portfolio website and blog with interactive AI demo applications built using Next.js App Router.

## Project Overview

This portfolio site includes:

- **Personal Portfolio**: About me, expertise, services, and contact sections
- **Blog Platform**: MDX-powered blog with full markdown support
- **AI Applications**: Interactive demos of AI tools and applications
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom components
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Content**: [MDX](https://mdxjs.com/) for blog posts with code highlighting
- **AI Integration**: OpenAI and Groq APIs via AI SDK
- **Rate Limiting**: Upstash Redis for API request limiting
- **Type Safety**: TypeScript throughout
- **Linting/Formatting**: ESLint with Next.js config and Prettier

## Project Structure

- `/app`: Next.js App Router structure with route groups
  - `/(aboutme)`: Personal portfolio pages and components
  - `/(ai)`: AI demo applications and API routes
  - `/(blog)`: Blog platform with MDX content rendering
  - `/(demo)`: Additional demo pages
- `/components`: Shared UI components
  - `/ui`: Reusable UI components based on shadcn/ui
- `/content`: MDX blog posts and content
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and shared logic
- `/public`: Static assets and images
- `/styles`: Global CSS and Tailwind configuration

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Run production build
- `pnpm lint`: Run ESLint
- `pnpm format`: Format code with Prettier
- `pnpm format:check`: Check formatting without making changes
