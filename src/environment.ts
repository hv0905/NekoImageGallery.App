export const Environment = {
  ApiUrl: import.meta.env.VITE_API_URL as string,
  Production: import.meta.env.PROD,
  AppDisplayName: (import.meta.env.VITE_APP_DISPLAY_NAME as string) || 'Neko Image Gallery',
};
