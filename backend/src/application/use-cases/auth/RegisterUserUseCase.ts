import bcrypt from "bcrypt";
import { RegisterUserDTO } from "../../dto/auth/AuthDTO";
import { UserRole } from "../../../domain/enums/UserRole";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: RegisterUserDTO) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Su correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role === UserRole.SELLER ? UserRole.SELLER : UserRole.CUSTOMER;

    const user = await this.userRepository.create({
      fullName: data.fullName,
      email,
      password: hashedPassword,
      phone: data.phone,
      role,
      isVerified: false,
      isBlocked: false,
      acceptedTerms: data.acceptedTerms ?? false,
      sellerStatus: role === UserRole.SELLER ? "PENDING" : null,
      storeName: data.storeName,
      mainCategory: data.mainCategory,
      city: data.city,
      documentId: data.documentId,
      bankAccount: data.bankAccount,
      identityImageUrl: data.identityImageUrl,
    });

    return user;
  }
}



