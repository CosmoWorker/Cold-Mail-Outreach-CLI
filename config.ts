import { Ansis } from "ansis";

export const config = {
    ocean: Bun.env.OCEAN_API_KEY!,
    searchleads: Bun.env.SEARCHLEADS_API_KEY!,
    prospeo: Bun.env.PROSPEO_API_KEY!,
    brevo: Bun.env.BREVO_API_KEY!,
}

export const color = new Ansis().extend({
    brand: '#00C2FF',
    muted: '#6B7280',
    fail: '#FF4D4D',
    success: '#22C55E',
})