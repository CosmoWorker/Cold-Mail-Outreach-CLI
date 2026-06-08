import { text, isCancel, intro, outro, note } from "@clack/prompts";
import { color } from "./config";
import findLookAlikeCompanies from "./services/ocean";

function handleCancel(value: unknown) {
    if (isCancel(value)) {
        console.log("Operation Cancelled");
        process.exit(0);
    }
}

async function main() {
    console.clear()
    intro(color.bgCyanBright.black`  Cold Mail Outreach  `)
    const senderName = await text({
        message: `Your Name ${color.muted`(used in outreach emails)`}`,
        placeholder: "John Doe",
        validate: (v) => (!v?.trim() ? "Name is required" : undefined)
    }) as string;
    handleCancel(senderName)

    const seed_domain = await text({
        message: "Seed Domain ",
        placeholder: "company.org",
        validate: (v) => {
            if (!v?.trim()) return "Domain is required"
            if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) return "Enter a valid domain e.g., @subspace.org"
        }
    }) as string
    handleCancel(seed_domain)


    const lookalikeDomains = await findLookAlikeCompanies(seed_domain)
    

    outro(color.bgGreenBright.black` Done `)
}

main().catch(console.error)
