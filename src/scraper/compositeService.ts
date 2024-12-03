import type { ScrapingResult, ScraperStrategy } from './strategy';
import type { Link } from '../types';

export interface ScraperService {
	addStrategy(strategy: ScraperStrategy): ScraperService;
	scrape(link: Link): Promise<ScrapingResult>;
}

export class CompositeScraperService implements ScraperService {
	private scrapers: ScraperStrategy[] = [];

	addStrategy(strategy: ScraperStrategy) {
		this.scrapers.push(strategy);
		return this;
	}

	async scrape(link: Link): Promise<ScrapingResult> {
		const appropriateScraper = this.scrapers.find((scraper) =>
			scraper.canHandle(link),
		);

		if (!appropriateScraper) {
			throw new Error(`No scraper found for URL: ${link.url}`);
		}

		return appropriateScraper.scrape(link);
	}
}
