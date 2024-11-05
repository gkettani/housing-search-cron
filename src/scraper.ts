import { z } from 'zod';
import { Residence, AVAILABILITY, Accommodation, Availability } from './types';

const resultSchema = z.object({
    result: z.record(z.array(z.string()))
});

function BuildUrl(link: string) {
    const url = new URL("https://web.scraper.workers.dev");
    url.searchParams.set("url", link);
    url.searchParams.set("selector", "tr.pair > td, tr.impair > td");
    return url;
}

// TODO: maybe this one should return the map
export async function handler(residence: Residence): Promise<Required<Accommodation>[]> {
    const res = await fetch(BuildUrl(residence.link));
    const json = await res.json();

    // Validate the JSON structure with Zod
    const parseResult = resultSchema.safeParse(json);
    if (!parseResult.success) {
        console.error("Invalid JSON structure:", parseResult.error.errors);
        return [];
    }

    const formatted = Object.values(parseResult.data.result).flat();
    if (formatted.length % 4 !== 0) {
        console.error("Unexpected data format, received:", formatted);
        return [];
    }

    const accommodations: Required<Accommodation>[] = [];
    for (let i = 0; i < formatted.length; i += 4) {
        const residence_name = residence.name;
        const type = formatted[i];
        const rent = formatted[i + 1];
        const surface = formatted[i + 2];
        const availabilityText = formatted[i + 3];

        let availability: Availability;
        if (availabilityText.startsWith("Aucune")) {
            availability = AVAILABILITY.NOT_AVAILABLE;
        } else if (availabilityText.startsWith("Disponibilit")) {
            availability = AVAILABILITY.INCOMING;
        } else {
            availability = AVAILABILITY.AVAILABLE;
        }

        accommodations.push({
            residence,
            residence_name,
            type,
            rent,
            surface,
            availability
        });
    }

    return accommodations;
}
