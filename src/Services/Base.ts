import axios, { AxiosInstance } from 'axios';
import { Environment } from '../environment';

let apiClient: AxiosInstance | null;

export function getClient() {
  if (!apiClient) {
    const token = localStorage.getItem('access-token');
    let headers = {};
    if (token) {
      headers = {
        'X-Access-Token': token,
      };
    }
    apiClient = axios.create({
      baseURL: Environment.ApiUrl,
      headers: headers,
    });
  }

  return apiClient;
}

export function resetClient() {
  apiClient = null;
}
