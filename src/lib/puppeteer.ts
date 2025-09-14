import { Cluster } from "puppeteer-cluster";

let cluster: Cluster | null = null;

export async function getCluster() {
    if (!cluster) {
        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            maxConcurrency: 3,
            puppeteerOptions: {
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            },
            timeout: 15000,
        });

        cluster?.on("taskerror", (err, data) => {
            console.error(`Error scraping ${data}: ${err.message}`);
        });
    }

    return cluster;
}
