import { text, isCancel, intro, outro } from "@clack/prompts";
import figlet from "figlet";
import { color } from "./config";
import findLookAlikeCompanies from "./services/ocean";
import findPersonLinkedinUrls from "./services/searchLeads";
import bulkEnrichEmails from "./services/prospeo";
import { sendColdEmails } from "./services/brevo";

function handleCancel(value: unknown) {
    if (isCancel(value)) {
        console.log("Operation Cancelled");
        process.exit(0);
    }
}

async function main() {
    console.clear();
    console.log(
        color.brand(
            figlet.textSync("MailOutreach", {
                font: "Ghost", // fonts like 'Slant' or 'Ghost'
                horizontalLayout: "fitted"
            })
        )
    );

    intro(color.bgCyanBright.black` Pipeline Initialized `);

    const senderName = await text({
        message: `Your Name ${color.muted`(used in outreach emails)`}`,
        placeholder: "John Doe",
        validate: (v) => (!v?.trim() ? "Name is required" : undefined)
    }) as string;
    handleCancel(senderName);

    const seed_domain = await text({
        message: "Seed Domain ",
        placeholder: "company.org",
        validate: (v) => {
            if (!v?.trim()) return "Domain is required"
            if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) return "Enter a valid domain e.g., subspace.org"
        }
    }) as string;
    handleCancel(seed_domain);

    const lookalikeDomains = await findLookAlikeCompanies(seed_domain)
    const linkedinUrls = await findPersonLinkedinUrls(lookalikeDomains)
    const emails = await bulkEnrichEmails(linkedinUrls)
    sendColdEmails(emails, senderName)

    outro(color.bgGreenBright.black` Done `)
}

main().catch(console.error)
