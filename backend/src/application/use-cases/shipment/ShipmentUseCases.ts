import { ShipmentRepository } from "../../../domain/repositories/ShipmentRepository";

export class CreateShipmentUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(data: any) {
    return this.shipmentRepository.createForOrder(data);
  }
}

export class UpdateShipmentStatusUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(data: any) {
    return this.shipmentRepository.updateStatus(data);
  }
}

export class GetCustomerShipmentsUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(customerId: string) {
    return this.shipmentRepository.findByCustomer(customerId);
  }
}

export class GetSellerShipmentsUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(sellerId: string) {
    return this.shipmentRepository.findBySeller(sellerId);
  }
}

export class GetAdminShipmentsUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute() {
    return this.shipmentRepository.findForAdmin();
  }
}

export class StartShipmentTrackingUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(data: any) {
    return this.shipmentRepository.startTracking(data);
  }
}

export class UpdateShipmentLocationUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(data: any) {
    return this.shipmentRepository.updateLocation(data);
  }
}

export class StopShipmentTrackingUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  execute(data: any) {
    return this.shipmentRepository.stopTracking(data);
  }
}



