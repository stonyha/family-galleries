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

## Authentication

This project uses Auth0 for authentication. All routes are protected, requiring users to log in to access the website.

### Auth0 Setup

1. Create an account on [Auth0](https://auth0.com/) if you don't have one.
2. Create a new application in the Auth0 dashboard.
3. Set the application type to "Regular Web Application".
4. Configure the following URLs:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
5. Copy the Auth0 Domain, Client ID, and Client Secret from your Auth0 application settings.
6. Update your `.env.local` file with the following variables:

```
# Auth0 Configuration
AUTH0_SECRET='use-a-secure-random-string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-auth0-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
AUTH0_SCOPE='openid profile email'
```

### Authentication Features

- Protected Routes: All routes are protected using middleware.
- Login/Logout: Login and logout buttons are available in the navigation bar.
- User Profile: View user profile information at `/profile`.
- HOC for Page Protection: Use the `withPageAuthRequired` HOC to protect individual pages.

Example usage of HOC:

```tsx
'use client';
import withPageAuthRequired from '@/utils/withPageAuthRequired';

function ProtectedPage() {
  return <div>This is a protected page</div>;
}

export default withPageAuthRequired(ProtectedPage);
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
