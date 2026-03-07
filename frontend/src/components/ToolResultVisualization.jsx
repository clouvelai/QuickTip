import ContractTimelineChart from './visualizations/ContractTimelineChart'
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

const VISUALIZATIONS = {
  get_player_contract: ContractTimelineChart,
  get_team_cap_sheet: TeamPayrollChart,
  get_player_season_stats: PlayerRadarChart,
  get_player_career_stats: CareerTrajectoryChart,
  get_stat_leaders: StatLeadersChart,
  get_team_roster: RosterCard,
  get_player_profile: PlayerProfileCard,
  get_cap_info: CapInfoCard,
  check_trade_salary_match: SalaryMatchCard,
  get_available_exceptions: ExceptionsCard,
  analyze_trade: TradeAnalysisCard,
}

export default function ToolResultVisualization({ toolCall }) {
  if (!toolCall.result || toolCall.result.error) return null

  const Component = VISUALIZATIONS[toolCall.name]
  if (!Component) return null

  return <Component data={toolCall.result} />
}
