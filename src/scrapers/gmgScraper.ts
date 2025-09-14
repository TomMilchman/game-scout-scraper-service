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

            let pageTitle = await page.title();

            if (
                !response ||
                !response.ok() ||
                page.url().includes("title-no-longer-available") ||
                pageTitle.includes("404 Page")
            ) {
                url = `https://www.greenmangaming.com/games/${slug}`;
                response = await page.goto(url, {
                    waitUntil: "domcontentloaded",
                });

                pageTitle = await page.title();

                if (
                    !response ||
                    !response.ok() ||
                    page.url().includes("title-no-longer-available") ||
                    pageTitle.includes("404 Page")
                ) {
                    return { success: "true", data: null };
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
