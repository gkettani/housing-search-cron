import logger from '../logger';
import type { Accommodation } from '../types';
import type { NotificationStrategy } from './strategy';

export interface NotificationService {
	addStrategy(strategy: NotificationStrategy): NotificationService;
	sendUpdateNotification(accommodations: Accommodation[]): Promise<void>;
}

export class CompositeNotificationService implements NotificationService {
	private strategies: NotificationStrategy[] = [];

	addStrategy(strategy: NotificationStrategy) {
		this.strategies.push(strategy);
		return this;
	}

	async sendUpdateNotification(accommodations: Accommodation[]): Promise<void> {
		// Filter enabled strategies
		const enabledStrategies = this.strategies.filter((strategy) =>
			strategy.isEnabled(),
		);

		// If no strategies are enabled, log a warning
		if (enabledStrategies.length === 0) {
			logger.warn('No notification channels are enabled');
			return;
		}

		// Send notifications in parallel
		const results = await Promise.all(
			enabledStrategies.map(
				async (strategy) => await strategy.sendNotification(accommodations),
			),
		);

		for (const result of results) {
			if (result.success) {
				logger.info('Notification sent successfully', {
					strategy: result.strategy,
				});
			} else {
				logger.error('Failed to send notification', new Error(result.error), {
					strategy: result.strategy,
				});
			}
		}
	}
}
