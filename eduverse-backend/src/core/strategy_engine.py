def get_strategy_config(strategy_mode: str) -> dict:
    """
    Determines algorithmic offsets globally mapped from the active system configurations.
    """
    config = {
        "cooldown": 30.0,
        "high_offset": 0.0,
        "low_offset": 0.0
    }
    
    if strategy_mode == "conservative":
        # System waits longer dynamically, and limits mapping jumps tightly
        config["cooldown"] = 60.0
        config["high_offset"] = 0.15 
        config["low_offset"] = -0.15
        
    elif strategy_mode == "aggressive":
        # System rapidly triggers threshold breaks mapping frequently
        config["cooldown"] = 10.0
        config["high_offset"] = -0.15
        config["low_offset"] = 0.15

    elif strategy_mode == "demo":
        # Ultra-fast cooldown for live demonstrations
        config["cooldown"] = 5.0
        config["high_offset"] = -0.10
        config["low_offset"] = 0.10
        
    return config
