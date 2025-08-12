# Nexus Frontend

## Table of Contents

- Project Overview
- Prerequisites
- Installation
- Configuration
  - Angular CLI
  - Docker & Docker Compose
- Project Structure
- Pages Overview
  1. Chart Analysis
  2. Statistical Quick Analysis
  3. Tabular View
  4. Home Dashboard
- Development
- Build
- Tests
- Linting & Formatting
- CI/CD
- Deployment
- API Integration
- Features Overview
- Contributing
- License

## Project Overview

### Frontend

nexus-frontend is an Angular v19 application for visualizing and analyzing sensor data stored in InfluxDB. Features include:

Objectives:

- Intuitive, interaktive Visualisierung von Sensordaten
- Easy filtering and selection (by time range, sensor/measurement)
- Extendable architecture for future feature development
- Interactive charts: line, bar, heatmap, scatter
- Real-time and historical dashboards
- AI-generated synopses via OpenAI
- Modular, extensible architecture

The frontend consumes a Spring Boot REST API for data retrieval.

### Backend (API) — Repository

 The backend source code and API server are maintained in a separate repository:

**Backend repo:** https://github.com/GeorgFH/ppr-ss2025-group-f-backend

This backend repository contains the Spring Boot application, API specification (OpenAPI), and  instructions.

## Prerequisites

Make sure you have installed:

- Node.js >= 18.x
- npm >= 9.x or Yarn >= 1.x
- Angular CLI

## Installation

Clone the repo:

```bash
git clone https://github.com/Mikomy/ppr-ss2025-group-f-frontend.git
cd nexus-frontend
```

Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Configuration

### Angular CLI

- Serve (dev):

```bash
npm start
```

The app will be available at http://localhost:4200/.

- Build (dev):

```bash
npm run watch
```

- Build (prod):

```bash
npm run build
```

### Docker & Docker Compose

Currently not configured.
To add containerized setup, include a Dockerfile and docker-compose.yml and document the commands here.

## Project Structure

```
.angular/            # Angular CLI config
.github/             # CI workflows (.github/workflows)
.husky/              # Git hooks
src/
app/
components/     # Reusable UI components charts
models/         # TS models & enums
pages/          # Route/page components
services/       # HTTP & business logic
shared/         # Shared modules (pickers, tables, sensor-dropdown)
tab-navigation/ # Main navigation component (header/navbar)
app.module.ts   # Root NgModule
app.routes.ts   # Routing config (includes navigation routes)
assets/           # Static assets (JSON fixtures)
index.html          # Main HTML
main.ts             # Bootstrap script
styles.scss         # Global styles
angular.json        # Angular config
package.json        # Scripts & dependencies
Dockerfile          # Container build
docker-compose.yml  # Service orchestration
karma.conf.js       # Unit test config
playwright.config.ts# E2E test config
.eslint.*           # Linting rules
.prettierrc.json    # Formatting rules
LICENSE             # MIT License
README.md           # This file
```

## Navigation

The application uses a TabNavigationComponent to provide consistent navigation
across all pages. This component renders a top bar containing:

- Logo: Displays the Nexus logo (assets/nexus_logo.jpeg) on the left.
- Title: Shows “The Nexus Project” next to the logo.
- Navigation Links: Horizontal links for each route:
  - Home - Live Overview (/)
  - Chart Analysis (/chart)
  - Statistics (/statistics)
  - Table View (/table)

When a link matches the active route, an active class is applied for visual
feedback. The TabNavigationComponent resides in src/app/components/tab-navigation
and is included in the main AppComponent template.

Acknowledgements

## Pages Overview

### 1. Chart Analysis

**Objective:** Show historical sensor data in customizable charts.

**Workflow:**

- Select max three sensor+measurement combos.
- Choose color and chart type (line, bar, heatmap).
- Set time range or quick preset (Last Week/Month/90 Days).
- Click **Add Charts** to render draggable panels.
- Remove or reorder panels; persists in localStorage.

**Tech:**

- `ChartViewPageComponent`
- Subcomponents: `ChartConfigRowComponent`, `ChartPanelComponent`
- Services: `BackendService.getGroupedByAlias()`, `WebStorageService`

### 2. Statistical Quick Analysis

**Objective:** Compare two groups statistically and detect anomalies.

**Workflow:**

- Pick two sensor groups.
- Define time interval (manual or quick preset).
- Click **Compute** for stats: count, min, max, mean, median, stdDev, quartiles, IQR, Pearson correlation.
- Click **Show Anomalies** to highlight outliers (Tukey 1.5×IQR).

**Tech:**

- `StatisticsPageComponent`
- Subcomponents: `SensorGroupSelectorComponent`, `ScatterChartComponent`, `AnomalyListComponent`
- `StatsService`

### 3. Tabular View

**Objective:** Render raw data in interactive tables.

**Workflow:**

- Select sensor+measurement from dropdown.
- Choose time range or quick preset.
- Click **Add Table** to display draggable tables.
- Filter rows (>, <, =) and paginate results.
- Configs persist in localStorage.

**Tech:**

- `TableViewPageComponent`
- Subcomponents: `SensorDropdownComponent`, `MeasurementTableComponent` (MatTable + MatPaginator)

### 4. Home Dashboard

**Objective:** Provide real-time stats, latest measurement, and AI synopsis.

**Workflow:**

- Optionally filter by sensor+measurement.
- View cards: total points, average, min, max, latest.
- Inline bar chart of min/max across measurements.
- Read OpenAI synopsis (auto-refresh on data load).

**Tech:**

- `HomePageComponent` (3s refresh)
- Native `<select>` + reset button
- Material cards + custom layouts
- `BackendService.getDashboardStatistics()`, `getOpenAiSynopsis()`

#### Shared & Services

- **Shared Modules** (`src/app/shared`)
  - Reusable controls: Sensor-Dropdown, DateTime-Picker, Measurement-Table
- **BackendService** (`src/app/services/backend.service.ts`)
  - Centralized HTTP requests: measurement values, grouped data, statistics endpoints, OpenAI-generated synopses
- **StatsService** (`src/app/components/statistics/stats.service.ts`)

  - Calculates mean, median, quartiles, IQR, trend, and correlation
  - Implements Tukey’s IQR rule for outlier detection

- **AppModule / AppComponent**
  - Bootstrapping, global styling, and navigation integration
- **TabNavigationComponent** (`src/app/components/tab-navigation`)

  - Top navigation bar with links to all main pages.

- **Assets**: `src/assets/sensor-measurements.json` provides the initial dropdown list.
  - Add new sensor-measurement combinations by extending this file.

---

## Build

To create a production-ready bundle:
Production build:

```bash
npm run build -- --configuration production
```

```bash
ng build --prod
```

Outputs optimized files into the dist/ directory.
Enables AOT compilation, minification, and tree-shaking.
Custom output path:

```bash
ng build --output-path=public/ngx-dist
```

Use when integrating into another server or custom directory.

## Tests

- **Unit Tests:** `npm test` (Karma + Jasmine)
- **E2E Tests:** `npm run e2e` (Playwright)

## Linting & Formatting

- **Lint:** `npm run lint`
- **Fix Lint:** `npm run lint:fix`
- **Check Format:** `npm run format`
- **Fix Format:** `npm run format:fix`
- **Git Hooks:** Husky runs lint & format on pre-commit.

## CI/CD

- Workflow: `.github/workflows/tests.yml` runs tests & lint on push.

## API Integration

- Base URL: `http://localhost:8080/api`
- Endpoints: `/influx/*` and `/statistics/*` per OpenAPI spec.

## Features Overview

- Interactive line, bar, heatmap, scatter charts
- Real-time & historical dashboards
- AI-powered data synopsis
- Table view with advanced filters
- Statistical comparison & anomaly detection

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/my-feature`.
3. Commit: `git commit -m "feat: add my feature"`.
4. Push: `git push origin feature/my-feature`.
5. Open a Pull Request.

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## Acknowledgements

- Angular Team
- Chart.js, ng2-charts, ngx-echarts
- Angular Material
- Playwright, Karma, Jasmine
