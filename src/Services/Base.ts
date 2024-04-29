import axios, {AxiosInstance} from 'axios';
import {Environment} from '../environment';
import {loadFromLocalStorage} from '../Models/AppSettings';

let apiClient: AxiosInstance | null;

export function getClient() {
  if (!apiClient) {
    const token = localStorage.getItem('access-token');
    const adminToken = loadFromLocalStorage().adminKey;
    let headers = {};
    if (token) {
      headers = {
        'X-Access-Token': token,
        'X-Admin-Token': adminToken,
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
