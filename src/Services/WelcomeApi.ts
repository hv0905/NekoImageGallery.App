import {HomeApiResponse} from '../Models/HomeApiResponse';
import {getClient} from './Base';

export async function WelcomeApi() {
  const resp = await getClient().get<HomeApiResponse>('/');
  return resp.data;
}
