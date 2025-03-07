# Syllabus Manager

A modern, AI-powered platform for organizing and managing academic syllabi, assignments, and deadlines.

![Syllabus Manager Dashboard](https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80)

## Project Overview

Syllabus Manager is a web application that helps students and educators organize their academic life by automatically extracting and managing course information from syllabi. The platform uses AI to parse syllabus documents and create structured task lists, deadlines, and course schedules.

### Key Features

- 📄 AI-powered syllabus parsing
- 📅 Automated task and deadline extraction
- 📊 Progress tracking and analytics
- 📱 Responsive design for all devices
- 🔔 Smart notification system via email
- 🎨 Dark/light theme support
- 🔒 Secure authentication
- 💾 Automatic data backup

### Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password, Others can be added via Supabase Auth Providers and in UI)
- **AI/ML**: OpenAI GPT-4o-mini
- **Email**: Resend
- **Payments**: Stripe
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form, Zod
- **Date Handling**: date-fns
- **File Processing**: PDF.js, Mammoth

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm 9.x or later
- Supabase account
- OpenAI API key
- Resend API key (for email notifications)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/syllabus-manager.git
cd syllabus-manager
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize the database:
```bash
pnpm run supabase:init
```

5. Start the development server:
```bash
pnpm run dev
```

## Usage Guide

### Uploading a Syllabus

1. Navigate to the dashboard
2. Click "Upload Syllabus" or drag & drop your file
3. Supported formats: PDF, DOC, DOCX, TXT
4. The AI will automatically extract:
   - Course information
   - Assignment details
   - Due dates
   - Course policies

### Managing Tasks

```typescript
// Example: Creating a task
const task = await api.tasks.create({
  title: "Research Paper",
  description: "10-page paper on World War II",
  courseCode: "HIST101",
  taskType: "assignment",
  dueDate: "2024-05-15",
  status: "not-started"
});
```

### API Routes

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks` - Update a task
- `DELETE /api/tasks` - Delete a task

## Project Structure

```
syllabus-manager/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # UI components
│   └── email/            # Email templates
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── supabase/             # Database migrations
```

### Key Files

- `app/layout.tsx` - Root layout
- `lib/supabase.ts` - Supabase client
- `lib/parser.ts` - Syllabus parsing logic
- `components/upload-section.tsx` - File upload handling

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Conventional Commits for commit messages

### Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

### Database Migrations

```bash
# Create a new migration
pnpm run migration:create

# Apply migrations
pnpm run migration:up
```

## Requirements


### External Services

- Supabase (database & auth)
- OpenAI API (syllabus parsing)
- Resend (email notifications)
- Stripe (payments)

## Current Status

### Working Features

✅ User authentication (Email/Password, Others can be added via Supabase Auth Providers and in UI)
✅ Syllabus parsing (Should be optimized further via prompt engineering and pre/post-processing.)
✅ Task management
✅ Course management
✅ Progress tracking
✅ Email notifications (Must be configured in Resend Dashboard)
✅ Payment processing (Must be configured in Stripe Dashboard)


### Known Issues

- PDF parsing may fail for scanned documents
- Limited support for complex table structures
- Occasional delay in real-time updates

## Future Development

### Planned Features

- [ ] Calendar integration (Google, iCal)
- [ ] Mobile app
- [ ] Collaborative features
- [ ] Advanced analytics
- [ ] AI-powered study recommendations
- [ ] Offline support

## Contributing


## Maintenance

### Updates

1. Check for dependency updates:
```bash
pnpm outdated
```

2. Update dependencies:
```bash
pnpm update
```

3. Run tests:
```bash
pnpm test
```

### Backups

- Database backups are automated via Supabase
- Recommended: Weekly manual backups
- Store backups in multiple locations

### Monitoring

- Use Supabase Dashboard for database monitoring
- Monitor API usage via OpenAI dashboard
- Track error rates in production logs
- Monitor payment processing via Stripe dashboard

### Troubleshooting

Common issues and solutions:

1. **Upload fails**
   - Check file size (max 10MB)
   - Verify file format
   - Ensure good internet connection

2. **Parsing errors**
   - Check document formatting
   - Verify OpenAI API key
   - Check rate limits

3. **Authentication issues**
   - Clear browser cache
   - Check email verification
   - Verify Supabase configuration
