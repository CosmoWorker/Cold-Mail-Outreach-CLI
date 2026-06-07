import { text, isCancel, intro, outro } from "@clack/prompts";

async function main() {
    intro("Cold Mail Outreaech")
    const name = await text({
        message: "What is your name (for outreach purposes)?",
        placeholder: "John Doe", 
    }) as string;

    if (isCancel(name)){
        console.log("Operation Cancelled");
        process.exit(0)
    }

    const seed_domain = await text({
        message: "Seed Domain: ", 
        placeholder: "@company.org"
    }) as string
    
    if (isCancel(seed_domain)){
        console.log("Operation Cancelled");
        process.exit(0)
    }

    outro("Done ")
}

main().catch(console.error)
