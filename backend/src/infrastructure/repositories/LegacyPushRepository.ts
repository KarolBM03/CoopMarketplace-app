import { PushRepository } from "../../domain/repositories/PushRepository";
import { savePushToken } from "../external-services/push.service";

export class LegacyPushRepository implements PushRepository {
  saveToken(data: { userId: string; token: string; platform?: string }) {
    return savePushToken(data);
  }
}



