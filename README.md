# BuildLedger 🏗️

**Contractor Financial Command Center**

A modern web application built for contractors to manage quotes, invoices, and client relationships. Built with Next.js 15, React 19, TypeScript, and Supabase.

## ✨ Features

- 🔐 **Secure Authentication** - Supabase Auth with email/password
- 📊 **Advanced Dashboard** - Real-time revenue metrics, charts, and client insights
- 📝 **Quote Management** - Create, edit, and track project quotes
- 🧾 **Invoice Generation** - Convert quotes to invoices seamlessly
- 📧 **Email Integration** - Send invoices directly to clients with PDF attachments
- 📈 **Data Visualization** - Interactive charts for invoice status and revenue tracking
- 👥 **Client Management** - Organize customer information with payment history
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Row Level Security** - Multi-tenant secure data access

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- A Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd buildledger
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your credentials
3. Run the SQL from `database_schema.sql` in your Supabase SQL Editor

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

See `ENVIRONMENT_SETUP.md` for detailed instructions.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Email**: EmailJS (transactional emails, no domain verification)
- **PDF**: React-PDF (invoice generation)
- **Charts**: Recharts (data visualization)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── quotes/             # Quote management
│   ├── invoices/           # Invoice management
│   └── login/              # Authentication
├── components/             # Reusable React components
│   ├── AuthProvider.tsx    # Authentication context
│   ├── Navigation.tsx      # App navigation
│   ├── LoadingSpinner.tsx  # Loading states
│   └── ErrorBoundary.tsx   # Error handling
└── lib/
    ├── types.ts            # TypeScript interfaces
    └── supabaseClient.ts   # Supabase configuration
```

## 🗄️ Database Schema

The application uses the following main tables:

- **clients** - Customer information
- **quotes** - Project quotes and estimates
- **quote_items** - Line items for quotes
- **invoices** - Generated invoices
- **invoice_items** - Line items for invoices

## 📊 Dashboard Features

The BuildLedger dashboard provides comprehensive business insights:

### Key Metrics
- **Revenue This Month** - Track current month's income
- **Invoice Status** - Visual breakdown of paid vs unpaid invoices
- **Payment Tracking** - Monitor total paid and outstanding amounts
- **Client Analytics** - View client payment history and patterns

### Dashboard Components
1. **Revenue Cards** - Quick view of financial metrics
2. **Invoice Pie Chart** - Visual representation of invoice statuses
3. **Recent Invoices Table** - Latest invoices with client and due date info
4. **Client History Table** - Comprehensive view of all clients with:
   - Total invoices per client
   - Total paid amounts
   - Outstanding balances
   - Last invoice date

### Technologies Used
- **Recharts** - For interactive data visualization
- **Supabase Queries** - Optimized parallel data fetching
- **Responsive Design** - Mobile-friendly tables and charts

## 📧 Email Integration

BuildLedger includes email functionality for sending invoices directly to clients:

### Features
- **Professional Templates** - Clean, branded email templates with dynamic content
- **Template Variables** - Invoice number, total, due date automatically populated
- **Status Tracking** - Invoice status automatically updates to 'sent'
- **Client Validation** - Ensures client has email address before sending

### Setup
1. Sign up for a free [EmailJS](https://www.emailjs.com) account
2. Add an email service (Gmail, Outlook, etc.)
3. Create an email template (see `EMAILJS_TEMPLATE_EXAMPLE.md`)
4. Add these to your `.env.local` file:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key`

### Usage
- Navigate to any invoice detail page
- Click the "📧 Send to Client" button
- The system will validate the client has an email address
- Invoice details are sent via email with professional template
- Invoice status updates from 'draft' to 'sent'

## 🔧 Development

### Code Quality

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Key Improvements Made

✅ **Fixed TypeScript Issues** - Replaced `any` types with proper interfaces  
✅ **Added Error Handling** - Comprehensive error boundaries and validation  
✅ **Improved Navigation** - Consistent header with responsive design  
✅ **Enhanced Dashboard** - Business metrics and quick actions  
✅ **Better Loading States** - Spinner components and user feedback  
✅ **Database Schema** - Complete SQL setup with Row Level Security  
✅ **Documentation** - Setup guides and environment configuration  

## 📝 Usage

1. **Sign up** or **sign in** with your email
2. **Create clients** in your customer database
3. **Generate quotes** for project estimates
4. **Convert quotes to invoices** when accepted
5. **Track your business metrics** on the dashboard

## 🔒 Security

- Row Level Security (RLS) ensures data isolation
- All database queries filtered by authenticated user
- HTTPS enforced in production
- Environment variables for sensitive configuration

## 📈 Roadmap

- [ ] PDF export for quotes and invoices
- [ ] Email integration for sending documents
- [ ] Payment tracking and integration
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the `ENVIRONMENT_SETUP.md` for configuration help
2. Ensure your Supabase database schema is set up correctly
3. Verify environment variables are configured
4. Check the browser console for error messages

---

**Built with ❤️ for contractors who deserve better financial tools.**
