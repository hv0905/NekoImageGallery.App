export interface HomeAuthorizationResponse {
  required: boolean;
  passed: boolean;
}

export interface HomeApiResponse {
  message: string;
  server_time: Date;
  wiki: Map<string, string>;
  authorization: HomeAuthorizationResponse;
  available_basis: string[];

}
