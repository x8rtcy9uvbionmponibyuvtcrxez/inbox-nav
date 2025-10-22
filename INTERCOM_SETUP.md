# Intercom Integration Setup

This app includes a complete Intercom integration with Clerk authentication for customer support and chat functionality.

## Setup Instructions

### 1. Get Your Intercom App ID

1. Go to [Intercom Developer Hub](https://developers.intercom.com/)
2. Create a new app or select your existing app
3. Copy your App ID from the settings

### 2. Add Environment Variable

Add your Intercom App ID to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_INTERCOM_APP_ID=your_app_id_here
```

### 3. Deploy to Vercel

Make sure to add the environment variable in your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_INTERCOM_APP_ID` with your app ID

## Features Included

### Components

- **IntercomProvider**: Automatically initializes Intercom and syncs user data from Clerk
- **IntercomLauncher**: Floating launcher button (appears in bottom-right corner)
- **IntercomBooter**: Internal component that handles user data synchronization

### User Data Sync

The integration automatically syncs user data from Clerk:
- **User ID**: Clerk user ID
- **Email**: Primary email address
- **Name**: Full name or first name fallback
- **Created At**: Account creation timestamp
- **Custom Attributes**:
  - `clerkId`: Clerk user ID
  - `username`: Clerk username or first name
  - `firstName`: User's first name
  - `lastName`: User's last name

### Authentication Integration

- **Logged-in users**: Show real name and email in Intercom
- **Anonymous users**: Show random names (normal behavior)
- **Auto-sync**: User data updates when logging in/out
- **Loading states**: Waits for Clerk to finish loading before booting Intercom

## Usage Examples

### Basic Launcher Button
```tsx
import IntercomLauncher from '@/components/IntercomLauncher';

// Default floating button
<IntercomLauncher />

// Custom button
<IntercomLauncher>
  <button className="my-custom-button">
    Need Help?
  </button>
</IntercomLauncher>
```

### Using Intercom Hooks
```tsx
import { useIntercom } from 'react-use-intercom';

function MyComponent() {
  const { show, hide, showMessages, trackEvent } = useIntercom();

  const handleSupport = () => {
    trackEvent('support_requested', { page: 'dashboard' });
    show();
  };

  return <button onClick={handleSupport}>Get Support</button>;
}
```

### Track User Events
```tsx
import { useIntercom } from 'react-use-intercom';

function MyComponent() {
  const { trackEvent } = useIntercom();

  const handleInboxCreated = () => {
    trackEvent('inbox_created', { 
      type: 'google', 
      quantity: 5 
    });
  };

  return <button onClick={handleInboxCreated}>Create Inbox</button>;
}
```

## Customization

### Styling the Launcher
The default launcher appears in the header, but you can customize it:

```tsx
<IntercomLauncher className="my-custom-class">
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    Custom Support Button
  </button>
</IntercomLauncher>
```

### Hide Default Launcher
To hide Intercom's default launcher and use only custom buttons:

```tsx
// In IntercomProvider.tsx, change:
hide_default_launcher: true
```

## Testing

1. Make sure your environment variable is set
2. Sign in to your app
3. Look for the "Support" button in the header
4. Click it to open the Intercom widget
5. Test sending a message

## Troubleshooting

### Widget Not Appearing
- Check that `NEXT_PUBLIC_INTERCOM_APP_ID` is set correctly
- Verify the app ID is valid in Intercom dashboard
- Check browser console for errors

### User Data Not Syncing
- Ensure user is signed in with Clerk
- Check that user has email address
- Verify Intercom app settings allow user identification

### Styling Issues
- Intercom widget styles are controlled by Intercom dashboard
- Custom launcher styles can be modified in components
- Use browser dev tools to inspect and override styles if needed


