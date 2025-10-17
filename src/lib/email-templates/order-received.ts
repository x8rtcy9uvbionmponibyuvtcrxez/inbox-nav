interface OrderData {
  id: string;
  productType: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date | string;
  businessName?: string | null;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function formatOrderReceivedEmail(order: OrderData, user: UserData) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/dashboard`;

  return {
    subject: `Order Received - ${order.productType} Inboxes`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Received</title>
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
            .next-steps { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>We've received your order and our team is already working on it. Here are the details:</p>
              
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
                  <span class="detail-label">Order Date:</span>
                  <span class="detail-value">${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div class="next-steps">
                <h3 style="margin-top: 0; color: #1976d2;">What happens next?</h3>
                <ul style="margin-bottom: 0;">
                  <li>Our team will review your order details</li>
                  <li>We'll set up your inboxes according to your specifications</li>
                  <li>You'll receive another email when your inboxes are ready</li>
                  <li>Estimated completion: 24-48 hours</li>
                </ul>
              </div>

              <a href="${dashboardUrl}" class="cta-button">View Order Status</a>
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
