import { User } from "../entities/User";

export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDocumentId(documentId: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  findByRefreshToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
}



