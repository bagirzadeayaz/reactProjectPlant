# Planto

A modern, responsive e-commerce landing page for an online plant shop built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- **Hero Section** — Eye-catching landing area with a featured plant showcase
- **Trendy Plants** — Carousel of trending plant selections
- **Top Selling** — Grid display of the most popular plants with ratings and pricing
- **Customer Reviews** — Testimonials section with user avatars and ratings
- **Best Collection** — Highlighted collection call-to-action
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop
- **Smooth Animations** — Powered by Framer Motion for polished transitions
- **Custom SVG Icons** — Using Lucide React icon library

## Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| React 19         | UI library                     |
| TypeScript       | Type safety                    |
| Vite 8           | Build tool & dev server        |
| Tailwind CSS 4   | Utility-first styling          |
| Framer Motion    | Animations                     |
| Lucide React     | Icon library                   |

## Project Structure

```
planto/
├── public/                  # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Images and SVGs
│   ├── components/          # React components
│   │   ├── BestCollection.tsx
│   │   ├── CustomerReview.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── TopSelling.tsx
│   │   └── TrendyPlants.tsx
│   ├── data/                # Mock data
│   │   ├── plants.ts
│   │   └── reviews.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles & Tailwind
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or **pnpm** / **yarn**)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sadiqov-Riad/Planto-.git
   cd Planto-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |

## License

MIT
