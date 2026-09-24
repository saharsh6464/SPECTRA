def analyze(image, previous=None):
    return {
        "status": "heuristic",
        "typing_or_writing": None,
        "previous_available": previous is not None,
        "note": "Use rolling wrist motion + laptop proximity over consecutive ticks.",
    }
