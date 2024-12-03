import type { NotificationStrategy, NotificationResult } from "./strategy";
import type { Accommodation } from "../types";

export class DiscordNotificationStrategy implements NotificationStrategy {
	channelId = 'discord';

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
	// 				content: `🔍 Update detected for ${link.url}`,
	// 				embeds: [
	// 					{
	// 						title: 'Link Update',
	// 						description: `Source: ${link.meta.residence_name}`,
	// 						fields: Object.entries(changes).map(([key, value]) => ({
	// 							name: key,
	// 							value: JSON.stringify(value),
	// 							inline: false,
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
