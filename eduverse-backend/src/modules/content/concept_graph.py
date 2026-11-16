"""
Concept Graph System for EduVerse Content Module.
Defines concept dependencies and utilities to traverse them.
"""

from typing import List, Optional, Set

# ==========================================
# STEP 1: DEFINE CONCEPT GRAPH DATA
# ==========================================

# Graph representing knowledge dependencies
# key = concept
# value = prerequisites or sub-concepts required to understand the key
concept_graph = {
    "photosynthesis": ["chlorophyll", "light_reaction", "calvin_cycle"],
    "chlorophyll": ["light_absorption"],
    "light_reaction": ["atp", "nadph"],
    "calvin_cycle": ["glucose_formation"]
}


# ==========================================
# STEP 2: BUILD GRAPH UTILITIES
# ==========================================

def normalize(concept: str) -> str:
    """Normalizes concept keys by lowercasing and replacing spaces with underscores."""
    return concept.lower().replace(" ", "_") if concept else concept


def get_prerequisites(concept: str) -> List[str]:
    """
    Returns immediate dependencies for a given concept.
    """
    concept = normalize(concept)
    return concept_graph.get(concept, [])


def get_all_dependencies(concept: str, visited: Optional[Set[str]] = None) -> List[str]:
    """
    Recursively returns the full dependency chain for a given concept.
    Avoids infinite recursion by tracking visited nodes.
    """
    concept = normalize(concept)
    if visited is None:
        visited = set()
        
    if concept in visited:
        return []
        
    visited.add(concept)
    
    dependencies = []
    immediate_prereqs = get_prerequisites(concept)
    
    for prereq in immediate_prereqs:
        dependencies.append(prereq)
        dependencies.extend(get_all_dependencies(prereq, visited))
        
    # Deduplicate while preserving order
    seen = set()
    result = []
    for d in dependencies:
        if d not in seen:
            seen.add(d)
            result.append(d)
            
    return result


def find_root_gap(concept: str) -> Optional[str]:
    """
    Returns the lowest-level missing concept (deepest prerequisite).
    Example: input "photosynthesis" -> output "light_absorption"
    """
    concept = normalize(concept)
    if concept not in concept_graph or not concept_graph[concept]:
        return concept
        
    MAX_DEPTH = 10
        
    def dfs_deepest(node: str, depth: int, visited: Set[str]):
        if node in visited or depth > MAX_DEPTH:
            return (node, depth)
            
        visited.add(node)
        prereqs = get_prerequisites(node)
        
        # If no prerequisites, this is a leaf (root gap)
        if not prereqs:
            return (node, depth)
            
        deepest_node = node
        max_depth = depth
        
        for prereq in prereqs:
            leaf, leaf_depth = dfs_deepest(prereq, depth + 1, visited)
            if leaf_depth > max_depth:
                max_depth = leaf_depth
                deepest_node = leaf
                
        return (deepest_node, max_depth)
        
    # Start DFS at depth 0
    root, _ = dfs_deepest(concept, 0, set())
    
    # Safety check: if somehow it returned itself but has prereqs, return first prereq
    if root == concept and get_prerequisites(concept):
        return get_prerequisites(concept)[0]
        
    return root


def get_dependency_path(concept: str) -> List[str]:
    """
    Returns a single path from concept to its deepest prerequisite.
    Enables traceability, e.g., Photosynthesis -> Chlorophyll -> Light Absorption.
    """
    concept = normalize(concept)
    path = []

    def dfs(node):
        path.append(node)
        prereqs = get_prerequisites(node)
        if not prereqs:
            return True
        for p in prereqs:
            if dfs(p):
                return True
        path.pop()
        return False

    dfs(concept)
    return path


# ==========================================
# STEP 3: WEAK CONCEPT RESOLUTION
# ==========================================

def resolve_learning_gap(weak_concept: str) -> dict:
    """
    Analyzes a weak concept to find its dependencies and determine 
    the best fallback concept (the root gap) to teach the student instead.
    """
    weak_concept = normalize(weak_concept)
    
    if not weak_concept:
        return {}

    all_deps = get_all_dependencies(weak_concept)
    root_gap = find_root_gap(weak_concept)
    path = get_dependency_path(weak_concept)

    return {
        "target_concept": weak_concept,
        "dependencies": all_deps,
        "weakest_prerequisite": root_gap,
        "fallback_concept": root_gap,
        "dependency_path": path
    }
