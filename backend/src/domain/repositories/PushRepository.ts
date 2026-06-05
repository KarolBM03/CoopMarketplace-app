export interface PushRepository {
  saveToken(data: { userId: string; token: string; platform?: string }): Promise<any>;
}



