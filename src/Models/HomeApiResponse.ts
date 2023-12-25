export interface HomeAuthorizationResponse {
  required: boolean;
  passed: boolean;
}

export interface AdminAuthorizationRespose {
  available: boolean;
  passed: boolean;
}

export interface HomeApiResponse {
  message: string;
  server_time: Date;
  wiki: Map<string, string>;
  authorization: HomeAuthorizationResponse;
  admin_api: AdminAuthorizationRespose;
  available_basis: string[];

}
