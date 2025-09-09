import { getCluster } from "../lib/puppeteer.js";
import { Page } from "puppeteer";
import { generateGameSlug } from "../utils/utils.js";
import type { ScraperResult } from "../types.js";

export async function scrapeGogPrice(
    title: string,
    gameId: number
): Promise<ScraperResult> {
    const cluster = await getCluster();
    const slug = generateGameSlug(title, "_");
    const url = `https://www.gog.com/en/game/${slug}`;

    return cluster.execute(async ({ page }: { page: Page }) => {
        try {
            const response = await page.goto(url, {
                waitUntil: "domcontentloaded",
            });

            if (!response || !response.ok()) {
                console.warn(`No page found on GOG for ${title}`);
                return { success: "true", data: null };
            }

            const ageBlock = await page.$("div.age-gate.ng-scope");

            if (ageBlock) {
                await page.click("button.age-gate__button");
                await page.waitForNavigation({
                    waitUntil: "domcontentloaded",
                    timeout: 5000,
                });
            }

            const { basePrice, discountedPrice, currency } =
                await page.evaluate(() => {
                    const baseEl = document.querySelector(
                        ".product-actions-price__base-amount"
                    );
                    const discountEl = document.querySelector(
                        ".product-actions-price__final-amount"
                    );

                    const parsePrice = (el: Element | null) => {
                        if (!el) return null;

                        return parseFloat(
                            el.textContent?.replace(/[^0-9.]/g, "") || "0"
                        );
                    };

                    const base = parsePrice(baseEl);
                    const final = parsePrice(discountEl);

                    return {
                        basePrice: base ?? final,
                        discountedPrice: base ? final : null,
                        currency: "USD",
                    };
                });

            const data = {
                game_id: gameId,
                store: "GOG",
                base_price: basePrice,
                current_price: discountedPrice,
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
