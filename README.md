# BuildLedger

A comprehensive construction project management platform built with modern React technologies, featuring client management, project tracking, invoicing, and integrated SMS messaging.

## 🚀 Features

### Construction Management
- **Project Management** - Complete project lifecycle tracking
- **Client Management** - Client profiles with communication history
- **Quote & Invoice System** - Professional quote and invoice generation
- **Item Database** - Reusable construction items with pricing
- **Analytics Dashboard** - Revenue tracking and project analytics

### Technology Stack
- **React 19** - Latest React with concurrent features
- **Vite 7** - Lightning-fast build tool and development server
- **Supabase** - Backend-as-a-Service with real-time database
- **Tailwind CSS 3** - Utility-first CSS framework
- **Stripe Integration** - Payment processing and subscriptions
- **Twilio SMS** - Client messaging and notifications
- **Barcode Scanning** - Mobile inventory management with ZXing

## 📋 Prerequisites

- Node.js (v18.x or higher)
- npm or yarn
- Supabase account (for database)
- Stripe account (for payments)
- Twilio account (for SMS messaging)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/buildledger.git
   cd buildledger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp config/.env.example .env.local
   # Edit .env.local with your API keys
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 🔧 Configuration

See the complete setup guides in the [`docs/`](./docs/) directory:
- **[Messaging Setup](./docs/MESSAGING_SETUP.md)** - Twilio SMS configuration
- **[Stripe Setup](./docs/STRIPE_SETUP.md)** - Payment processing setup
- **[Database Setup](./docs/DATABASE_RESET_SUMMARY.md)** - Supabase database configuration

## 📁 Project Structure

```
buildledger/
├── docs/                    # 📚 All documentation files
├── scripts/                 # 🔧 Utility scripts for development
├── deployment/              # 🚀 Deployment configurations
├── config/                  # ⚙️ Configuration files
├── src/                     # 💻 Main application code
│   ├── components/          # 🧩 Reusable UI components
│   │   ├── messaging/       # 💬 SMS messaging components
│   │   ├── barcode/         # 📱 Barcode scanning
│   │   ├── payment/         # 💳 Stripe integration
│   │   └── ui/              # 🎨 Base UI components
│   ├── pages/               # 📄 Page components
│   │   ├── clients/         # 👥 Client management
│   │   ├── projects/        # 🏗️ Project management
│   │   ├── invoices/        # 💰 Invoice system
│   │   └── analytics/       # 📊 Analytics dashboard
│   ├── services/            # 🔗 API service layers
│   ├── hooks/               # 🪝 Custom React hooks
│   └── utils/               # 🛠️ Utility functions
├── supabase/                # 🗄️ Database configuration
│   ├── migrations/          # Database schema changes
│   └── functions/           # Edge functions (Twilio SMS)
├── server/                  # 🖥️ Express server (if needed)
└── public/                  # 📁 Static assets
```

## 🧪 Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run deploy:correct` - Deploy to Vercel

### Directory Organization
The project is organized into focused directories:
- **`docs/`** - All documentation and setup guides
- **`scripts/`** - Database management and utility scripts  
- **`deployment/`** - Platform-specific deployment configs
- **`config/`** - Build and development configuration files

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

The application supports multiple deployment platforms:

### Vercel (Recommended)
```bash
npm run deploy:correct
```

### Railway
```bash
git push railway main
```

### Docker
```bash
docker build -t buildledger .
docker run -p 3000:3000 buildledger
```

See [`deployment/README.md`](./deployment/README.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Update documentation if needed
5. Submit a pull request

## 📞 Support

- **Documentation**: Check the [`docs/`](./docs/) directory
- **Issues**: Report bugs via GitHub Issues
- **Setup Help**: Follow setup guides in documentation

## 🙏 Acknowledgments

- **Backend**: Powered by Supabase
- **Payments**: Stripe integration
- **SMS**: Twilio messaging
- **Hosting**: Vercel deployment
- **Framework**: React + Vite + Tailwind CSS

Built with ❤️ for the construction industry
