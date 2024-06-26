export class AppSettingsModel {
  public useFilter = false;
  public useAdminPortal = false;
  public adminKey = '';

  public showInfoBar = false;
  public autoPaging = true;
}

export function saveSettingsToLocalStorage(context: AppSettingsModel) {
  localStorage.setItem('AppSettings', JSON.stringify(context));
}

export function loadFromLocalStorage(): AppSettingsModel {
  const settings = localStorage.getItem('AppSettings');
  if (settings) {
    return Object.assign(
      new AppSettingsModel(),
      JSON.parse(settings)
    ) as AppSettingsModel;
  }
  return new AppSettingsModel();
}
