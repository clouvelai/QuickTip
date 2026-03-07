# /e2e-test — Visual Verification for QuickTip Visualizations

## Description
Automates Chrome-based visual verification of all QuickTip visualization components. Captures screenshots or GIFs and generates documentation.

## Arguments
- `mode`: `fixtures` (default) | `live` | `full`
- `capture`: `screenshot` (default) | `gif`

## User-invocable
Yes

## Instructions

You are running a visual E2E test of QuickTip's visualization components using Chrome browser automation.

### Pre-flight Checks

1. Check if the frontend dev server is running on `localhost:5173` by navigating to it
2. If `mode` is `live` or `full`, also verify the backend is running on `localhost:8000/health`
3. Ensure `docs/screenshots/` directory exists (create if not)

### Mode: fixtures (default)

**Capture approach:** Install puppeteer temporarily (`cd frontend && npm install --save-dev puppeteer`), write and run a Node.js script that:
1. Launches headless Chrome via puppeteer
2. Navigates to `http://localhost:5173?test=viz`
3. Waits 2.5s for Recharts animations
4. For each section ID, uses `page.$('#${id} > :last-child')` to get the visualization element and calls `.screenshot({ path })` to save it to `docs/screenshots/{name}.png`
5. Closes the browser

After running, uninstall puppeteer (`npm uninstall puppeteer`).

Alternatively, for GIF capture or visual verification, use Chrome browser automation tools (mcp__claude-in-chrome__*) to navigate and visually inspect each section.

**Section IDs and filenames:**

| Section ID | Filename |
|------------|----------|
| viz-contract-timeline | contract-timeline |
| viz-team-payroll | team-payroll |
| viz-player-radar | player-radar |
| viz-career-trajectory | career-trajectory |
| viz-stat-leaders | stat-leaders |
| viz-roster | roster |
| viz-player-profile | player-profile |
| viz-cap-info | cap-info |
| viz-salary-match-valid | salary-match-valid |
| viz-salary-match-invalid | salary-match-invalid |
| viz-exceptions | exceptions |
| viz-trade-analysis | trade-analysis |

### Mode: live

1. Navigate to `http://localhost:5173`
2. For each prompt below, sequentially:
   a. Type the prompt into the chat input and submit
   b. Wait for the response to complete (look for the visualization to render)
   c. Capture the visualization area
   d. Click "New Chat" in the sidebar to reset

| # | Prompt | Expected Tool | Filename |
|---|--------|---------------|----------|
| 1 | "What is Jayson Tatum's contract?" | get_player_contract | live-contract |
| 2 | "Show me the Warriors cap sheet" | get_team_cap_sheet | live-payroll |
| 3 | "What are Luka Doncic's stats this season?" | get_player_season_stats | live-radar |
| 4 | "Show Anthony Edwards' career trajectory" | get_player_career_stats | live-career |
| 5 | "Who leads the league in points?" | get_stat_leaders | live-leaders |
| 6 | "Show the Nuggets roster" | get_team_roster | live-roster |
| 7 | "Tell me about Victor Wembanyama" | get_player_profile | live-profile |
| 8 | "What are the current CBA salary cap numbers?" | get_cap_info | live-cap-info |
| 9 | "Analyze a Trae Young for Zach LaVine trade" | analyze_trade | live-trade |

### Mode: full

Run both `fixtures` and `live` modes in sequence.

### Generate Documentation

After capturing all screenshots/GIFs, generate `docs/usage-examples.md` with:

```markdown
# QuickTip - Usage Examples

Visual examples of all visualization components.

## Contract Timeline
![Contract Timeline](screenshots/{filename}.png)

## Team Payroll
![Team Payroll](screenshots/{filename}.png)

... (one section per visualization with the actual captured filename)
```

Use relative image paths from the `docs/` directory.

### Update README

Add the following line after the Features section in `README.md` (after the last feature bullet):

```
See [Usage Examples](docs/usage-examples.md) for screenshots of all visualizations.
```

Only add this line if it doesn't already exist in README.md.
