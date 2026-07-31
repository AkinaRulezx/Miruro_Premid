# Miruro — PreMid Presence Extension

<p align="center">
  <img src="https://i.imgur.com/UMlwRbP.png" alt="Miruro Logo" width="120" height="120" />
</p>

<p align="center">
  A custom PreMid Presence for streaming active watching activity from <b>Miruro</b> directly to your Discord profile status.
</p>

<p align="center">
  <a href="#about"><img src="https://img.shields.io/badge/PreMid-Extension-6366f1?style=for-the-badge" alt="PreMid Extension"></a>
  <a href="#version"><img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version 1.0.0"></a>
  <a href="#category"><img src="https://img.shields.io/badge/Category-Anime-purple?style=for-the-badge" alt="Anime Category"></a>
</p>

---

## About The Project

Because **Miruro** (`miruro.tv` / `miruro.to`) was blocked due to DMCA constraints, the presence cannot be submitted to the official PreMid presence store publicly. This repository provides a custom local version that you can load directly into PreMid via standard Developer Mode tools.

---

## Features & Settings

The extension parses active DOM elements on Miruro to present accurate, rich details about your viewing session.

* **Dynamic Media Parsing**: Automatically extracts anime titles, episode numbers, episode titles, dynamic anime poster art, and video subtitle track indicators.
* **Flexible Page Contexts**: Displays specific Rich Presence states when browsing the homepage, history, schedule, trending lists, profiles, searches, anime info pages, or video player screens.
* **Configurable User Settings**:
  * **Multi-Language Support**: Toggle localization options.
  * **Anime Name as Header**: Choose whether to display the anime title as the main header line.
  * **Show Action Buttons**: Enable or disable direct links on your Discord presence allowing friends to jump to your page.
  * **Show Elapsed Time**: Enable/disable activity timestamps.
  * **Episode Details**: Show or hide specific episode titles/chapters.

---

## How It Works

The presence executes a background listener through the PreMid extension API:

```ts
presence.on('UpdateData', async () => {
  // Evaluates current URL and query parameters
  // Queries DOM for dynamic media information
  // Updates Discord Rich Presence state payloads
})
```
* **URL & DOM Inspection:** Evaluates active routes (/watch/, /info/, /search, etc.) and pulls real-time metadata directly from page selectors.
* **Settings Resolution:** Fetches user choices set inside your local PreMid extension settings interface.
* **Presence Payload Dispatch:** Sends structured status updates back to Discord via local RPC connections.

## Installation & Download
Because the Miruro presence cannot be uploaded to the official PreMid store, you need to import the project manually using the local .zip file.

* **Download:** Download the .zip file containing the presence source files.
* **Open PreMid:** Open the PreMid extension menu, then go to settings.
* **Enable Developer Mode:** Turn on Developer Mode inside PreMid.
* **Import the Extension:** Upload the downloaded .zip file directly into PreMid, and you are all set.
