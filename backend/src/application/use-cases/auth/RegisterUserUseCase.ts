import bcrypt from "bcrypt";
import { RegisterUserDTO } from "../../dto/auth/AuthDTO";
import { UserRole } from "../../../domain/enums/UserRole";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import {
  createCooperativeMember,
  findCooperativeMemberByCedula,
} from "../../../infrastructure/external-services/cooperative.service";

const normalizeDocument = (documentId?: string) =>
  String(documentId || "").replace(/\D/g, "");

const getResponseData = (response: unknown) =>
  response && typeof response === "object" && "data" in response
    ? (response as { data?: any }).data
    : response;

const readCooperativeMember = (response: unknown) => {
  const data = getResponseData(response) || {};

  return {
    cooperativeMemberId: String(data.id || data.socioId || ""),
    memberNumber: data.memberNumber || data.numeroSocio || data.codigoSocio || null,
    cooperativeStatus:
      data.estadoDescripcion || data.cooperativeStatus || data.estado || "ACTIVE",
  };
};

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: RegisterUserDTO) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Su correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role =
      data.role === UserRole.SELLER
        ? UserRole.SELLER
        : data.role === UserRole.SERVICE_PROVIDER
          ? UserRole.SERVICE_PROVIDER
          : UserRole.CUSTOMER;
    const documentId = normalizeDocument(data.documentId);

    if (!documentId) {
      throw new Error("La cedula es obligatoria para registrarse en CoopMarket");
    }

    let cooperativeMember;

    try {
      cooperativeMember = readCooperativeMember(
        await findCooperativeMemberByCedula(documentId),
      );
    } catch {
      cooperativeMember = readCooperativeMember(
        await createCooperativeMember({
          fullName: data.fullName,
          email,
          phone: data.phone,
          identification: documentId,
          role,
        }),
      );
    }

    if (!cooperativeMember.cooperativeMemberId) {
      throw new Error("No se pudo vincular el socio de la cooperativa");
    }

    const user = await this.userRepository.create({
      fullName: data.fullName,
      email,
      password: hashedPassword,
      phone: data.phone,
      role,
      isVerified: false,
      isBlocked: false,
      acceptedTerms: data.acceptedTerms ?? false,
      cooperativeMemberId: cooperativeMember.cooperativeMemberId,
      memberNumber: cooperativeMember.memberNumber,
      isCooperativeMember: true,
      cooperativeStatus: cooperativeMember.cooperativeStatus,
      sellerStatus:
        role === UserRole.SELLER || role === UserRole.SERVICE_PROVIDER
          ? "PENDING"
          : null,
      storeName: data.storeName,
      mainCategory: data.mainCategory,
      city: data.city,
      documentId,
      bankAccount: data.bankAccount,
      identityImageUrl: data.identityImageUrl,
    });

    return user;
  }
}



