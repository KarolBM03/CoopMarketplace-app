import { Role } from "@prisma/client";
import prisma from "../database/prisma";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class PrismaUserRepository implements UserRepository {
  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async create(data: Partial<User>): Promise<User> {
    return (await prisma.user.create({
      data: {
        fullName: data.fullName as string,
        email: this.normalizeEmail(data.email as string),
        password: data.password as string,
        phone: data.phone ?? null,
        role: (data.role as Role) || Role.CUSTOMER,
        isVerified: data.isVerified ?? true,
        isBlocked: data.isBlocked ?? false,
        cooperativeMemberId: data.cooperativeMemberId ?? null,
        memberNumber: data.memberNumber ?? null,
        isCooperativeMember: data.isCooperativeMember ?? false,
        cooperativeStatus: data.cooperativeStatus ?? null,
        acceptedTerms: data.acceptedTerms ?? false,
        sellerStatus: data.sellerStatus ?? null,
        storeName: data.storeName ?? null,
        mainCategory: data.mainCategory ?? null,
        city: data.city ?? null,
        documentId: data.documentId ?? null,
        bankAccount: data.bankAccount ?? null,
        identityImageUrl: data.identityImageUrl ?? null,
      },
    })) as User;
  }

  async findById(id: string): Promise<User | null> {
    return (await prisma.user.findUnique({
      where: { id },
    })) as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await prisma.user.findFirst({
      where: {
        email: {
          equals: this.normalizeEmail(email),
          mode: "insensitive",
        },
      },
    })) as User | null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return (await prisma.user.update({
      where: { id },
      data: data as any,
    })) as User;
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return (await prisma.user.findFirst({
      where: {
        refreshToken: token,
      },
    })) as User | null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    return (await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    })) as User | null;
  }
}



