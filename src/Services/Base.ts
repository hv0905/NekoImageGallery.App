import axios, {AxiosInstance} from 'axios';
import {Environment} from '../environment';
import {loadFromLocalStorage} from '../Models/AppSettings';

let apiClient: AxiosInstance | null;

export function getClient() {
  if (!apiClient) {
    const token = localStorage.getItem('access-token');
    const adminToken = loadFromLocalStorage().adminKey;
    apiClient = axios.create({
      baseURL: Environment.ApiUrl,
      headers: {
        'X-Access-Token': token ?? undefined,
        'X-Admin-Token': adminToken ?? undefined,
      },
      withCredentials: true
    });
  }

  return apiClient;
}

export function resetClient() {
  apiClient = null;
}
