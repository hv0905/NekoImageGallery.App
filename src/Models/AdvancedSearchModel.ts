export enum AdvancedSearchMode {
  average = 'average',
  best = 'best',
}

export interface AdvancedSearchModel {
  criteria: string[];
  negative_criteria: string[];
  mode: AdvancedSearchMode;
}
