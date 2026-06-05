import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import {
  createShipmentForOrder,
  getAdminShipments,
  getCustomerShipments,
  getSellerShipments,
  updateShipmentStatus,
} from "../external-services/shipment.service";

export class LegacyShipmentRepository implements ShipmentRepository {
  createForOrder(data: any) {
    return createShipmentForOrder(data);
  }

  updateStatus(data: any) {
    return updateShipmentStatus(data);
  }

  findByCustomer(customerId: string) {
    return getCustomerShipments(customerId);
  }

  findBySeller(sellerId: string) {
    return getSellerShipments(sellerId);
  }

  findForAdmin() {
    return getAdminShipments();
  }
}



