# Changelog
 
 All notable changes to this project will be documented in this file.
 
## [1.0.2] - 2026-05-17
### Added
- **Guest Mode (ผู้เยี่ยมชม)**: Introduced a zero-setup local guest mode allowing immediate access to portfolios, cash flows, and stock trade simulation entirely offline with robust persistent browser storage.
- **Unified Cloud Sync/Migration Pipeline**: Designed a mathematically reconciled migration engine that sequence-reconstructs guest trades, deposits cash flows, and transitions all data seamlessly to the database upon registration or Google Link.
- **Mandatory Email Enforcement**: Upgraded both registration tabs and Guest Sync modals to make Email a strict required field, complete with bilingual validation alerts ("Please enter your email address" / "กรุณากรอกที่อยู่อีเมลของคุณ").

### Changed
- **TOS & Privacy Dialog**: Refined Terms of Service consent workflows, updated disclaimers below the Google button, and synchronized bilingual language state toggles (EN/TH) across the entire UI.
- **User Interface**: Refined custom branding icons, settings layouts, and sidebar responsiveness.

### Fixed
- **Dashboard Selector State Sync**: Fixed a classic React stale state bug in `Dashboard.jsx`. Switching portfolios now instantly clears previous holdings, loads fallback cash balances, and refreshes the UI without requiring page reloads or menu changes.
- **Market Page Stability**: Eliminated the market page white-screen crash by implementing full mock Watchlist database adapter integrations, including dynamic searches, ticker additions, and removal confirmation overlays.
- **Database Schema Leak Protection**: Added a global security interceptor in `axiosClient.js` to parse unhandled SQL exceptions (e.g. `dbo.Users` / `IX_`) and replace them with secure, generic messages to prevent corporate metadata exposure.

## [1.0.1] - 2026-05-16
### Added
- **Global App Initialization**: Introduced `isAppReady` state to guard the application until authentication is verified.

- **UI/UX**: Added `FullScreenLoader` component to provide a smooth transition during app startup.

- **Cold Start Optimization**: Implemented a silent background ping to the Azure backend to wake it up early.

- **Auth Flow Fix**: Eliminated the "Flash of Mockup Data" by awaiting the profile fetch before rendering the main UI.

### Changed
- **Stability**: Refactored `App.jsx` and `Login.jsx` to handle slow server connections gracefully.
- **Environment**: Verified compatibility with the upgraded .NET 10.0 backend.

 ## [1.0.0] - 2026-04-26
 ### Added
 - Created `vercel.json` for SPA routing fixes to handle direct URL navigation on Vercel.
 - Detailed professional README.md with bilingual support.
 
 ### Changed
 - Optimized build configurations for Vercel deployment.
 - Updated axios client to handle absolute/relative paths based on environment.
 
 ## [0.3.0] - 2026-04-20
 ### Added
 - Integrated Finnhub API for real-time stock data.
 - Added Stock Search and Quote components.
 - Added numeral.js for better currency and number formatting.
 
 ## [0.2.0] - 2026-04-15
 ### Added
 - Implemented Google OAuth login integration.
 - Added Redux state management for user session, tokens, and permissions.
 - Added automatic token refresh logic using axios interceptors.
 
 ## [0.1.0] - 2026-04-10
 ### Added
 - Initial project setup with React 19 and Vite.
 - Basic routing structure using React Router v7.
 - UI foundation with Material-UI v7 and theme configuration.
