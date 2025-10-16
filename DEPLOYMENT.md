# Deployment Guide

This guide covers deploying the Inbox Navigator application to production.

## 🚀 Vercel Deployment (Recommended)

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import the `inbox-nav` repository

### 2. Environment Variables
Add these environment variables in Vercel dashboard:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true&connection_limit=1"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (for checkout)
STRIPE_PRICE_RESELLER_INBOX="price_..."
STRIPE_PRICE_EDU_INBOX="price_..."
STRIPE_PRICE_LEGACY_INBOX="price_..."
STRIPE_PRICE_PREWARMED_INBOX="price_..."
STRIPE_PRICE_AWS_INBOX="price_..."
STRIPE_PRICE_MICROSOFT_INBOX="price_..."

# Notifications
SLACK_WEBHOOK_ORDERS="https://hooks.slack.com/services/..."
SLACK_WEBHOOK_SIGNUPS="https://hooks.slack.com/services/..."
SLACK_WEBHOOK_CANCELLATIONS="https://hooks.slack.com/services/..."
RESEND_API_KEY="re_..."
NOTIFICATION_EMAIL="team@inboxnavigator.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
APP_URL="https://your-domain.vercel.app"  # Server-side URL for API routes
ADMIN_USER_IDS="user_123,user_456"
```

### 3. Database Setup
1. Create a Neon PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npx prisma db push`

### 4. Deploy
1. Vercel will automatically deploy on push to main
2. Check deployment logs for any issues
3. Test the application thoroughly

## 🔧 Production Checklist

### Environment Setup
- [ ] Production database configured
- [ ] Clerk production keys set
- [ ] Stripe production keys set
- [ ] Admin user IDs configured
- [ ] Webhook endpoints configured

### Security
- [ ] Environment variables secured
- [ ] Admin access properly configured
- [ ] HTTPS enabled
- [ ] CORS configured if needed

### Testing
- [ ] User registration/login works
- [ ] Payment processing works
- [ ] Admin dashboard accessible
- [ ] CSV upload functionality works
- [ ] Order fulfillment process works

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Verify `DATABASE_URL` format
2. **Authentication**: Check Clerk keys are production keys
3. **Payments**: Ensure Stripe keys are live keys
4. **Admin Access**: Verify admin user IDs are correct

### Debug Mode
Set `NODE_ENV=production` and check Vercel function logs.

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor function execution times
- Track error rates

### Database Monitoring
- Monitor database connections
- Set up alerts for high usage
- Regular backup verification

## 🔄 Updates

### Deploying Updates
1. Push changes to main branch
2. Vercel automatically deploys
3. Test in production environment
4. Monitor for any issues

### Database Migrations
```bash
# Run migrations
npx prisma db push

# Generate new client
npx prisma generate
```

---

**Ready to deploy! 🚀**
