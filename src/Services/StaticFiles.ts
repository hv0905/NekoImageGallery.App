import { Environment } from "../environment";

export function transformUrl(url: string, absolute = false): string {
    if (url.startsWith('/')) {
      if (absolute && Environment.ApiUrl.startsWith('/')) {
        return window.location.origin + Environment.ApiUrl + url;
      } else {
        return Environment.ApiUrl + url;
      }
      
    }
    return url;
}