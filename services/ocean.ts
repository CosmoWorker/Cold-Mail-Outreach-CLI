import { log, note, spinner } from "@clack/prompts"
import { color, config } from "../config"

interface OceanCompany {
    domain: string
}
interface OceanCompanyItem {
    company: OceanCompany
}
interface OceanV3Response {
    companies: OceanCompanyItem[],
    searchAfter?: string
}

const findLookAlikeCompanies = async (seedDomain: string): Promise<string[]> => {
    const s = spinner()
    s.start(`Finding lookalikes for ${color.cyan(seedDomain)}`)

    try {
        const response = await fetch("https://api.ocean.io/v3/search/companies", {
            method: "POST",
            headers: {
                "x-api-token": config.ocean,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                size: 2, // to be changed to a limit required
                companiesFilters: {
                    "lookalikeDomains": [seedDomain]
                }
            })
        })
        if (!response.ok) {
            const err = await response.text()
            throw new Error(`Ocean.io ${response.status}: ${err}`)
        }
        const data = (await response.json()) as OceanV3Response
        const companyDomains = data.companies.map((item) => item.company.domain);
        s.stop(color.green(`✓ Found ${companyDomains.length} lookalike companies`))
        note(companyDomains.map(d => color.cyan(d)).join("\n"), "Lookalike Companies")
        return companyDomains
    } catch (e) {
        s.stop(color.red("✗ Ocean.io failed"))
        log.error(`${e}`)
        process.exit(1)
    }
}

export default findLookAlikeCompanies;