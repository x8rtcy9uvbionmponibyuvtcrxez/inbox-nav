# UI Copy Inventory

## Dashboard – Products (`/dashboard/products`)

- **Status chip** – “Plans”
- **Hero heading** – “Pick the inbox runway that matches your outreach ambitions.”
- **Hero body** – “Every fleet ships with warming, deliverability monitoring, and human support. Scale campaigns with confidence—whether you need a handful of senders or an entire squadron.”
- **Hero bullets** – “⚡ Instant provisioning”, “• Reputation-safe warmup”, “• Concierge support included”
- **Support card heading** – “Need a custom fleet?”
- **Support card body** – “Talk to us about tiered enterprise pricing and dedicated deliverability ops.”
- **Support card CTA** – “Book a Call”
- **Tab labels** – “Google”, “Microsoft”, “Prewarmed”, “SMTP”
- **Product titles** – “Edu Inboxes”, “Legacy Inboxes”, “Reseller Inboxes”, “Prewarmed Inboxes”, “AWS Inboxes”, “Microsoft Inboxes”
- **Feature bullets** – e.g. “Academic pricing”, “Legacy support”, “Basic warmup”, “Already warmed”, “Cloud infrastructure”, “Enterprise security”
- **Card labels** – “Starting at”, “Inbox volume”, “Total monthly”
- **Primary CTA** – “Launch this fleet”
- **Error CTA** – “Dismiss”
- **Enterprise banner** – “Scaling beyond 500 inboxes? We’ll layer in custom deliverability ops, pool management, and dedicated IP reputation monitoring.”
- **Enterprise banner link** – “Reach out for enterprise pricing →”

## Checkout – Configure (`/checkout/configure`)

- **Tag** – “Configuration”
- **Heading** – “Configure your {product} order”
- **Summary line** – “{quantity} {product} inboxes @ $X = $Y • Domains …”
- **Back link** – “← Back to products”
- **Error alert** – `{error message}`
- **Section headings** – “Inboxes per domain”, “Domain options”
- **Helpers** – “Balance ramp speed…”, “Decide if we should procure…”
- **Domain badge** – “≈ {domainsNeeded} domains needed”
- **Radio labels** – “Purchase domains for me”, “I have my own domains (no additional cost)”
- **TLD options** – “.com ($12.00 each) …”, “.info ($4.00 each) …”
- **Domain helper** – “We’ll purchase {domainsNeeded} {domainTLD} domains…”
- **OWN helper** – “You’ll provide your domain list…”
- **Footer buttons** – “← Back to products”, “Continue to checkout →” / “Processing…”

## Onboarding (`/onboarding`)

### Global/Header
- “Launch your inbox fleet”
- “We’ll use these details to provision inboxes…”
- “Step {n} of {total}”
- “Current focus: {step}”
- Step titles/captions:
  - Workspace Basics – “Context about your brand…”
  - Registrar Access – “Grant registrar access…”
  - Personas & Tone – “Define the humans behind the inboxes…”
  - Warmup & Tools – “Securely hand off ESP credentials…”
  - Review & Confirm – “Tag your fleet…”
- Footer buttons – “Back”, “Continue to {step}”, “Review & confirm”, “Complete Order”
- Footer helper – “Progress auto-saves to this browser.”
- Error block – “We couldn’t complete this step.”, “Start a new checkout”, “Dismiss”

### Step 1 – Workspace Basics
- “Workspace basics”
- “We’ll use this to configure forwarding…”
- Plan card – “Checkout locked” / “Selected plan”, “Need to change quantity or product? Visit Dashboard → Products…”
- Field labels & helpers:
  - “Monthly inbox volume” / “We recommend at least 10…”
  - “Business or sender name” / “Appears in signatures…”
  - “Primary forwarding URL” / “Tell us where replies should land…”
  - “Domains we should use” / “One per line…”
  - “Registrar” (+ custom “Registrar name”, “Registrar username”, “Registrar password”)
  - BUY_FOR_ME helper – “Where should inboxes route once live…”
- Callout – “Please invite team@inboxnavigator.com…”
- Locked state note – “Domain configuration is locked from checkout…”
- Counts – “{n} domain(s) listed”

### Step 2 – Registrar Access
- “Registrar access”
- “Share registrar credentials so our onboarding engineers…”
- Field labels – “Registrar”, “Registrar name”, “Registrar username”, “Registrar password”
- Helper – “We store this securely and purge it after provisioning.”

### Step 3 – Personas & Tone
- “Personas & tone”
- “Share who is sending email…”
- “How many personas do you need?”
- Persona cards – “Persona {n}”, “First name”, “Last name”, “Profile image (optional)”
- Image helper – “Square images (200×200) work best…”

### Step 4 – Warmup & Tools
- “Connect your warmup tool”
- “We’ll plug directly into your sending or warmup provider…”
- Fields – “Warmup tool”, “Tool name”, “Account ID”, “Password”, “API key (optional)”, “Notes for our team (optional)”, etc.

### Step 5 – Review & Confirm
- “Review & confirm”
- “Double-check your launch details…”
- Summary labels – “Product”, “Inboxes”, “Forwarding URL”, “Personas”, “Persona names”, “Warmup tool”, “Account ID”, “Internal tags”, “ESP tags”
- Special note – “Special instructions:”
- CTA – “Complete Order”

## Dashboard (`/dashboard`)

- Auth guard – “Please sign in to view your dashboard.”
- Loading hero – “Welcome back, {displayName}”, “Here’s what’s happening with your inbox fleet”
- Empty state – “Welcome to Inbox Navigator”, “You don’t have any active orders yet…”
- Empty CTAs – “Create inboxes”, “Talk to support”
- Hero welcome – “Welcome to Inbox Nav — we’re excited to have you here!” / “Welcome back, {displayName}.”
- Hero headline – “Let’s launch your inbox fleet.” / “Your mission control for every inbox.”
- Hero body – “Track fulfillment in real time…”
- Hero CTAs – “Create Inboxes”, “Talk to Support”
- Stat cards – “Total inboxes live”, “Domains under management”, “Monthly subscription”
- Sync warning – “We had trouble syncing the latest data…”
- Orders section – “Order History”, “Your most recent onboarding submissions and fulfillment progress.”
- Table headers – “Forwarding URL”, “Business”, “Product”, “Inboxes”, “Total”, “Submitted”, “Status”, “Actions”
- Table badge text – dynamic: “Fulfilled”, “Pending”, “Cancelled”, etc.
- Table action – “View details”

## Admin Layout / Orders

- 403 screen – “403 - Admins Only”, “You do not have access to the admin dashboard.”, “Back to dashboard”
- Admin shell – “Admin Dashboard”, nav links “Orders”, “User dashboard”
- Orders header – “Control center”, “Admin orders dashboard”, header body copy, search “Search” / “Go”
- Metric cards – “Total orders”, “Pending review”, “Fulfilled orders”, “Assets under mgmt”
- Status filters – `ALL`, `PENDING`, `PENDING_DOMAIN_PURCHASE`, `PAID`, `FULFILLED`, `CANCELLED`
- Table messages – same as dashboard; empty state “No orders found for this filter…”
- Table action – “View”

## Root / Auth

- Root sign-in guard – `SignIn` component (no custom copy)
- `/sign-in` page – Clerk widget only (no extra copy)

