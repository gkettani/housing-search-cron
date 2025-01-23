import type { Accommodation } from "../types";
import type { NotificationResult, NotificationStrategy } from "./strategy";

export class DiscordNotificationStrategy implements NotificationStrategy {
	strategy = 'discord';

	constructor(private webhookUrl: string, private enabled = true) {}

	isEnabled(): boolean {
		return this.enabled && !!this.webhookUrl;
	}

	async sendNotification(accommodations: Accommodation[]): Promise<NotificationResult> {
		return Promise.resolve({
			success: true,
			strategy: this.strategy,
		});
	}

}
