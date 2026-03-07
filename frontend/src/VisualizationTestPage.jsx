import ContractTimelineChart from './components/visualizations/ContractTimelineChart'
import TeamPayrollChart from './components/visualizations/TeamPayrollChart'
import PlayerRadarChart from './components/visualizations/PlayerRadarChart'
import CareerTrajectoryChart from './components/visualizations/CareerTrajectoryChart'
import StatLeadersChart from './components/visualizations/StatLeadersChart'
import RosterCard from './components/visualizations/RosterCard'
import PlayerProfileCard from './components/visualizations/PlayerProfileCard'
import CapInfoCard from './components/visualizations/CapInfoCard'
import SalaryMatchCard from './components/visualizations/SalaryMatchCard'
import ExceptionsCard from './components/visualizations/ExceptionsCard'
import TradeAnalysisCard from './components/visualizations/TradeAnalysisCard'

function Section({ id, label, children }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-lg font-semibold text-zinc-300 mb-4 border-b border-zinc-700 pb-2">
        {label}
      </h2>
      {children}
    </section>
  )
}

const fixtures = {
  contractTimeline: {
    player: 'Jayson Tatum',
    team: 'BOS',
    contracts: [
      { season: 2025, cap_hit: 32600060, base_salary: 30351780 },
      { season: 2026, cap_hit: 34848340, base_salary: 32778120 },
      { season: 2027, cap_hit: 37096620, base_salary: 35204460 },
      { season: 2028, cap_hit: 39344900, base_salary: 37630800 },
      { season: 2029, cap_hit: 41593180, base_salary: 40057140 },
    ],
  },

  teamPayroll: {
    team: 'Golden State Warriors',
    total_salary: 210500000,
    player_count: 15,
    contracts: [
      { player: 'Stephen Curry', cap_hit: 55761216 },
      { player: 'Andrew Wiggins', cap_hit: 26289412 },
      { player: 'Draymond Green', cap_hit: 24026712 },
      { player: 'Jonathan Kuminga', cap_hit: 7620960 },
      { player: 'Kevon Looney', cap_hit: 8000000 },
      { player: 'Gary Payton II', cap_hit: 9120360 },
      { player: 'Moses Moody', cap_hit: 5349360 },
      { player: 'Brandin Podziemski', cap_hit: 3879840 },
      { player: 'Trayce Jackson-Davis', cap_hit: 2160480 },
      { player: 'Gui Santos', cap_hit: 2019706 },
    ],
  },

  playerRadar: {
    player: 'Luka Doncic',
    team: 'DAL',
    season: 2025,
    stats: {
      pts: 33.9, reb: 9.2, ast: 9.8, stl: 1.4, blk: 0.5,
      fg_pct: 0.487, tov: 4.1, fg3_pct: 0.356, ft_pct: 0.786,
      min: 37.1, fgm: 11.8, fga: 24.2,
    },
  },

  careerTrajectory: {
    player: 'Anthony Edwards',
    team: 'MIN',
    seasons: [
      { season: 2021, stats: { pts: 19.3, reb: 4.7, ast: 2.9, fg_pct: 0.417, min: 32.1 } },
      { season: 2022, stats: { pts: 21.3, reb: 4.8, ast: 3.8, fg_pct: 0.441, min: 34.3 } },
      { season: 2023, stats: { pts: 24.6, reb: 5.8, ast: 4.4, fg_pct: 0.456, min: 35.7 } },
      { season: 2024, stats: { pts: 25.9, reb: 5.4, ast: 5.1, fg_pct: 0.461, min: 35.5 } },
      { season: 2025, stats: { pts: 27.6, reb: 6.2, ast: 5.8, fg_pct: 0.472, min: 36.8 } },
    ],
  },

  statLeaders: {
    stat: 'pts',
    season: 2025,
    leaders: [
      { rank: 1, player: 'Luka Doncic', team: 'DAL', value: 33.9 },
      { rank: 2, player: 'Shai Gilgeous-Alexander', team: 'OKC', value: 31.4 },
      { rank: 3, player: 'Giannis Antetokounmpo', team: 'MIL', value: 30.8 },
      { rank: 4, player: 'Joel Embiid', team: 'PHI', value: 29.7 },
      { rank: 5, player: 'Anthony Edwards', team: 'MIN', value: 27.6 },
      { rank: 6, player: 'Jayson Tatum', team: 'BOS', value: 27.1 },
      { rank: 7, player: 'Kevin Durant', team: 'PHX', value: 26.8 },
      { rank: 8, player: 'Donovan Mitchell', team: 'CLE', value: 26.2 },
      { rank: 9, player: 'LeBron James', team: 'LAL', value: 25.7 },
      { rank: 10, player: 'Devin Booker', team: 'PHX', value: 25.1 },
    ],
  },

  roster: {
    team: 'Denver Nuggets',
    player_count: 15,
    roster: [
      { player: 'Nikola Jokic', position: 'C', height: '6-11', weight: 284, country: 'Serbia' },
      { player: 'Jamal Murray', position: 'PG', height: '6-4', weight: 215, country: 'Canada' },
      { player: 'Michael Porter Jr.', position: 'SF', height: '6-10', weight: 218, country: 'USA' },
      { player: 'Aaron Gordon', position: 'PF', height: '6-8', weight: 235, country: 'USA' },
      { player: 'Kentavious Caldwell-Pope', position: 'SG', height: '6-5', weight: 204, country: 'USA' },
      { player: 'Reggie Jackson', position: 'PG', height: '6-3', weight: 208, country: 'USA' },
      { player: 'Christian Braun', position: 'SG', height: '6-7', weight: 218, country: 'USA' },
      { player: 'Peyton Watson', position: 'SF', height: '6-8', weight: 203, country: 'USA' },
      { player: 'Zeke Nnaji', position: 'PF', height: '6-11', weight: 240, country: 'USA' },
      { player: 'DeAndre Jordan', position: 'C', height: '6-11', weight: 265, country: 'USA' },
    ],
  },

  playerProfile: {
    player: 'Victor Wembanyama',
    team: 'SAS',
    position: 'C',
    height: '7-4',
    weight: 210,
    country: 'France',
    jersey_number: 1,
    draft_year: 2023,
    draft_round: 1,
    draft_number: 1,
  },

  capInfo: {
    season: '2024-25',
    salary_cap: 140588000,
    luxury_tax_line: 170814000,
    first_apron: 178132000,
    second_apron: 188931000,
    mid_level_exception_non_taxpayer: 12860000,
    mid_level_exception_taxpayer: 5180000,
    bi_annual_exception: 4680000,
    room_exception: 7720000,
    minimum_salary: 1157970,
  },

  salaryMatchValid: {
    valid: true,
    outgoing: 28500000,
    incoming: 32100000,
    max_allowed: 34125000,
    rule: 'Team above salary cap: outgoing + 25% + $250K',
  },

  salaryMatchInvalid: {
    valid: false,
    outgoing: 15000000,
    incoming: 32100000,
    max_allowed: 19000000,
    warning: 'Incoming salary exceeds the maximum allowed under CBA rules.',
    rule: 'Team above salary cap: outgoing + 25% + $250K',
  },

  exceptions: {
    over_cap: true,
    in_luxury_tax: false,
    above_first_apron: false,
    salary_cap: 140588000,
    team_total_salary: 155200000,
    second_apron: 188931000,
    available_exceptions: [
      { name: 'Non-Taxpayer MLE', value: 12860000, note: 'Available for teams below the tax apron' },
      { name: 'Bi-Annual Exception', value: 4680000, note: 'Available every other year for teams below first apron' },
      { name: 'Trade Exception', value: 8500000, note: 'From prior trade, expires July 2025' },
    ],
  },

  tradeAnalysis: {
    trade_valid: true,
    salary_difference: 3600000,
    team1: {
      team: 'Atlanta Hawks',
      sending: [
        { player: 'Trae Young', cap_hit: 40064220 },
      ],
      total_outgoing_salary: 40064220,
      salary_match_check: {
        rule: 'Team above salary cap: outgoing + 25% + $250K',
      },
    },
    team2: {
      team: 'Chicago Bulls',
      sending: [
        { player: 'Zach LaVine', cap_hit: 43000000 },
      ],
      total_outgoing_salary: 43000000,
    },
  },
}

export default function VisualizationTestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Visualization Test Page</h1>
        <p className="text-zinc-400 mb-8">
          All 11 visualization components with fixture data. 12 sections total.
        </p>

        <Section id="viz-contract-timeline" label="ContractTimelineChart">
          <ContractTimelineChart data={fixtures.contractTimeline} />
        </Section>

        <Section id="viz-team-payroll" label="TeamPayrollChart">
          <TeamPayrollChart data={fixtures.teamPayroll} />
        </Section>

        <Section id="viz-player-radar" label="PlayerRadarChart">
          <PlayerRadarChart data={fixtures.playerRadar} />
        </Section>

        <Section id="viz-career-trajectory" label="CareerTrajectoryChart">
          <CareerTrajectoryChart data={fixtures.careerTrajectory} />
        </Section>

        <Section id="viz-stat-leaders" label="StatLeadersChart">
          <StatLeadersChart data={fixtures.statLeaders} />
        </Section>

        <Section id="viz-roster" label="RosterCard">
          <RosterCard data={fixtures.roster} />
        </Section>

        <Section id="viz-player-profile" label="PlayerProfileCard">
          <PlayerProfileCard data={fixtures.playerProfile} />
        </Section>

        <Section id="viz-cap-info" label="CapInfoCard">
          <CapInfoCard data={fixtures.capInfo} />
        </Section>

        <Section id="viz-salary-match-valid" label="SalaryMatchCard (Valid)">
          <SalaryMatchCard data={fixtures.salaryMatchValid} />
        </Section>

        <Section id="viz-salary-match-invalid" label="SalaryMatchCard (Invalid)">
          <SalaryMatchCard data={fixtures.salaryMatchInvalid} />
        </Section>

        <Section id="viz-exceptions" label="ExceptionsCard">
          <ExceptionsCard data={fixtures.exceptions} />
        </Section>

        <Section id="viz-trade-analysis" label="TradeAnalysisCard">
          <TradeAnalysisCard data={fixtures.tradeAnalysis} />
        </Section>
      </div>
    </div>
  )
}
