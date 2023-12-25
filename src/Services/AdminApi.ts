import { NekoProtocol } from "../Models/ApiResponse";
import { getClient } from "./Base";

export function deleteImage(id: string) {
    return getClient().delete<NekoProtocol>(`/admin/delete/${id}`);
}