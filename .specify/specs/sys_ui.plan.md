# Technical Plan: UI/UX & Portal Screens (SYS-UI)

## 1. System Architecture
```
[React SPA Router]
  ├── /dashboard ➔ [DashboardComponent]
  ├── /graph     ➔ [GraphExplorerComponent]
  ├── /research  ➔ [ResearchWorkspaceComponent]
  ├── /factory   ➔ [ContentFactoryComponent]
  └── /analytics ➔ [AnalyticsDashboardComponent]
```

## 2. Technical Decisions
- Use **TailwindCSS** for layout and **ShadCN UI** for core elements (buttons, drawers, tables).
- Use **Zustand** for lightweight local state.
- Use **ECharts** or a D3-based wrapper for the interactive force-directed graph.

## 3. Database & Schema Changes
- None (UI consumes backend REST and WebSocket APIs).

## 4. File Structure & Target Files
- `[NEW]` `src/App.tsx`
- `[NEW]` `src/index.css`
- `[NEW]` `src/main.tsx`

## 5. Verification & Test Plan
- Run unit test renders for the main screens:
  ```bash
  npm run test
  ```
