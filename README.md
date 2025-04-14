# Family Galleries

A modern, responsive website for showcasing family photo galleries, built with Next.js and Contentful CMS.

## Features

- Responsive design optimized for all devices
- Homepage with featured galleries and family introduction
- Gallery list page showing all available photo galleries
- Gallery detail page with lightbox photo viewing
- About page with customizable content
- SEO-friendly structure
- Image optimization and lazy loading

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, React
- **Styling**: TailwindCSS
- **CMS**: Contentful
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 16.8.0 or later
- npm or yarn
- A Contentful account (free tier works fine)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd family-galleries
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Set Up Contentful

1. Create a Contentful account at [contentful.com](https://www.contentful.com/)
2. Create a new space in Contentful
3. Import the content model:
   - Go to Settings > Content model in Contentful
   - Use the provided `contentful-content-model.json` file to import the model

### 4. Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Fill in your Contentful details:
   - `CONTENTFUL_SPACE_ID`: Your Contentful space ID (found in Settings > API keys)
   - `CONTENTFUL_ACCESS_TOKEN`: Your Contentful Content Delivery API access token
   - `CONTENTFUL_ENVIRONMENT`: Usually "master" (default)
   - `NEXT_PUBLIC_SITE_NAME`: Your family gallery website name

### 5. Add Content in Contentful

1. Create a Home Page entry
2. Create an About Page entry
3. Create Gallery entries with photos

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Deployment

The easiest way to deploy this application is using [Vercel](https://vercel.com), the platform built by the creators of Next.js.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

## Content Management

### Gallery Structure

Each gallery consists of:
- **Title**: The name of the gallery/event
- **Slug**: URL-friendly version of the title (e.g., "summer-vacation-2023")
- **Description**: Brief information about the event
- **Event Date**: When the event occurred
- **Cover Image**: Main image displayed on gallery cards
- **Images**: Collection of photos in the gallery
- **Location**: Where the event took place (optional)
- **Tags**: Keywords to categorize the gallery (optional)

### Home Page Content

The home page displays:
- **Title**: Main headline
- **Introduction**: Brief welcome text
- **Hero Image**: Large featured image
- **Featured Galleries**: Selected galleries to highlight (if none are set, most recent galleries will be shown)

## Customization

- **Colors**: Edit the TailwindCSS configuration in `tailwind.config.js`
- **Layout**: Modify components in the `src/components/layout` directory
- **Styling**: Adjust styles in individual component files

## License

This project is licensed under the MIT License - see the LICENSE file for details.
