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

export function formatPartialCancellationEmail(order: OrderData, user: UserData, cancelledInboxes: string[], remainingCount: number, newMonthlyCost: number) {
  const totalAmount = (order.totalAmount / 100).toFixed(2);
  const newCostFormatted = (newMonthlyCost / 100).toFixed(2);
  const savings = ((order.totalAmount - newMonthlyCost) / 100).toFixed(2);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com'}/dashboard/inboxes`;

  return {
    subject: `Partial Cancellation Confirmed - ${cancelledInboxes.length} Inboxes Cancelled`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Partial Cancellation Confirmed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .cancellation-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #495057; }
            .detail-value { color: #212529; }
            .cta-button { display: inline-block; background: #ff9800; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .inbox-list { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .inbox-list h4 { margin-top: 0; color: #856404; }
            .inbox-item { font-family: monospace; font-size: 14px; margin: 5px 0; }
            .savings-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .savings-box h4 { margin-top: 0; color: #155724; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📉 Partial Cancellation Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>Your partial cancellation has been processed successfully. Here are the details:</p>
              
              <div class="cancellation-details">
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${order.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Inboxes Cancelled:</span>
                  <span class="detail-value">${cancelledInboxes.length}</span>
                </div>
                <div class="detail-label">Remaining Active:</span>
                  <span class="detail-value">${remainingCount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">New Monthly Cost:</span>
                  <span class="detail-value">$${newCostFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Monthly Savings:</span>
                  <span class="detail-value">$${savings}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Effective Date:</span>
                  <span class="detail-value">Next billing cycle</span>
                </div>
              </div>

              <div class="inbox-list">
                <h4>📧 Cancelled Inboxes:</h4>
                ${cancelledInboxes.map(email => `<div class="inbox-item">• ${email}</div>`).join('')}
              </div>

              <div class="savings-box">
                <h4>💰 Cost Breakdown</h4>
                <p><strong>Previous monthly cost:</strong> $${totalAmount}</p>
                <p><strong>New monthly cost:</strong> $${newCostFormatted}</p>
                <p><strong>Monthly savings:</strong> $${savings}</p>
                <p><em>Prorated credit will be applied to your next invoice.</em></p>
              </div>

              <a href="${dashboardUrl}" class="cta-button">Manage Your Inboxes</a>
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
