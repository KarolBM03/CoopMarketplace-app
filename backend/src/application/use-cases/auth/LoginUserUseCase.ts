import bcrypt from "bcrypt";
import { LoginUserDTO } from "../../dto/auth/AuthDTO";
import { SellerStatus } from "../../../domain/enums/SellerStatus";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { sanitizeUser } from "../../../shared/utils/sanitizeUser";
import { generateToken } from "../../../shared/utils/generateToken";

export class LoginUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: LoginUserDTO) {
    const identifier = String(data.identifier || data.email || "").trim();
    const user = identifier.includes("@")
      ? await this.userRepository.findByEmail(identifier.toLowerCase())
      : await this.userRepository.findByDocumentId(identifier);

    if (!user) {
      throw new Error("Sus credenciales son inválidas");
    }

    if (user.isBlocked) {
      throw new Error("Usted esta bloqueado");
    }

    if (
      user.role !== "ADMIN" &&
      (!user.isCooperativeMember || !user.cooperativeMemberId)
    ) {
      throw new Error(
        "Debe ser socio de la cooperativa para iniciar sesion en CoopMarket",
      );
    }

    if (!user.isVerified) {
      throw new Error("Debe verificar su cuenta antes de iniciar sesión");
    }

    if (user.role === "SELLER" && user.sellerStatus !== SellerStatus.APPROVED) {
      throw new Error(
        "Su perfil de vendedor aun no ha sido aprobado, espere a que se lo aprueben",
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Sus credenciales son inválidas");
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id);

    await this.userRepository.update(user.id, {
      refreshToken,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
}



