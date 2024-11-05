import { Resend } from 'resend';
import * as Scraper from "./scraper";
import { Accommodation, Residence } from "./types";

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event, env, ctx): Promise<void> {
		try {
			// Fetch residences from the database
			const residences = await fetchResidences(env);

			// Scrape accommodations for all residences
			const newAccommodations = await scrapeAccommodationsForResidences(residences);

			// Fetch existing accommodations from the database
			const previousAccommodations = await fetchPreviousAccommodations(env);

			// Map existing accommodations for comparison
			const accommodationsMap = buildAccommodationMap(previousAccommodations);

			// Compare and determine changes
			const changes = determineAccommodationChanges(newAccommodations, accommodationsMap);

			// Update the database with changes if any
			if (changes.length > 0) {
				await updateAccommodations(env, changes);
				await sendUpdateNotification(env, changes);
			}
		} catch (error) {
			console.error("Scheduled handler error:", error);
		}
	}
} satisfies ExportedHandler<Env>;

/** Fetches residences from the database */
async function fetchResidences(env: Env): Promise<Residence[]> {
	const { results } = await env.DB.prepare("SELECT * FROM Residences").all<Residence>();
	return results;
}

/** Scrapes accommodations for each residence */
async function scrapeAccommodationsForResidences(residences: Residence[]): Promise<Required<Accommodation>[]> {
	const accommodations: Required<Accommodation>[] = [];
	for (const residence of residences) {
		try {
			const scrapedData = await Scraper.handler(residence);
			accommodations.push(...scrapedData);
		} catch (error) {
			console.error(`Error scraping residence ${residence.name}:`, error);
		}
	}
	return accommodations;
}

/** Fetches previous accommodations from the database */
async function fetchPreviousAccommodations(env: Env): Promise<Accommodation[]> {
	const { results } = await env.DB.prepare("SELECT * FROM Accommodations").all<Accommodation>();
	return results;
}

/** Builds a map of existing accommodations by residence name and type */
function buildAccommodationMap(accommodations: Accommodation[]): Map<string, Map<string, Accommodation>> {
	const accommodationMap: Map<string, Map<string, Accommodation>> = new Map();
	for (const accommodation of accommodations) {
		if (!accommodationMap.has(accommodation.residence_name)) {
			accommodationMap.set(accommodation.residence_name, new Map());
		}
		accommodationMap.get(accommodation.residence_name)?.set(accommodation.type, accommodation);
	}
	return accommodationMap;
}

/** Determines changes between new and previous accommodations */
function determineAccommodationChanges(
	newAccommodations: Required<Accommodation>[],
	previousAccommodationsMap: Map<string, Map<string, Accommodation>>
): Accommodation[] {
	const changes: Accommodation[] = [];
	for (const accommodation of newAccommodations) {
		const residenceMap = previousAccommodationsMap.get(accommodation.residence.name);
		const existingAccommodation = residenceMap?.get(accommodation.type);

		if (!existingAccommodation || hasAccommodationChanged(existingAccommodation, accommodation)) {
			changes.push(accommodation);
		}
	}
	return changes;
}

/** Compares two accommodations and returns true if they differ */
function hasAccommodationChanged(existing: Accommodation, updated: Accommodation): boolean {
	return existing.availability !== updated.availability;
}

/** Updates the database with changed accommodations */
async function updateAccommodations(env: Env, accommodations: Accommodation[]): Promise<void> {
	for (const accommodation of accommodations) {
		try {
			await env.DB.prepare(`
				INSERT INTO Accommodations (residence_name, rent, type, availability, surface)
				VALUES (?, ?, ?, ?, ?)
				ON CONFLICT(residence_name, type) DO UPDATE SET
					availability = excluded.availability
			`)
			.bind(accommodation.residence_name, accommodation.rent, accommodation.type, accommodation.availability, accommodation.surface)
			.run();
		} catch (error) {
			console.error(`Failed to update accommodation ${accommodation.residence_name} - ${accommodation.type}:`, error);
		}
	}
}

/** Sends a notification containing all changes */
async function sendUpdateNotification(env: Env, changes: Accommodation[]): Promise<void> {
	if (changes.length === 0) return;

	const message = formatChangesMessage(changes);
	await sendEmailNotification(env, message);
	console.log("Update notification sent.");
}

/** Formats the changes message for the email body */
function formatChangesMessage(changes: Accommodation[]): string {
	return changes.map(change => 
		`Residence: ${change.residence_name}
		Type: ${change.type}
		Rent: ${change.rent}
		Surface: ${change.surface}
		Availability: ${change.availability}`
	).join('\n\n');
}

/** Sends an email notification */
async function sendEmailNotification(env: Env, message: string): Promise<void> {
	const resend = new Resend(env.RESEND_KEY);
	try {
		await resend.emails.send({
			from: `Housing <${env.RESEND_EMAIL_FROM}>`,
			to: [env.RESEND_EMAIL_TO],
			subject: 'Fac-Habitat Changes',
			text: message,
		  });
	} catch (error) {
		console.error("Failed to send email notification:", error);
	}
}
