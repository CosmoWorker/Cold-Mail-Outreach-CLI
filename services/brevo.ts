import { log, spinner, confirm, isCancel, note } from "@clack/prompts";
import { color, config } from "../config";

export const sendColdEmails = async (emails: string[], senderName: string): Promise<void> => {
    if (emails.length === 0) {
        log.warn(color.yellow("No emails to send."));
        return;
    }

    const subject = "Opportunity for building product at Scale";

    // Brevo Template ID can also be used from brevo dashboard 
    const template = `Hi there,
I've been deeply interested in your engineering team and the product your building. I really like the scale at which your building at.

I myself have worked closely with such products and have some projects backed up to it. I would really love to get some chance to work with you.

Hopefully this sparks a chance for me to build such products under your guidance.

Best,
${senderName}`;

    note(color.dim(template), `Preview: Universal Template (Sending to ${emails.length} contacts)`);

    const proceed = await confirm({
        message: color.bgRed.white(` Ready to send outreach emails to ${emails.length} contacts. Proceed? `),
        initialValue: false
    });

    if (isCancel(proceed) || !proceed) {
        log.warn(color.yellow("Email dispatch aborted by user. Pipeline finished."));
        return;
    }

    const s = spinner();
    s.start(`Sending outreach emails via Brevo...`);
    let successCount = 0;

    try {
        for (const email of emails) {
            s.message(`Sending to ${color.cyan(email)}...`);

            const success = await sendSingleEmail(email, senderName, subject, template);
            if (success) {
                successCount++;
            }

            // manual delay to limit immediate executions (rate limits)
            await new Promise(res => setTimeout(res, 300));
        }

        s.stop(color.green(`✓ Done! Successfully fired ${successCount}/${emails.length} emails.`));

    } catch (e) {
        s.stop(color.red("✗ Brevo execution failed"));
        log.error(`${e}`);
        process.exit(1);
    }
}

async function sendSingleEmail(toEmail: string, senderName: string, subject: string, textContent: string): Promise<boolean> {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": config.brevo,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    email: "mywork@vtarang.site",
                    name: senderName
                },
                to: [
                    { email: toEmail }
                ],
                subject: subject,
                textContent: textContent
            })
        });

        if (!response.ok) {
            log.warn(color.yellow(`Failed to send to ${toEmail}: HTTP ${response.status}`));
            return false;
        }
        return true;
    } catch (e) {
        log.warn(color.yellow(`Exception while sending to ${toEmail}: ${e}`));
        return false;
    }
}