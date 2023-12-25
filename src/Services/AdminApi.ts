import { NekoProtocol } from "../Models/ApiResponse";
import { getClient } from "./Base";

export function deleteImage(id: string) {
    return getClient().delete<NekoProtocol>(`/admin/delete/${id}`);
}

export function updateOpt(id: string, starred: boolean) {
    return getClient().put<NekoProtocol>(`/admin/update_opt/${id}`, { starred });
}