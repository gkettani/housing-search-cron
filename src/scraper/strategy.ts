import type { Link } from '../types';

export type ScrapingResult = {
	url: string;
	data: Record<string, any>;
	scrapedAt: Date;
};

export interface ScraperStrategy {
	// Unique identifier for the source
	sourceId: string;

	// Checks if the strategy can handle a specific link
	canHandle(link: Link): boolean;

	// Source-specific scraping method
	scrape(link: Link): Promise<ScrapingResult>;
}
