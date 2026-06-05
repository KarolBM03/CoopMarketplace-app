import bcrypt from "bcrypt";
import { RegisterUserDTO } from "../../dto/auth/AuthDTO";
import { UserRole } from "../../../domain/enums/UserRole";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: RegisterUserDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Su correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: UserRole.CUSTOMER,
      isVerified: false,
      isBlocked: false,
    });

    return user;
  }
}



