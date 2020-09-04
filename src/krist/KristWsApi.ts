import { KristConnectionService } from "./KristConnectionService";
import { KristWsMessageGetWorkResponse, KristWsMessageGetMeResponse, KristWsMessageLoginResponse, KristWsMessageLogoutResponse } from "./types/ws/KristWsMessages";

export class KristWsApi {
  constructor(private conn: KristConnectionService) {}

  async getWork(): Promise<KristWsMessageGetWorkResponse> {
    return this.conn.sendMessage("work") as Promise<KristWsMessageGetWorkResponse>;
  } 

  async getMe(): Promise<KristWsMessageGetMeResponse> {
    return this.conn.sendMessage("me") as Promise<KristWsMessageGetMeResponse>;
  } 

  async login(privatekey: string): Promise<KristWsMessageLoginResponse> {
    return this.conn.sendMessage("login", { privatekey }) as Promise<KristWsMessageLoginResponse>;
  } 

  async logout(): Promise<KristWsMessageLogoutResponse> {
    return this.conn.sendMessage("logout") as Promise<KristWsMessageLogoutResponse>;
  } 
}
