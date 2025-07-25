<a href="https://chat.vercel.ai/">
  <img alt="Next.js 15 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">AI Chat SDK + Admin Panel</h1>
</a>

<p align="center">
    An open-source boilerplate that extends the Chat SDK with production-ready features like admin panels, user management, and multi-environment deployments.
</p>

<p align="center">
  <a href="#why-we-built-this"><strong>Why This Exists</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#admin-panel"><strong>Admin Panel</strong></a>
</p>
<br/>

## Why We Built This

After building numerous AI chat applications with the excellent [Chat SDK](https://chat-sdk.dev), we found ourselves repeatedly implementing the same essential features:

- **Admin panels** for managing users and content
- **Role-based access control** for different user types
- **Staging/production environments** for safe deployments
- **User management** systems
- **Prompt management** interfaces

This boilerplate provides all these features out of the box, saving weeks of development time.

**We encourage contributions!** If you've built features that would benefit others, please submit a PR. Let's make this the go-to starting point for production AI chat applications.

## Features

### Core Chat SDK Features
- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

### Production-Ready Enhancements
- 👥 **Admin Panel** - Complete user management interface
  - View and manage all users
  - Role assignment (user/admin/super_admin)
  - Guest user filtering
  - User activity monitoring
- 📝 **Suggested Prompts Management**
  - Create, edit, and delete prompt suggestions
  - Drag-and-drop reordering
  - Active/inactive states
  - Maximum of 4 active prompts shown to users
- 🔐 **Enhanced Authentication**
  - Role-based access control (RBAC)
  - Protected admin routes
  - Guest user support
- 🚀 **Multi-Environment Setup**
  - Separate staging and production configurations
  - Environment-specific database connections
  - Safe deployment workflows
- 📊 **Database Enhancements**
  - Drizzle ORM for type-safe queries
  - Migration system
  - Seed scripts for initial data
- 🎨 **UI/UX Improvements**
  - Dark mode support
  - Responsive admin interface
  - Loading states and error handling
  - Toast notifications

## Model Providers

This template ships with [xAI](https://x.ai) `grok-2-1212` as the default chat model. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run the application. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

### Quick Start

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev

# Copy environment variables
cp .env.example .env.local
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

### 2. Configure Environment Variables

#### Environment Variable Strategy

This project supports two approaches for environment variables:

**1. Vercel Dashboard (Recommended)**

Use Vercel's built-in environment variable system. Set different values for the same variable name across environments:

- **Development**: Local development using `.env.local`
- **Preview**: Staging/preview deployments on Vercel
- **Production**: Production deployments on Vercel

In your Vercel dashboard, set these variables for each environment:
- `POSTGRES_URL` - Different database for each environment
- `REDIS_URL` - Different Redis instance (optional - only for resumable streams)
- `BLOB_READ_WRITE_TOKEN` - Different blob storage
- `AUTH_SECRET` - Different secret for each environment
- `XAI_API_KEY` - Can be the same across environments

**2. GitHub Actions & Manual Scripts**

For workflows that need to specify environments explicitly (like database migrations in CI/CD), you can use environment-specific names:
- `POSTGRES_URL_STAGING` / `POSTGRES_URL_PROD`
- `REDIS_URL_STAGING` / `REDIS_URL_PROD`
- `BLOB_READ_WRITE_TOKEN_STAGING` / `BLOB_READ_WRITE_TOKEN_PROD`

The configuration will check for environment-specific names first, then fall back to standard names.

Update `.env.local` with your development credentials:

```env
# Authentication
AUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/myapp_dev

# Redis
REDIS_URL=redis://localhost:6379

# Blob Storage
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>

# AI Provider
XAI_API_KEY=<your-xai-api-key>

# Super Admin (for seeding)
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=changeme123
```

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

### 3. Database Setup

```bash
# Run migrations
pnpm db:migrate

# Seed initial admin user and prompts
pnpm db:seed
```

### 4. Start Development

```bash
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000).

### First Time Setup

After starting the app:

1. Visit [localhost:3000](http://localhost:3000) to see the chat interface
2. Log in with the super admin credentials you set in `.env.local`
3. Visit [localhost:3000/admin](http://localhost:3000/admin) to access the admin panel

## Project Structure

```
├── app/
│   ├── (admin)/          # Admin panel routes
│   │   ├── admin/
│   │   │   ├── users/    # User management (super admin only)
│   │   │   └── prompts/  # Suggested prompts management
│   │   └── admin-sidebar.tsx
│   ├── (auth)/           # Authentication routes
│   ├── (chat)/           # Main chat interface
│   └── api/              # API routes
├── components/           # Reusable components
├── config/              # Configuration files
│   └── environments.ts  # Multi-environment config
├── lib/
│   ├── ai/              # AI provider configuration
│   └── db/              # Database schema and queries
├── scripts/             # Utility scripts
│   ├── seed-admin.ts    # Initial admin setup
│   └── promote-to-production.ts
└── .github/workflows/   # CI/CD pipelines
```

## User Roles

### 1. User (Default)
- Access to chat interface
- Can create and manage own chats
- View suggested prompts

### 2. Admin
- All user permissions
- Access to admin panel
- Manage suggested prompts
- View system statistics

### 3. Super Admin
- All admin permissions
- Manage user roles
- Full system administration

## Admin Panel

Access the admin panel at `/admin` (requires admin or super_admin role).

### Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="app/(admin)/admin-dashboard.png" alt="Admin Dashboard" width="100%"/>
        <br/>
        <strong>Dashboard</strong>
        <br/>
        <em>View system statistics and metrics at a glance</em>
      </td>
      <td align="center">
        <img src="app/(admin)/admin-prompts.png" alt="Suggested Prompts Management" width="100%"/>
        <br/>
        <strong>Suggested Prompts</strong>
        <br/>
        <em>Create and manage prompts for users</em>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="2">
        <img src="app/(admin)/admin-users.png" alt="User Management" width="50%"/>
        <br/>
        <strong>User Management</strong>
        <br/>
        <em>View and manage user roles (super admin only)</em>
      </td>
    </tr>
  </table>
</div>

### Features

1. **Dashboard** 
   - Real-time user statistics (total users, active users)
   - Chat metrics (total chats, messages sent)
   - Active prompts counter
   - Visual analytics with interactive charts

2. **User Management** (Super Admin Only)
   - View all registered users
   - Assign and modify user roles
   - Filter and paginate through user lists
   - See user creation dates and current roles

3. **Suggested Prompts** 
   - Create, edit, and delete prompts
   - Toggle prompts active/inactive
   - Drag-and-drop reordering
   - Real-time preview of prompt content
   - Maximum of 4 active prompts shown in chat interface

### Managing Suggested Prompts

1. Navigate to `/admin/prompts`
2. Click "Create New Prompt"
3. Fill in the form:
   - **Title**: Short preview text
   - **Prompt**: Full prompt text
   - **Category**: Optional grouping
   - **Order**: Display priority (lower = higher)
4. Toggle active/inactive status
5. Drag to reorder prompts

## Deployment

### Environment Setup

1. **Vercel Projects**: Create separate projects for staging and production
2. **Databases**: Set up separate PostgreSQL databases
3. **Environment Variables**: Configure in Vercel dashboard

### GitHub Secrets

Add these secrets to your GitHub repository:

```
VERCEL_ORG_ID
VERCEL_PROJECT_ID_STAGING
VERCEL_PROJECT_ID_PROD
VERCEL_TOKEN
POSTGRES_URL_STAGING
POSTGRES_URL_PROD
SLACK_WEBHOOK_URL (optional)
```

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Staging**: Merge to `staging` branch → Auto-deploy
3. **Production**: Merge to `main` branch → Deploy with approval

### Database Migrations

#### Staging
```bash
# Generate migration
pnpm db:generate

# Apply to staging
NODE_ENV=production VERCEL_ENV=preview pnpm db:migrate
```

#### Production

For production database updates, you have two options:

**Option 1: Manual Promotion from Staging**
```bash
# The promote script requires both database URLs to be set locally
# Add these to your .env.local (DO NOT commit):
# POSTGRES_URL_STAGING=your-staging-db-url
# POSTGRES_URL_PROD=your-production-db-url

pnpm db:promote
```

**Option 2: Direct Migration**
```bash
# Apply migrations directly in production
NODE_ENV=production VERCEL_ENV=production pnpm db:migrate
```

> Note: The promote-to-production script needs access to both staging and production databases simultaneously, so it requires separate environment variable names.

## Customization

### Changing AI Provider

Edit `lib/ai/providers.ts`:

```typescript
// Replace xAI with your provider
import { openai } from '@ai-sdk/openai';

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai('gpt-4-turbo'),
    // ...
  },
});
```

### Adding New Admin Features

1. Create new route in `app/(admin)/admin/`
2. Add navigation item in `admin-sidebar.tsx`
3. Implement role checks in middleware
4. Create API routes in `app/api/admin/`

### Styling

- Edit `app/globals.css` for global styles
- Modify theme in `tailwind.config.ts`
- Update shadcn components in `components/ui/`

## Scripts Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run linting
pnpm format           # Format code

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed initial data
pnpm db:promote       # Promote staging to production

# Testing
pnpm test             # Run Playwright tests
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL is running
   - Verify connection string format
   - Ensure database exists

2. **Admin access denied**
   - Run `pnpm db:seed` to create super admin
   - Check user role in database
   - Clear cookies and re-login

3. **Build failures**
   - Run `pnpm install` to update dependencies
   - Check for TypeScript errors
   - Verify environment variables

### Support

- Check existing issues in GitHub
- Review logs in Vercel dashboard
- Enable debug mode in development

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Auth Secret**: Use strong, unique secrets per environment
3. **Database Access**: Use connection pooling and SSL
4. **Admin Routes**: Protected by middleware and auth checks
5. **CORS**: Configure for your domains only

## Contributing

We welcome contributions! This boilerplate was created to save developers time, and we'd love your help making it even better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Ideas

- Additional admin panel features
- More authentication providers
- Analytics and monitoring integrations
- Internationalization support
- Additional AI provider integrations
- Performance optimizations
- Documentation improvements

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits focused and descriptive

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on top of the excellent [Chat SDK](https://chat-sdk.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [Next.js](https://nextjs.org) and [AI SDK](https://sdk.vercel.ai)