import { Resend } from 'resend';
import type { Accommodation, Link } from '../types';
import type { NotificationResult, NotificationStrategy } from './strategy';

export class EmailNotificationStrategy implements NotificationStrategy {
	strategy = 'email';

	constructor(
		private env: {
			EMAIL_FROM: string;
			EMAIL_TO: string;
			RESEND_API_KEY?: string;
		},
		private enabled = true,
	) {}

	isEnabled(): boolean {
		// Check if required email configuration is present
		return (
			this.enabled &&
			!!this.env.EMAIL_FROM &&
			!!this.env.EMAIL_TO &&
			!!this.env.RESEND_API_KEY
		);
	}

	async sendNotification(
		accommodations: Accommodation[],
	): Promise<NotificationResult> {
		try {
			const resend = new Resend(this.env.RESEND_API_KEY);
			await resend.emails.send({
				from: `Housing <${this.env.EMAIL_FROM}>`,
				to: [this.env.EMAIL_TO],
				subject: '🔍 Housing search cron changes',
				html: this.createEmailHTML(accommodations),
			});
			return {
				success: true,
				strategy: this.strategy,
			};
		} catch (error) {
			return {
				success: false,
				strategy: this.strategy,
				error:
					error instanceof Error
						? error.message
						: 'Unknown email sending error',
			};
		}
	}

	// Create a formatted HTML email
	private createEmailHTML(accommodations: Accommodation[]): string {
		// Generate a detailed, readable HTML email
		const changesHTML = accommodations
			.map(
				(accommodation) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Residence Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${accommodation.residence_name}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${accommodation.type}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Rent</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${accommodation.rent}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Surface</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${accommodation.surface}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Availability</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${accommodation.availability}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>URL</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${accommodation.url}">${accommodation.url}</a></td>
          </tr>
        `,
			)
			.join('');

		return `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Accommodation Updates</h2>
            <p>The following accommodations have been updated:</p>
            
            <h3>Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ddd; padding: 8px;">Key</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">Value</th>
                </tr>
              </thead>
              <tbody>
                ${changesHTML}
              </tbody>
            </table>
            
            <p style="margin-top: 20px; font-size: 0.8em; color: #666;">
              Sent at: ${new Date().toISOString()}
            </p>
          </body>
        </html>
      `;
	}
}
