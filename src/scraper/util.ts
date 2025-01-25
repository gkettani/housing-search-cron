import { z } from 'zod';

const resultSchema = z.object({
	result: z.record(z.array(z.string())),
});

/**
 * Scrapes content from a specified URL using a given CSS selector
 * @param url - The website to scrape
 * @param selector - CSS selector for the content to extract
 * @returns Validated scraped data
 */
export async function scrape(
	url: string,
	selector: string,
): Promise<z.infer<typeof resultSchema>> {
	const scraperUrl = new URL('https://web.scraper.workers.dev');
	scraperUrl.searchParams.set('url', url);
	scraperUrl.searchParams.set('selector', selector);

	try {
		const res = await fetch(scraperUrl.toString());

		if (!res.ok) {
			throw new ScrapingError('Failed to fetch content', {
				url,
				selector,
				originalError: new Error(`HTTP status: ${res.status}`),
			});
		}

		const json = await res.json();

		const parseResult = resultSchema.safeParse(json);

		if (!parseResult.success) {
			throw new ScrapingError('Data validation failed', {
				url,
				selector,
				originalError: parseResult.error,
			});
		}

		return parseResult.data;
	} catch (error) {
		// If it's already a ScrapingError, rethrow
		if (error instanceof ScrapingError) {
			throw error;
		}

		// Convert other errors to ScrapingError
		throw new ScrapingError('Unexpected scraping error', {
			url,
			selector,
			originalError: error instanceof Error ? error : undefined,
		});
	}
}

class ScrapingError extends Error {
	constructor(
		public message: string,
		public context?: {
			url?: string;
			selector?: string;
			originalError?: Error;
		},
	) {
		super(message);
		this.name = 'ScrapingError';

		// Ensure context is included in stack trace and toString()
		Object.defineProperty(this, 'stack', {
			get() {
				const contextString = this.context
					? `\nContext: ${JSON.stringify(this.context, null, 2)}`
					: '';
				return `${super.stack}${contextString}`;
			}
		});
	}
}
