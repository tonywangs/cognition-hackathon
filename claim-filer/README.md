# Small Claims Court Form Generator

A Next.js web application that allows users to fill out a user-friendly web form and automatically generates a completed California Small Claims Court PDF (SC-100 form) with their information properly mapped to the official court document fields.

## Features

- **Clean Web Interface**: Modern, user-friendly form that's easier to navigate than the official PDF
- **Automatic PDF Generation**: Fills out the official SC-100 court form with your information
- **AI-Powered Assistance**: 
  - Legal text generation for claim descriptions
  - Court information lookup based on location
  - Jurisdiction reasoning
  - Pre-suit demand explanations
- **Address Autocomplete**: Google Places API integration for easy address entry
- **Business Lookup**: Automatic defendant business information fetching
- **Smart Validation**: Comprehensive form validation and error handling

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Keys Setup

### Google Places API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API (New)" service
4. Go to "Credentials" and create an API Key
5. Copy the API key and add it to your `.env.local` file

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key and add it to your `.env.local` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## How It Works

1. **Fill Out the Form**: Complete the user-friendly web form with your claim information
2. **AI Enhancement**: Use AI-powered buttons to generate professional legal language
3. **Auto-Complete Features**: Let the system fill in addresses, court info, and case names
4. **Generate PDF**: Submit the form to create a properly filled SC-100 PDF
5. **Download**: Get your completed court document ready for filing

## Form Sections

1. **Plaintiff Information** - Your personal details
2. **Defendant Information** - Information about who you're suing
3. **Court Information** - Court details (can be auto-generated)
4. **Type of Claim** - Select your claim category
5. **Claim Details** - Specific information about your case
6. **Pre-suit Demand** - Whether you asked for payment first
7. **Jurisdiction** - Why this court should handle your case
8. **Additional Questions** - Special circumstances
9. **Signature and Declarations** - Final legal declarations

## AI Features

- **Legal Text Generation**: Transform your descriptions into proper legal language
- **Court Lookup**: Find the correct court based on your location
- **Jurisdiction Reasoning**: Determine the appropriate legal jurisdiction
- **Pre-suit Explanations**: Generate legally acceptable explanations

## Tech Stack

- **Framework**: Next.js 15.4.6
- **Frontend**: React 19 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **PDF Processing**: pdf-lib for form filling
- **APIs**: OpenAI GPT-4, Google Places API
- **Validation**: Zod for runtime type checking

## Environment Variables

The following environment variables are required in your `.env.local` file:

```env
# Google Places API for address autocomplete and business lookup
GOOGLE_PLACES_API_KEY=your_google_api_key

# OpenAI API for AI-powered legal text generation
OPENAI_API_KEY=your_openai_api_key
```

## Contributing

This project was built for the California Small Claims Court system. Contributions are welcome to improve functionality, add new features, or extend support to other jurisdictions.

## Legal Disclaimer

This tool is for informational purposes only and does not constitute legal advice. Users should verify all information and consult with legal professionals when needed. Always review generated documents before filing with the court.

## Project Structure

```
claim-filer/
├── src/app/
│   ├── api/           # API endpoints
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # App layout
│   └── page.tsx       # Main form interface
├── components/ui/     # Reusable UI components
├── pdf/              # PDF templates
├── public/           # Static assets
└── lib/              # Utility functions
```

## Troubleshooting

- **API Key Issues**: Make sure your `.env.local` file is in the root directory and contains valid API keys
- **PDF Generation Fails**: Check that the PDF template files are present in the `pdf/` directory
- **Address Autocomplete Not Working**: Verify your Google Places API key has the correct permissions enabled