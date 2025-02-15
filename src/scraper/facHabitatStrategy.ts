import { decode } from 'html-entities';
import { AVAILABILITY, type Availability, type Link } from '../types';
import type { ScraperStrategy, ScrapingResult } from './strategy';
import * as util from './util';

export class FacHabitatScraperStrategy implements ScraperStrategy {
	sourceId = 'fac-habitat';

	canHandle(link: Link): boolean {
		return link.url.includes('fac-habitat.com');
	}

	async scrape(link: Link): Promise<ScrapingResult> {
		const { result } = await util.scrape(
			link.url,
			'tr.pair > td, tr.impair > td',
		);

		const formatted = Object.values(result).flat();
		if (formatted.length % 4 !== 0) {
			throw new Error(
				`Unexpected data format, received: ${JSON.stringify(formatted)}`,
			);
		}

		const accommodations = [];

		for (let i = 0; i < formatted.length; i += 4) {
			const residence_name = link.meta.residence_name;
			const type = formatted[i];
			const rent = formatted[i + 1];
			const surface = formatted[i + 2];
			const availabilityText = decode(formatted[i + 3]).toLowerCase().trim();

			let availability: Availability = AVAILABILITY.NOT_AVAILABLE;
			if (availabilityText.startsWith('déposer une demande disponibilité immédiate')) {
				availability = AVAILABILITY.IMMEDIATELY_AVAILABLE;
			} else if (availabilityText.startsWith('déposer une demande')) {
				availability = AVAILABILITY.AVAILABLE;
			} else if (availabilityText.includes('disponibilité à venir')) {
				availability = AVAILABILITY.INCOMING;
			}

			accommodations.push({
				residence_name,
				type,
				rent,
				surface,
				availability,
				url: link.url,
			});
		}

		return {
			url: link.url,
			data: {
				accommodations,
			},
			scrapedAt: new Date(),
		};
	}
}
