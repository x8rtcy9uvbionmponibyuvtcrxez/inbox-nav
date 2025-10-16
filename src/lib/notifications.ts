import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderData {
  id: string;
  productType: string;
  quantity: number;
  totalAmount: number;
  clerkUserId: string | null;
  createdAt: Date;
  businessName?: string | null;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  canceled_at?: number | null;
  cancel_reason?: string;
}

/**
 * Send notification to Slack webhook
 */
export async function sendSlackNotification(webhookUrl: string, payload: object) {
  if (!webhookUrl) {
    console.warn('[NOTIFICATION] Slack webhook URL not configured, skipping Slack notification');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('[NOTIFICATION] Slack notification sent successfully');
  } catch (error) {
    console.error('[NOTIFICATION] Failed to send Slack notification:', error);
  }
}

/**
 * Send email notification using Resend
 */
export async function sendEmailNotification(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[NOTIFICATION] Resend API key not configured, skipping email notification');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Inbox Navigator <notifications@inboxnavigator.com>',
      to: [to, 'kunal@inboxnavigator.com'],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log('[NOTIFICATION] Email notification sent successfully:', data?.id);
  } catch (error) {
    console.error('[NOTIFICATION] Failed to send email notification:', error);
  }
}

/**
 * Format order created notification for Slack
 */
export function formatOrderCreatedSlackNotification(order: OrderData, user: UserData) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/admin/orders/${order.id}`;

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🛒 New Order Created',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Order ID:*\n${order.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*Product Type:*\n${order.productType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Quantity:*\n${order.quantity} inboxes`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Amount:*\n$${totalAmount}`,
          },
          {
            type: 'mrkdwn',
            text: `*User Email:*\n${user.email}`,
          },
          {
            type: 'mrkdwn',
            text: `*Business Name:*\n${order.businessName || 'Not provided'}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Order',
            },
            url: adminUrl,
            style: 'primary',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Created: ${order.createdAt.toLocaleString()}`,
          },
        ],
      },
    ],
  };
}

/**
 * Format order created notification for email
 */
export function formatOrderCreatedEmailNotification(order: OrderData, user: UserData) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/admin/orders/${order.id}`;

  return {
    subject: `New Order: ${order.productType} - $${totalAmount}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .order-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #495057; }
            .detail-value { color: #212529; }
            .cta-button { display: inline-block; background: #007bff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 New Order Created</h1>
            </div>
            <div class="content">
              <p>A new order has been created in Inbox Navigator:</p>
              
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${order.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Product Type:</span>
                  <span class="detail-value">${order.productType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Quantity:</span>
                  <span class="detail-value">${order.quantity} inboxes</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">$${totalAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">User Email:</span>
                  <span class="detail-value">${user.email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Business Name:</span>
                  <span class="detail-value">${order.businessName || 'Not provided'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Created:</span>
                  <span class="detail-value">${order.createdAt.toLocaleString()}</span>
                </div>
              </div>

              <a href="${adminUrl}" class="cta-button">View Order in Admin Panel</a>
            </div>
            <div class="footer">
              <p>This is an automated notification from Inbox Navigator</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Format user signup notification for Slack
 */
export function formatUserSignupSlackNotification(user: UserData) {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '👤 New User Signup',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*User ID:*\n${user.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${user.email}`,
          },
          {
            type: 'mrkdwn',
            text: `*Name:*\n${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Signed up: ${new Date().toLocaleString()}`,
          },
        ],
      },
    ],
  };
}

/**
 * Format user signup notification for email
 */
export function formatUserSignupEmailNotification(user: UserData) {
  return {
    subject: `New User Signup: ${user.email}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New User Signup</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .user-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #495057; }
            .detail-value { color: #212529; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👤 New User Signup</h1>
            </div>
            <div class="content">
              <p>A new user has signed up for Inbox Navigator:</p>
              
              <div class="user-details">
                <div class="detail-row">
                  <span class="detail-label">User ID:</span>
                  <span class="detail-value">${user.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${user.email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Signed up:</span>
                  <span class="detail-value">${new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from Inbox Navigator</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Format subscription cancelled notification for Slack
 */
export function formatSubscriptionCancelledSlackNotification(order: OrderData, subscription: SubscriptionData, affectedCounts: { inboxes: number; domains: number }) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/admin/orders/${order.id}`;
  const cancelledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toLocaleString() : 'Unknown';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Subscription Cancelled',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Order ID:*\n${order.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*Product Type:*\n${order.productType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Subscription ID:*\n${subscription.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${subscription.status}`,
          },
          {
            type: 'mrkdwn',
            text: `*Affected Inboxes:*\n${affectedCounts.inboxes}`,
          },
          {
            type: 'mrkdwn',
            text: `*Affected Domains:*\n${affectedCounts.domains}`,
          },
          {
            type: 'mrkdwn',
            text: `*Cancelled At:*\n${cancelledAt}`,
          },
          {
            type: 'mrkdwn',
            text: `*Reason:*\n${subscription.cancel_reason || 'Not specified'}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Order',
            },
            url: adminUrl,
            style: 'danger',
          },
        ],
      },
    ],
  };
}

/**
 * Format subscription cancelled notification for email
 */
export function formatSubscriptionCancelledEmailNotification(order: OrderData, subscription: SubscriptionData, affectedCounts: { inboxes: number; domains: number }) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/admin/orders/${order.id}`;
  const cancelledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toLocaleString() : 'Unknown';

  return {
    subject: `Subscription Cancelled: ${order.productType} - Order ${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Cancelled</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .cancellation-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #495057; }
            .detail-value { color: #212529; }
            .cta-button { display: inline-block; background: #dc3545; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Subscription Cancelled</h1>
            </div>
            <div class="content">
              <p>A subscription has been cancelled in Inbox Navigator:</p>
              
              <div class="cancellation-details">
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${order.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Product Type:</span>
                  <span class="detail-value">${order.productType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Subscription ID:</span>
                  <span class="detail-value">${subscription.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${subscription.status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Affected Inboxes:</span>
                  <span class="detail-value">${affectedCounts.inboxes}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Affected Domains:</span>
                  <span class="detail-value">${affectedCounts.domains}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cancelled At:</span>
                  <span class="detail-value">${cancelledAt}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${subscription.cancel_reason || 'Not specified'}</span>
                </div>
              </div>

              <a href="${adminUrl}" class="cta-button">View Order in Admin Panel</a>
            </div>
            <div class="footer">
              <p>This is an automated notification from Inbox Navigator</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Send order created notifications
 */
export async function notifyOrderCreated(order: OrderData, user: UserData) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'team@inboxnavigator.com';
  
  // Send Slack notification
  const slackWebhook = process.env.SLACK_WEBHOOK_ORDERS;
  if (slackWebhook) {
    const slackPayload = formatOrderCreatedSlackNotification(order, user);
    await sendSlackNotification(slackWebhook, slackPayload);
  }

  // Send email notification
  const emailData = formatOrderCreatedEmailNotification(order, user);
  await sendEmailNotification(notificationEmail, emailData.subject, emailData.html);
}

/**
 * Send user signup notifications
 */
export async function notifyUserSignup(user: UserData) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'team@inboxnavigator.com';
  
  // Send Slack notification
  const slackWebhook = process.env.SLACK_WEBHOOK_SIGNUPS;
  if (slackWebhook) {
    const slackPayload = formatUserSignupSlackNotification(user);
    await sendSlackNotification(slackWebhook, slackPayload);
  }

  // Send email notification
  const emailData = formatUserSignupEmailNotification(user);
  await sendEmailNotification(notificationEmail, emailData.subject, emailData.html);
}

/**
 * Send subscription cancelled notifications
 */
export async function notifySubscriptionCancelled(order: OrderData, subscription: SubscriptionData, affectedCounts: { inboxes: number; domains: number }) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'team@inboxnavigator.com';
  
  // Send Slack notification
  const slackWebhook = process.env.SLACK_WEBHOOK_CANCELLATIONS;
  if (slackWebhook) {
    const slackPayload = formatSubscriptionCancelledSlackNotification(order, subscription, affectedCounts);
    await sendSlackNotification(slackWebhook, slackPayload);
  }

  // Send email notification
  const emailData = formatSubscriptionCancelledEmailNotification(order, subscription, affectedCounts);
  await sendEmailNotification(notificationEmail, emailData.subject, emailData.html);
}
