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

export function formatOrderFulfilledEmail(order: OrderData, user: UserData, inboxCount: number) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/dashboard/inboxes`;

  return {
    subject: `🎉 Your ${inboxCount} Inboxes Are Ready!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inboxes Ready</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .success-box h3 { margin-top: 0; color: #155724; }
            .order-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #495057; }
            .detail-value { color: #212529; }
            .cta-button { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .credentials-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .credentials-box h4 { margin-top: 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Inboxes Are Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              
              <div class="success-box">
                <h3>✅ Order Fulfilled Successfully</h3>
                <p>Your ${inboxCount} inboxes have been created and are now ready to use. You can access them through your dashboard.</p>
              </div>

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
                  <span class="detail-label">Inboxes Created:</span>
                  <span class="detail-value">${inboxCount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">$${totalAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fulfilled:</span>
                  <span class="detail-value">${new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div class="credentials-box">
                <h4>🔑 Access Your Inboxes</h4>
                <p>All inbox credentials and details are available in your dashboard. You can:</p>
                <ul>
                  <li>View all inbox email addresses and passwords</li>
                  <li>Download credentials as CSV</li>
                  <li>Manage inbox settings and tags</li>
                  <li>Track inbox status and performance</li>
                </ul>
              </div>

              <a href="${dashboardUrl}" class="cta-button">Access Your Inboxes</a>
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
