export type ScraperResult =
    | { success: true; data: GamePriceDetails }
    | { success: false; error: string };

interface GamePriceDetails {
    game_id: number;
    store: "GreenManGaming" | "GOG";
    base_price: number;
    current_price: number;
    currency: string;
    url: string;
    last_update: Date;
}
