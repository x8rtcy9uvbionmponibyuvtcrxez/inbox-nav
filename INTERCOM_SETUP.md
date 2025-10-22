# Intercom Integration Setup

This app includes a complete Intercom integration for customer support and chat functionality.

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

- **IntercomProvider**: Automatically initializes Intercom and syncs user data
- **IntercomLauncher**: Custom launcher button (appears in header for signed-in users)
- **IntercomHelpButton**: Reusable help button component

### Hooks

- **useIntercom**: Custom hook with all Intercom methods:
  - `show()` - Show the Intercom widget
  - `hide()` - Hide the Intercom widget
  - `showMessages()` - Show messages
  - `showNewMessage(message?)` - Show new message form
  - `update(data)` - Update user data
  - `trackEvent(name, metadata)` - Track custom events
  - `showArticle(id)` - Show specific article
  - `showSpace(space)` - Show specific space

### User Data Sync

The integration automatically syncs user data from Clerk:
- User ID
- Email address
- Full name
- Account creation date

## Usage Examples

### Basic Help Button
```tsx
import IntercomHelpButton from '@/components/IntercomHelpButton';

<IntercomHelpButton variant="primary" size="md">
  Need Help?
</IntercomHelpButton>
```

### Custom Intercom Actions
```tsx
import { useIntercom } from '@/hooks/useIntercom';

function MyComponent() {
  const { showNewMessage, trackEvent } = useIntercom();

  const handleSupport = () => {
    trackEvent('support_requested', { page: 'dashboard' });
    showNewMessage('I need help with my inbox setup');
  };

  return <button onClick={handleSupport}>Get Support</button>;
}
```

### Track User Events
```tsx
const { trackEvent } = useIntercom();

// Track when user creates an inbox
trackEvent('inbox_created', { 
  type: 'google', 
  quantity: 5 
});

// Track feature usage
trackEvent('feature_used', { 
  feature: 'bulk_import',
  success: true 
});
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


