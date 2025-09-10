import { getCluster } from "../lib/puppeteer.js";
import { Page } from "puppeteer";
import { generateGameSlug } from "../utils/utils.js";
import type { ScraperResult } from "../types.js";

export async function scrapeGMGPrice(
    title: string,
    gameId: number
): Promise<ScraperResult> {
    const cluster = await getCluster();
    const slug = generateGameSlug(title, "-");
    let url = `https://www.greenmangaming.com/games/${slug}-pc`;

    return cluster.execute(async ({ page }: { page: Page }) => {
        try {
            let response = await page.goto(url, {
                waitUntil: "domcontentloaded",
            });

            if (
                !response ||
                !response.ok() ||
                page.url().includes("title-no-longer-available")
            ) {
                url = `https://www.greenmangaming.com/games/${slug}`;
                response = await page.goto(url, {
                    waitUntil: "domcontentloaded",
                });

                if (
                    !response ||
                    !response.ok() ||
                    page.url().includes("title-no-longer-available")
                ) {
                    console.warn(
                        `No page found on GreenManGaming for ${title}`
                    );
                    return { success: "true", data: null };
                }
            }

            const ageModal = await page.$("div#birth-date-modal");

            if (ageModal) {
                await page.waitForSelector("select#day", { visible: true });
                await page.waitForSelector("select#month", { visible: true });
                await page.waitForSelector("select#year", { visible: true });

                await page.select("select#day", "01");
                await page.select("select#month", "01");
                await page.select("select#year", "2000");

                const confirmButton = await page.waitForSelector(
                    "button.btn.btn-success",
                    { visible: true }
                );

                if (confirmButton) {
                    await Promise.all([
                        page.waitForNavigation({
                            waitUntil: "domcontentloaded",
                            timeout: 5000,
                        }),
                        confirmButton.click(),
                    ]);
                }
            }

            const { basePrice, currentPrice, currency } = await page.evaluate(
                () => {
                    const prevEl = document.querySelector(
                        "gmgprice.prev-price"
                    );
                    const currEl =
                        document.querySelector("gmgprice.current-price") ||
                        prevEl;

                    const parsePrice = (el: Element | null) => {
                        if (!el) return null;
                        return parseFloat(
                            el.textContent?.replace(/[^0-9.]/g, "") || "0"
                        );
                    };

                    const base = parsePrice(prevEl) || parsePrice(currEl);
                    const current = parsePrice(currEl);

                    return {
                        basePrice: base,
                        currentPrice: current,
                        currency: "USD",
                    };
                }
            );

            const data = {
                game_id: gameId,
                store: "GreenManGaming",
                base_price: basePrice,
                current_price: currentPrice,
                currency,
                url,
                last_updated: new Date(),
            };

            return { success: true, data };
        } catch (error) {
            console.warn(`Failed to navigate to ${url}: ${error}`);
            return { success: false, error: (error as Error).message };
        }
    });
}
