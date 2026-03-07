"""CBA (Collective Bargaining Agreement) tools — pure Python, no DB."""

# 2024-25 NBA salary cap thresholds
CAP_THRESHOLDS = {
    "salary_cap": 140_588_000,
    "luxury_tax": 170_814_000,
    "first_apron": 178_132_000,
    "second_apron": 188_931_000,
}

# Exception values (approximate 2024-25)
MLE_NON_TAXPAYER = 12_860_000
MLE_TAXPAYER = 5_180_000
BAE_VALUE = 4_536_000
ROOM_EXCEPTION = 7_720_000
MINIMUM_SALARY = 1_119_563


async def get_cap_info() -> dict:
    """Return current NBA salary cap thresholds and key values."""
    return {
        "season": "2024-25",
        "salary_cap": CAP_THRESHOLDS["salary_cap"],
        "luxury_tax_line": CAP_THRESHOLDS["luxury_tax"],
        "first_apron": CAP_THRESHOLDS["first_apron"],
        "second_apron": CAP_THRESHOLDS["second_apron"],
        "mid_level_exception_non_taxpayer": MLE_NON_TAXPAYER,
        "mid_level_exception_taxpayer": MLE_TAXPAYER,
        "bi_annual_exception": BAE_VALUE,
        "room_exception": ROOM_EXCEPTION,
        "minimum_salary": MINIMUM_SALARY,
    }


async def check_trade_salary_match(
    outgoing_salary: float, incoming_salary: float, team_over_cap: bool
) -> dict:
    """
    Validate whether a trade satisfies CBA salary-matching rules.

    Rules (simplified):
    - Under the cap: team can take back any amount up to cap space + outgoing
    - Over the cap but below first apron: can take back up to 125% + $100K of outgoing
    - Above first apron: can take back up to 110% + $100K of outgoing
    """
    if not team_over_cap:
        return {
            "valid": True,
            "rule": "Under cap — team has cap space to absorb salary",
            "outgoing": outgoing_salary,
            "incoming": incoming_salary,
        }

    # Over-cap trade rules
    threshold_125 = outgoing_salary * 1.25 + 100_000
    threshold_110 = outgoing_salary * 1.10 + 100_000

    if incoming_salary <= threshold_110:
        return {
            "valid": True,
            "rule": "Salary within 110% + $100K (works even above first apron)",
            "outgoing": outgoing_salary,
            "incoming": incoming_salary,
            "max_allowed_above_apron": threshold_110,
            "max_allowed_below_apron": threshold_125,
        }
    elif incoming_salary <= threshold_125:
        return {
            "valid": True,
            "rule": "Salary within 125% + $100K (works below first apron only)",
            "warning": "This trade does NOT work if team is above the first apron",
            "outgoing": outgoing_salary,
            "incoming": incoming_salary,
            "max_allowed": threshold_125,
        }
    else:
        return {
            "valid": False,
            "rule": "Incoming salary exceeds maximum allowed",
            "outgoing": outgoing_salary,
            "incoming": incoming_salary,
            "max_allowed_below_apron": threshold_125,
            "max_allowed_above_apron": threshold_110,
        }


async def get_available_exceptions(team_total_salary: float) -> dict:
    """Determine which salary exceptions are available based on team salary."""
    cap = CAP_THRESHOLDS["salary_cap"]
    tax = CAP_THRESHOLDS["luxury_tax"]
    first_apron = CAP_THRESHOLDS["first_apron"]
    second_apron = CAP_THRESHOLDS["second_apron"]

    exceptions = []

    if team_total_salary < cap:
        room = cap - team_total_salary
        exceptions.append({
            "name": "Cap Space",
            "value": room,
            "note": "Team is under the salary cap",
        })
        exceptions.append({
            "name": "Room Exception",
            "value": ROOM_EXCEPTION,
            "note": "Available to under-cap teams that use cap space",
        })
    else:
        if team_total_salary < tax:
            exceptions.append({
                "name": "Non-Taxpayer Mid-Level Exception",
                "value": MLE_NON_TAXPAYER,
                "note": "Full MLE for teams below the tax line",
            })
            exceptions.append({
                "name": "Bi-Annual Exception",
                "value": BAE_VALUE,
                "note": "Available to non-taxpayer teams",
            })
        elif team_total_salary < first_apron:
            exceptions.append({
                "name": "Taxpayer Mid-Level Exception",
                "value": MLE_TAXPAYER,
                "note": "Reduced MLE for taxpayer teams below first apron",
            })
        elif team_total_salary < second_apron:
            exceptions.append({
                "name": "Taxpayer Mid-Level Exception",
                "value": MLE_TAXPAYER,
                "note": "Available but with restrictions above first apron",
            })
        else:
            exceptions.append({
                "name": "No exceptions available",
                "value": 0,
                "note": "Team is above the second apron — severely restricted",
            })

    exceptions.append({
        "name": "Minimum Salary Exception",
        "value": MINIMUM_SALARY,
        "note": "Always available — can sign players to minimum contracts",
    })

    return {
        "team_total_salary": team_total_salary,
        "salary_cap": cap,
        "luxury_tax_line": tax,
        "first_apron": first_apron,
        "second_apron": second_apron,
        "over_cap": team_total_salary > cap,
        "in_luxury_tax": team_total_salary > tax,
        "above_first_apron": team_total_salary > first_apron,
        "above_second_apron": team_total_salary > second_apron,
        "available_exceptions": exceptions,
    }
