from typing import Dict, Any, List


def compute_priority_score(village: Dict[str, Any], severity: float) -> float:
    population = float(village.get("population", 0) or 0)
    elderly_population = float(village.get("elderlyPopulation", 0) or 0)
    vulnerability_index = float(village.get("vulnerabilityIndex", 0) or 0)
    nearest_hospital_distance = float(village.get("nearestHospitalDistance", 0) or 0)
    available_resources = float(village.get("availableResources", 0) or 0)
    max_resources_capacity = float(village.get("maxResourcesCapacity", 1) or 1)

    max_population_reference = float(village.get("maxPopulationReference", 10000) or 10000)

    population_score = population / max_population_reference if max_population_reference > 0 else 0
    elderly_score = elderly_population / population if population > 0 else 0
    severity_score = float(severity) / 4.0
    distance_score = min(nearest_hospital_distance / 50.0, 1.0)
    availability_score = 1.0 - min(available_resources / max_resources_capacity, 1.0)
    vulnerability_score = vulnerability_index

    priority_score = (
        0.25 * severity_score
        + 0.20 * elderly_score
        + 0.15 * population_score
        + 0.15 * distance_score
        + 0.15 * vulnerability_score
        + 0.10 * availability_score
    )
    return float(priority_score)


def allocate_resources(payload: Dict[str, Any]) -> Dict[str, Any]:
    requests: List[Dict[str, Any]] = payload.get("requests", [])
    ambulances: List[Dict[str, Any]] = payload.get("ambulances", [])

    scored_requests: List[Dict[str, Any]] = []
    for r in requests:
        village = r.get("village")
        if not village:
            continue
        severity = r.get("severity", 0)
        score = compute_priority_score(village, severity)
        scored_requests.append(
            {
                "id": r.get("id"),
                "severity": severity,
                "village": village,
                "priorityScore": score,
            }
        )

    scored_requests.sort(key=lambda x: x["priorityScore"], reverse=True)

    assignments: List[Dict[str, Any]] = []
    ambulance_ids = [a.get("id") for a in ambulances]

    for req in scored_requests:
        if not ambulance_ids:
            break
        amb_id = ambulance_ids.pop(0)
        assignments.append(
            {
                "requestId": req["id"],
                "ambulanceId": amb_id,
                "priorityScore": req["priorityScore"],
                "villageName": req["village"].get("name"),
            }
        )

    return {
        "requestsRanked": scored_requests,
        "assignments": assignments,
        "unassignedRequests": [r for r in scored_requests if r["id"] not in {a["requestId"] for a in assignments}],
        "availableAmbulancesRemaining": ambulance_ids,
    }

