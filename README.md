# PitchPad

**Professional Outreach Message Composer**

PitchPad is a modern web application designed to streamline the creation of professional outreach messages, cold emails, LinkedIn messages, and job applications. With intelligent template management, variable substitution, and resume integration, PitchPad helps you craft personalized messages efficiently.

## Features

- **Template Management**: Create, organize, and manage reusable message templates
- **Smart Variables**: Automatically extract and fill variables in your templates
- **Resume Integration**: Upload and version your resumes, attach them to messages
- **Category Organization**: Organize templates with categories and tags
- **Usage Analytics**: Track template usage and success rates
- **Multi-Platform Support**: LinkedIn, Gmail, Twitter, Cold Email, and more
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Chakra UI v3
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **TypeScript**: Full type safety
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cold-text
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:

The project uses Prisma with a local PostgreSQL database. The `.env` file should already contain a database URL. If you need to use a different database:

```bash
# Edit .env and update DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/pitchpad"
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will redirect you to the dashboard where you can:
- View your analytics
- Browse templates
- Compose new messages
- Manage categories and resumes

## Database Commands

- **Create migration**: `npm run db:migrate`
- **Seed database**: `npm run db:seed`
- **Open Prisma Studio**: `npm run db:studio`

## Project Structure

```
cold-text/
├── app/
│   ├── (app)/              # Main application routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── templates/      # Template management
│   │   ├── compose/        # Message composer
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── templates/      # Template CRUD
│   │   ├── categories/     # Category CRUD
│   │   ├── resumes/        # Resume management
│   │   └── usage/          # Usage tracking
│   └── layout.tsx          # Root layout
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   ├── templates/      # Template components
│   │   ├── common/         # Shared components
│   │   └── ui/             # UI provider
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client
│   │   ├── theme.ts        # Chakra UI theme
│   │   └── utils.ts        # Utility functions
│   ├── types/              # TypeScript types
│   └── hooks/              # Custom React hooks
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── public/                 # Static assets
```

## Key Features Explained

### Template Variables

Templates support smart variables using the `{{variableName}}` syntax. Variables can include:
- Simple placeholders: `{{name}}`
- With descriptions: `{{name:Recipient's full name}}`
- With defaults: `{{name|John Doe}}`
- Combined: `{{name:Recipient's name|John Doe}}`

### Variable Types

The system automatically infers variable types:
- **TEXT**: Default for most fields
- **TEXTAREA**: For longer content (description, bio, summary)
- **EMAIL**: For email addresses
- **PHONE**: For phone numbers
- **URL**: For links and websites
- **DATE**: For dates
- **RESUME_SELECT**: For resume selection

### Platform Support

Templates can be categorized by platform:
- **LINKEDIN**: LinkedIn messages and connection requests
- **GMAIL**: Gmail emails
- **TWITTER**: Twitter/X messages
- **COLD_EMAIL**: Cold outreach emails
- **OTHER**: General purpose

### Tone Options

Choose the right tone for your message:
- **PROFESSIONAL**: Formal business communication
- **CASUAL**: Relaxed and approachable
- **FRIENDLY**: Warm and personable
- **FORMAL**: Very formal, official communication
- **ENTHUSIASTIC**: Energetic and passionate

## API Endpoints

### Templates
- `GET /api/templates` - List all templates (with filters)
- `POST /api/templates` - Create a new template
- `GET /api/templates/[id]` - Get template by ID
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Resumes
- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Upload new resume

### Usage Tracking
- `POST /api/usage` - Track template usage
- `GET /api/usage/stats` - Get usage statistics

## Sample Data

The seed script creates:
- 4 categories (Job Applications, Networking, Follow-ups, Cold Outreach)
- 5 tags (Software Engineering, Product Management, Design, etc.)
- 5 pre-built templates
- 5 global variables (your name, email, phone, etc.)
- 2 sample contacts

## Development

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Chakra UI, and Prisma
