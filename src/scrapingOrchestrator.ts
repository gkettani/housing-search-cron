import type { Database } from './database';
import logger from './logger';
import type { CompositeNotificationService } from './notification';
import type { CompositeScraperService } from './scraper';
import type { Accommodation } from './types';

export class ScrapingOrchestrator {
	constructor(
		private db: Database,
		private scraperService: CompositeScraperService,
		private notificationService: CompositeNotificationService,
	) {}

	async run() {
		const linksToScrape = await this.db.fetchLinks();

		const newAccommodations = [];
		for (const link of linksToScrape) {
			const { data } = await this.scraperService.scrape(link);
			newAccommodations.push(...data.accommodations);
		}

		const previousAccommodations = await this.db.fetchAccommodations();

		const residenceNameToAccommodationTypeToAccommodation =
			buildAccommodationMap(previousAccommodations);

		const changes = determineAccommodationChanges(
			newAccommodations,
			residenceNameToAccommodationTypeToAccommodation,
		);

		if (changes.length > 0) {
			await this.db.updateAccommodations(changes);
			await this.notificationService.sendUpdateNotification(changes);
		}
	}
}

/** Builds a map of existing accommodations by residence name and type */
function buildAccommodationMap(
	accommodations: Accommodation[],
): Map<string, Map<string, Accommodation>> {
	const accommodationMap: Map<string, Map<string, Accommodation>> = new Map();
	for (const accommodation of accommodations) {
		if (!accommodationMap.has(accommodation.residence_name)) {
			accommodationMap.set(accommodation.residence_name, new Map());
		}
		accommodationMap
			.get(accommodation.residence_name)
			?.set(accommodation.type, accommodation);
	}
	return accommodationMap;
}

/** Determines changes between new and previous accommodations */
function determineAccommodationChanges(
	newAccommodations: Accommodation[],
	previousAccommodationsMap: Map<string, Map<string, Accommodation>>,
): Accommodation[] {
	const changes: Accommodation[] = [];
	for (const accommodation of newAccommodations) {
		const residenceMap = previousAccommodationsMap.get(
			accommodation.residence_name,
		);
		const existingAccommodation = residenceMap?.get(accommodation.type);

		if (
			!existingAccommodation ||
			hasAccommodationChanged(existingAccommodation, accommodation)
		) {
			changes.push(accommodation);
		}
	}
	return changes;
}

/** Compares two accommodations and returns true if they differ */
function hasAccommodationChanged(
	existing: Accommodation,
	updated: Accommodation,
): boolean {
	return existing.availability !== updated.availability;
}
