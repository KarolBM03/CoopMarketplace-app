import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import {
  createShipmentForOrder,
  getAdminShipments,
  getCustomerShipments,
  getSellerShipments,
  updateShipmentStatus,
  startShipmentTracking,
  stopShipmentTracking,
  updateShipmentLocation,
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

  startTracking(data: any) {
    return startShipmentTracking(data);
  }

  updateLocation(data: any) {
    return updateShipmentLocation(data);
  }

  stopTracking(data: any) {
    return stopShipmentTracking(data);
  }
}



