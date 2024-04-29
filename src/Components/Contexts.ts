import {createContext} from 'react';
import {HomeApiResponse} from '../Models/HomeApiResponse';
import {AppSettingsModel} from '../Models/AppSettings';

export const ApiInfo = createContext<HomeApiResponse | null>(null);

export const AppSettings = createContext<
  [AppSettingsModel, (newVal: AppSettingsModel) => void]
>([new AppSettingsModel(), () => undefined]);
