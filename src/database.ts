import logger from './logger';
import type { Accommodation, Link } from './types';

export class Database {
	constructor(private db: D1Database) { }

	async fetchLinks(): Promise<Link[]> {
		try {
			const { results } = await this.db
				.prepare('SELECT * FROM Links')
				.all<{ url: string; meta: string }>();

			const parsedResult = results.map((row) => ({
				url: row.url,
				meta: JSON.parse(row.meta),
			}));

			return parsedResult;
		} catch (error) {
			logger.error(error, 'Error while fetching links from the DB');
			throw error;
		}
	}

	async fetchAccommodations(): Promise<Accommodation[]> {
		try {
			const { results } = await this.db
				.prepare('SELECT * FROM Accommodations')
				.all<Accommodation>();
			return results;
		} catch (error) {
			logger.error(error, 'Error while fetching accommodations from the DB');
			throw error;
		}
	}

	async updateAccommodations(accommodations: Accommodation[]): Promise<void> {
		try {
			for (const accommodation of accommodations) {
				await this.db
					.prepare(
						`
					INSERT INTO Accommodations (residence_name, rent, type, availability, surface, url)
					VALUES (?, ?, ?, ?, ?, ?)
					ON CONFLICT(residence_name, type) DO UPDATE SET
					availability = excluded.availability`,
					)
					.bind(
						accommodation.residence_name,
						accommodation.rent,
						accommodation.type,
						accommodation.availability,
						accommodation.surface,
						accommodation.url,
					)
					.run();
			}
		} catch (error) {
			logger.error(error, 'Error while updating accommodations');
			throw error;
		}
	}
}
