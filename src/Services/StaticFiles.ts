import { Environment } from "../environment";

export function transformUrl(url: string) {
    if (url.startsWith('/')) {
      return Environment.ApiUrl + url;
    }
    return url;
}