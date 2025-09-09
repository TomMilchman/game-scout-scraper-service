import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { scrapeGMGPrice } from "./scrapers/gmgScraper.js";
import { scrapeGogPrice } from "./scrapers/gogScraper.js";

const PORT = process.env.PORT || 4000;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scrape", async (req, res) => {
    const { store, title, gameId } = req.body;

    try {
        let result;

        switch (store) {
            case "GreenManGaming":
                result = await scrapeGMGPrice(title, gameId);
                break;
            case "GOG":
                result = await scrapeGogPrice(title, gameId);
                break;
            default:
                return res
                    .status(400)
                    .json({ success: false, error: "Unknown store" });
        }

        if ("data" in result) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({
                success: false,
                error: result.error || "Unknown error",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error });
    }
});

app.listen(PORT, () => console.log(`Scraper service running on port ${PORT}`));
