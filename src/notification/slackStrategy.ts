import type { NotificationResult, NotificationStrategy } from './strategy';
import type { Accommodation } from '../types';

export class SlackNotificationStrategy implements NotificationStrategy {
	channelId = 'slack';

	constructor(private webhookUrl: string, private enabled = true) {}

	isEnabled(): boolean {
		return this.enabled && !!this.webhookUrl;
	}

	// TODO
	async sendNotification(accommodations: Accommodation[]): Promise<NotificationResult> {
		return Promise.resolve({
			success: true,
			channelId: this.channelId,
		});
	}

	// async sendNotification(link: Link, changes: Record<string, any>): Promise<NotificationResult> {
	// 	try {
	// 		const response = await fetch(this.webhookUrl, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 			body: JSON.stringify({
	// 				blocks: [
	// 					{
	// 						type: 'section',
	// 						text: {
	// 							type: 'mrkdwn',
	// 							text: `*Update Detected* for <${link.url}|Link>`,
	// 						},
	// 					},
	// 					{
	// 						type: 'section',
	// 						fields: Object.entries(changes).map(([key, value]) => ({
	// 							type: 'mrkdwn',
	// 							text: `*${key}*: \`${JSON.stringify(value)}\``,
	// 						})),
	// 					},
	// 				],
	// 			}),
	// 		});

	// 		return {
	// 			success: response.ok,
	// 			channelId: this.channelId,
	// 			error: !response.ok ? await response.text() : undefined,
	// 		};
	// 	} catch (error) {
	// 		return {
	// 			success: false,
	// 			channelId: this.channelId,
	// 			error: error instanceof Error ? error.message : 'Unknown error',
	// 		};
	// 	}
	// }
}
