export class ExperimentEngine {
  private assignments: Record<string, string> = {};

  /**
   * Deterministically assigns a user to a cohort based on their session/userId
   * and the experiment key.
   */
  public getCohort(experimentKey: string, identifier: string): "A" | "B" | "Control" {
    const cacheKey = `${experimentKey}_${identifier}`;
    if (this.assignments[cacheKey]) {
      return this.assignments[cacheKey] as "A" | "B" | "Control";
    }

    // Simple deterministic hash mock
    let hash = 0;
    for (let i = 0; i < cacheKey.length; i++) {
      hash = (hash << 5) - hash + cacheKey.charCodeAt(i);
      hash |= 0;
    }
    
    const bucket = Math.abs(hash) % 100;
    let cohort: "A" | "B" | "Control";

    if (bucket < 33) cohort = "A";
    else if (bucket < 66) cohort = "B";
    else cohort = "Control";

    this.assignments[cacheKey] = cohort;
    return cohort;
  }
}
