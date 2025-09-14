# Game Scout Scraper Service

The Game Scout Scraper Service is a lightweight backend service that fetches game prices from stores that do not provide public APIs, such as GreenManGaming and GOG. It is designed to work with the Game Scout app, providing up-to-date pricing data on-demand.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [API](#api)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Scrapers](#scrapers)
- [Project Structure](#project-structure)

---

## Features

- On-demand scraping of game prices.
- Supports multiple stores: GreenManGaming, GOG.
- JWT-secured endpoints for authorized access.
- Returns structured price data, including base price and current price.
- TypeScript support with clear type definitions.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Scraping**: Puppeteer
- **Authentication**: JWT
- **Utilities**: CORS, dotenv

---

## API

### POST `/scrape`

Fetch the current price of a game from a specified store.

**Request Body:**

```json
{
  "store": "GreenManGaming",
  "title": "Game Title",
  "gameId": 100
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "base_price": 59.99,
    "current_price": 39.99,
    "currency": "USD",
    "url": "https://www.example.com/game"
  }
}
```

**Response (Failure)**:

```json
{
  "success": false,
  "error": "error-message"
}
```

---

## Getting Started

Prerequisites

- Node.js >= 20
- npm
- Puppeteer-compatible environment (Chrome installed if using full Puppeteer)
- .env file with:

```text
PORT=4000
JWT_SECRET=<your_jwt_secret>
```

---

## Installation

```bash
git clone
https://github.com/TomMilchman/game-scout-scraper-service.git
cd game-scout-scraper-service
npm install
```

### Running the Service

```bash
npm run dev
```

The service will run on http://localhost:4000.

---

### Scrapers

- GreenManGaming: scrapeGMGPrice(title, gameId)

- GOG: scrapeGogPrice(title, gameId)

Each scraper returns a ScraperResult object:

```typescript
type ScraperResult = {
  success: boolean;
  data?: {
    game_id: number;
    store: "GreenManGaming" | "GOG";
    base_price: number;
    current_price: number;
    currency: string;
    url: string;
    last_update: Date;
  }
  error?: string;
}
```

---

## Project Structure

```text
/src
  /lib            - Puppeteer setup
  /scrapers       - Puppeteer scraper scripts for each store
  /utils          - Utility functions
  index.ts        - Express server entry point
.env              - Environment variables
```
