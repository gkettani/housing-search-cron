/**
 * Utility type to get the values of an object
 */
type ObjectValues<T> = T[keyof T];

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends Record<string, any> ? DeepRequired<T[K]> : T[K];
};

export const AVAILABILITY = {
    AVAILABLE: "AVAILABLE",
    INCOMING: "INCOMING AVAILABILITY",
    NOT_AVAILABLE: "NOT AVAILABLE"
} as const;

export type Availability = ObjectValues<typeof AVAILABILITY>;

export type Link = {
    url: string;
    // Metadata describing the content of the link
    meta: Record<string, string>
}

export type Accommodation = {
    residence_name: string;
    type: string;
    rent: string;
    surface: string;
    availability: Availability;
    url: string;
};
