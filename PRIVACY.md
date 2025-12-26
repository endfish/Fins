# Privacy Policy for Fins

**Last Updated: 2025-01-20**

Fins is a minimalist, geek-style new tab extension designed with a "Privacy First" philosophy. This document explains how we handle your data.

## 1. No Data Collection

Fins does not collect, store, or transmit any personally identifiable information (PII). We do not use any analytics, trackers, or third-party cookies to monitor your browsing behavior.

## 2. Local Storage and Sync

Your data (such as layout configurations, bookmarks, and settings) is stored exclusively through browser-provided APIs:

- **Local Storage**: All your personal configurations are saved on your local device using the `chrome.storage.local` API.
- **Cloud Sync**: If you use the browser's built-in synchronization feature (e.g., Microsoft Edge Sync), your data is compressed using `LZ-String` and synced across your devices via your browser's native service. We do not own or manage any servers to store this data.

## 3. Third-Party Services

To provide specific features, Fins may interact with the following services:

- **Bing Daily Wallpaper**: When the Bing wallpaper feature is enabled, the extension fetches the "Daily Image" from Bing's servers.
- **Custom Assets**: If you provide custom URLs for wallpapers or icons, your browser will request those assets directly from the specified sources.

When these requests are made, the third-party providers may receive standard technical information (such as your IP address), but Fins never shares your internal settings or local data with them.

## 4. Permissions Usage

Fins only requests the minimum permissions necessary to function:

- `storage` & `unlimitedStorage`: To save and persist your dashboard layout and settings.
- `host_permissions` (e.g., Bing): Specifically used to fetch background images for your aesthetic experience.

## 5. Open Source and Transparency

As an open-source project, our code is fully transparent. You can audit how data is handled by visiting our repository: [https://github.com/endfish/Fins](https://github.com/endfish/Fins).

## 6. Contact

If you have any questions regarding this Privacy Policy, please open an issue on our GitHub repository.
