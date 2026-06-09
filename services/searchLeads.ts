import { log, spinner } from "@clack/prompts"
import { color, config } from "../config"

const findPersonLinkedinUrls = async (domains: string[]): Promise<string[]> => {
    const s = spinner();
    s.start(`Searching for CTOs & VPs at ${domains.length} companies...`);
    const allLinkedinUrls: string[] = []

    try {
        for (const domain of domains) {
            s.message(`Getting decision-makers for ${color.cyan(domain)}...`);
            const response = await fetch("https://pro.searchleads.co/functions/v1/people-search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-searchleads-api-key": config.searchleads,
                },
                body: JSON.stringify({
                    searchType: "people",
                    filters: {
                        "contact.seniority": ["vp", "c_suite"],
                    },
                    textFilters: {
                        "account.domain": domain
                    },
                    size: 1
                })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`SearchLeads API ${response.status}: ${err}`);
            }
            const data = await response.json() as any
            const people = data.results?.content ?? []
            for (const p of people){
                if (!p.link?.linkedin) continue
                allLinkedinUrls.push(p.link.linkedin)
            }
            await Bun.write("debug_searchleads.json", JSON.stringify(data, null, 2))
        }


        s.stop(color.green(`✓ Found ${allLinkedinUrls.length} prospects from the companies`));

        return allLinkedinUrls
    } catch (e) {
        s.stop(color.red("✗ SearchLeads failed"));
        log.error(`${e}`);
        process.exit(1);
    }
}

export default findPersonLinkedinUrls;