import { note, spinner } from "@clack/prompts";
import { color, config } from "../config";

export const bulkEnrichEmails = async (linkedinUrls: string[]): Promise<string[]> => {
    if (linkedinUrls.length === 0) return [];

    const s = spinner()
    s.start(`Enriching profiles via Prospeo...`);
    const response = await fetch("https://api.prospeo.io/bulk-enrich-person", {
        method: "POST",
        headers: {
            "X-KEY": config.prospeo,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            only_verified_email: true,
            data: linkedinUrls.map((url, index) => ({
                identifier: index.toString(),
                linkedin_url: url
            }))
        })
    })

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Prospeo API ${response.status}: ${err}`);
    }

    const responseData = await response.json();
    const emailsInfo: string[] = []
    //@ts-ignore
    for (const match of responseData.matched){
        const email = match.person?.email?.email || match.person?.work_email;

        if (email){
            emailsInfo.push(email)
        }
    }

    // @ts-ignore
    s.stop(color.green(`✓ Prospeo resolved ${emailsInfo.length+1} verified emails`));
        
    if (emailsInfo.length > 0) {
        note(emailsInfo.map(e => color.brand(e)).join("\n"), "Verified Work Emails");
    }

    return emailsInfo
}