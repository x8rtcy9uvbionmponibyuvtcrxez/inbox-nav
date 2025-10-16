# Inbox Navigator

A complete inbox management system built with Next.js 15, featuring multi-step onboarding, Stripe payments, and admin dashboard for order fulfillment.

## 🚀 Features

### **Customer Features**
- **Multi-step Onboarding Form** - Collects business details, personas, and preferences
- **Stripe Payment Integration** - Secure subscription payments for inbox services
- **Product Selection** - Choose between Google, Prewarmed, or Microsoft inboxes
- **Domain Management** - Option to provide own domains or have them purchased
- **Dashboard** - View orders, inboxes, and domains

### **Admin Features**
- **Order Management** - View and manage all customer orders
- **CSV Upload System** - Bulk upload passwords and create inboxes
- **Order Fulfillment** - Mark orders as fulfilled with proper timestamps
- **Admin Authentication** - Secure admin-only access controls

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Stripe account for payments

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd inbox-nav
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true&connection_limit=1"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_USER_IDS="user_123,user_456"  # Clerk user IDs for admin access
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard
│   │   ├── orders/           # Order management
│   │   └── layout.tsx        # Admin layout with auth
│   ├── api/                  # API routes
│   │   ├── checkout/         # Stripe checkout
│   │   └── get-session/      # Session retrieval
│   ├── dashboard/            # Customer dashboard
│   │   ├── inboxes/          # Inbox management
│   │   ├── domains/          # Domain management
│   │   └── products/         # Product selection
│   ├── onboarding/           # Multi-step form
│   │   ├── components/       # Form components
│   │   └── actions.ts        # Server actions
│   └── layout.tsx            # Root layout
├── components/               # Reusable components
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Database client
│   ├── stripe.ts           # Stripe client
│   ├── email-variations.ts # Email generation
│   └── inbox-distribution.ts # Inbox allocation logic
└── middleware.ts            # Clerk middleware
```

## 🔧 Configuration

### Stripe Setup
1. Create products and prices in Stripe Dashboard
2. Update price IDs in `src/app/dashboard/products/page.tsx`
3. Set up webhooks for payment confirmation

### Admin Access
1. Get Clerk user IDs from Clerk Dashboard
2. Add them to `ADMIN_USER_IDS` environment variable
3. Admins can access `/admin/orders` for order management

## 📊 Database Schema

### Key Models
- **Order** - Customer orders with Stripe integration
- **OnboardingData** - Customer onboarding information
- **Inbox** - Individual email inboxes
- **Domain** - Email domains

### Relationships
- Order → OnboardingData (one-to-many)
- Order → Inbox (one-to-many)
- Order → Domain (one-to-many)

## 🎯 Usage

### Customer Flow
1. **Product Selection** - Choose inbox type and quantity
2. **Payment** - Complete Stripe checkout
3. **Onboarding** - Fill out business details and preferences
4. **Dashboard** - View order status and inboxes

### Admin Flow
1. **Order Review** - View all customer orders
2. **CSV Upload** - Upload passwords or create inboxes
3. **Fulfillment** - Mark orders as fulfilled
4. **Monitoring** - Track fulfillment timestamps

## 📝 CSV Upload Formats

### Own Domains (Password Upload)
```csv
email,password
john.doe@example1.com,SecurePass123
jane.smith@example1.com,MyPassword456
```

### Buy For Me (Bulk Creation)
```csv
domain,email,personaName,password
example1.com,john.doe@example1.com,John Doe,SecurePass123
example2.com,jane.smith@example2.com,Jane Smith,MyPassword456
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy to your preferred platform
3. Ensure environment variables are set

## 🔒 Security

- **Authentication**: Clerk handles user authentication
- **Authorization**: Admin access controlled by environment variables
- **Data Validation**: Server-side validation for all inputs
- **CSRF Protection**: Next.js built-in CSRF protection
- **Environment Variables**: Sensitive data stored securely

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check `DATABASE_URL` format
2. **Clerk Authentication**: Verify publishable and secret keys
3. **Stripe Payments**: Ensure webhook endpoints are configured
4. **Admin Access**: Verify `ADMIN_USER_IDS` contains valid Clerk user IDs

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check console logs.

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**# Force deployment Thu Oct 16 20:56:00 IST 2025
