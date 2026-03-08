import TeamPayrollChart from './visualizations/TeamPayrollChart'
import PlayerRadarChart from './visualizations/PlayerRadarChart'
import CareerTrajectoryChart from './visualizations/CareerTrajectoryChart'
import StatLeadersChart from './visualizations/StatLeadersChart'
import RosterCard from './visualizations/RosterCard'
import PlayerProfileCard from './visualizations/PlayerProfileCard'
import CapInfoCard from './visualizations/CapInfoCard'
import SalaryMatchCard from './visualizations/SalaryMatchCard'
import ExceptionsCard from './visualizations/ExceptionsCard'
import TradeAnalysisCard from './visualizations/TradeAnalysisCard'
import BdlCapCard from './visualizations/BdlCapCard'
import TradeUrlCard from './visualizations/TradeUrlCard'
import SalaryMatchesCard from './visualizations/SalaryMatchesCard'

const VISUALIZATIONS = {
  // BDL Trade Machine tools
  bdl_get_team_roster: TeamPayrollChart,
  bdl_get_team_cap: BdlCapCard,
  bdl_validate_trade: TradeAnalysisCard,
  bdl_build_trade_url: TradeUrlCard,
  bdl_find_salary_matches: SalaryMatchesCard,
  // Stats & profile tools
  get_player_season_stats: PlayerRadarChart,
  get_player_career_stats: CareerTrajectoryChart,
  get_stat_leaders: StatLeadersChart,
  get_player_profile: PlayerProfileCard,
  // CBA tools
  get_cap_info: CapInfoCard,
  check_trade_salary_match: SalaryMatchCard,
  get_available_exceptions: ExceptionsCard,
}

export default function ToolResultVisualization({ toolCall }) {
  if (!toolCall.result || toolCall.result.error) return null

  const Component = VISUALIZATIONS[toolCall.name]
  if (!Component) return null

  return <Component data={toolCall.result} />
}
