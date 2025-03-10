import type { Accommodation } from '../types';

export interface NotificationStrategy {
	// Unique identifier for the notification channel
	strategy: string;

	// Check if the strategy can send notifications
	isEnabled(): boolean;

	// Send notification about link updates
	sendNotification(
		accommodations: Accommodation[],
	): Promise<NotificationResult>;
}

// Common Result Type
export interface NotificationResult {
	success: boolean;
	strategy: string;
	error?: string;
}
