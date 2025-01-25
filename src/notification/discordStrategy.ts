import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import type { Accommodation } from '../types';
import type { NotificationResult, NotificationStrategy } from './strategy';

export class DiscordNotificationStrategy implements NotificationStrategy {
	strategy = 'discord';
	private static MAX_MESSAGE_LENGTH = 2000;

	constructor(
		private token: string,
		private channelId: string,
		private enabled = true,
	) { }

	isEnabled(): boolean {
		return this.enabled && !!this.token && !!this.channelId;
	}

	async sendNotification(
		accommodations: Accommodation[],
	): Promise<NotificationResult> {
		try {
			const rest = new REST({ version: '10' }).setToken(this.token);
			const messages = this.chunkMessages(
				this.formatAccommodationsForDiscord(accommodations)
			);

			for (const message of messages) {
				await rest.post(Routes.channelMessages(this.channelId), {
					body: { content: message },
				});
			}

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
						: 'Unknown discord sending error',
			};
		}
	}

	formatAccommodationsForDiscord(accommodations: Accommodation[]): string {
		if (accommodations.length === 0) {
			return 'No accommodations available at the moment.';
		}

		const formattedList = accommodations.map((acc) => {
			return `**${acc.residence_name}**  

🏠 Type: ${acc.type}
💵 Rent: $${acc.rent}
📐 Surface: ${acc.surface}
📅 Availability: ${acc.availability}
🔗 [More details](${acc.url})`;
		});

		return `**Available Accommodations: @everyone**\n\n${formattedList.join('\n\n')}`;
	}

	private chunkMessages(content: string): string[] {
		const messages: string[] = [];

		// If the entire content is already within the limit, return it as-is
		if (content.length <= DiscordNotificationStrategy.MAX_MESSAGE_LENGTH) {
			return [content];
		}

		// Split content into chunks
		let remainingContent = content;
		while (remainingContent.length > 0) {
			let chunk = remainingContent.slice(0, DiscordNotificationStrategy.MAX_MESSAGE_LENGTH);

			// Try to split at a newline to avoid cutting words mid-sentence
			const lastNewlineIndex = chunk.lastIndexOf('\n');
			if (lastNewlineIndex !== -1) {
				chunk = chunk.slice(0, lastNewlineIndex);
			}

			messages.push(chunk);
			remainingContent = remainingContent.slice(chunk.length).trimStart();
		}

		return messages;
	}
}