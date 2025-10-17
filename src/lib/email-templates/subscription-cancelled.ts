interface OrderData {
  id: string;
  productType: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date | string;
  businessName?: string | null;
  cancelledAt?: Date | string | null;
  cancellationReason?: string | null;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function formatSubscriptionCancelledEmail(order: OrderData, user: UserData) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/dashboard`;
  const finalBillingDate = order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : 'End of current period';

  return {
    subject: `Subscription Cancelled - Order ${order.id}`,
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
            .important-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .important-box h4 { margin-top: 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Subscription Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>Your subscription has been successfully cancelled. Here are the details:</p>
              
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
                  <span class="detail-label">Cancellation Date:</span>
                  <span class="detail-value">${new Date().toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Final Billing Date:</span>
                  <span class="detail-value">${finalBillingDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${order.cancellationReason || 'Not specified'}</span>
                </div>
              </div>

              <div class="important-box">
                <h4>⚠️ Important Information</h4>
                <ul style="margin-bottom: 0;">
                  <li>Your inboxes will remain active until ${finalBillingDate}</li>
                  <li>You can continue using your inboxes until the end of your billing period</li>
                  <li>All data will be permanently deleted after the final billing date</li>
                  <li>You can reactivate your subscription anytime before the final date</li>
                </ul>
              </div>

              <a href="${dashboardUrl}" class="cta-button">View Dashboard</a>
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
