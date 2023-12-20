import { createContext } from 'react';
import { HomeApiResponse } from '../Models/HomeApiResponse';


export const ApiInfo = createContext<HomeApiResponse | null>(null);
