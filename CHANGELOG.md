# Changelog
 
 All notable changes to this project will be documented in this file.
 
+## [1.0.1] - 2026-05-16
+### Added
+- **Global App Initialization**: Introduced `isAppReady` state to guard the application until authentication is verified.
+- **UI/UX**: Added `FullScreenLoader` component to provide a smooth transition during app startup.
+- **Cold Start Optimization**: Implemented a silent background ping to the Azure backend to wake it up early.
+- **Auth Flow Fix**: Eliminated the "Flash of Mockup Data" by awaiting the profile fetch before rendering the main UI.
+
+### Changed
+- **Stability**: Refactored `App.jsx` and `Login.jsx` to handle slow server connections gracefully.
+- **Environment**: Verified compatibility with the upgraded .NET 10.0 backend.
+
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
