def calculate_match_score(candidate_skills, required_skills, exp_actual, exp_req):
    """
    Weighted scoring:
    Skills Match: 60%
    Experience Match: 25%
    Education Match: 10% (Static for now)
    Location Match: 5% (Static for now)
    """
    # Skills Match
    total_req = len(required_skills)
    matched = len([s for s in candidate_skills if s.lower() in [r.lower() for r in required_skills]])
    skill_score = (matched / total_req * 100) if total_req > 0 else 100
    
    # Experience Match
    exp_score = min(100, (exp_actual / exp_req * 100)) if exp_req > 0 else 100
    
    # Final Weighted Score
    final_score = (skill_score * 0.60) + (exp_score * 0.25) + (85 * 0.10) + (95 * 0.05)
    
    return int(final_score)
