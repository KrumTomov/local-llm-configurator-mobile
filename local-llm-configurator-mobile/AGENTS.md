# Local LLM Configurator App is Next.js + Expo app to plan AI infrastructure management platform for local and hybrid LLM deployments.

# Tech Guidelines
Technologies: React Native + Expo + Expo Router
Back-end: Local LLM Configurator App RESTful API, with "Bearer token" auth
Back-end API source code: ..\local-llm-configurator-web\src\app\api
Modular design: split the app into meaningful components, to avoid too much code in a single file and reuse repeating code
Mobile User Interface Gudelines
Implement user-friendly UI, stack navigation, responsive layout (for tablest / smartphones)
Mobile UI Alerts: ensure all native alerts, confirms and other system dialogs have a fallback for Web (implemented as modal popups)
