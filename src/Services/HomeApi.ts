import { HomeApiResponse } from '../Models/HomeApiResponse';
import { getClient } from './Base';

export async function Home() {
  const resp = await getClient().get<HomeApiResponse>('/');
  return resp.data;
}
