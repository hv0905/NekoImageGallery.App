export class SearchFilterOptions {
  constructor(
    public preferred_ratio?: number,
    public ratio_tolerance?: number,
    public min_width?: number,
    public min_height?: number,
    public starred?: boolean,
  ) {}
}
