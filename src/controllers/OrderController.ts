import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import logger from "../lib/logger";
import { PaymentError, ValidationError } from "../domain/errors";
import { OrderService } from "../services/OrderService";
import { OrderNotFoundError } from "../services/errors";

@injectable()
export class OrderController {
  constructor(@inject(OrderService) private orderService: OrderService) {}

  processOrder = async (req: Request, res: Response) => {
    try {
      const { customer, items, paymentMethod, paymentDetails } = req.body;
      const result = await this.orderService.placeOrder(
        customer,
        items,
        paymentMethod,
        paymentDetails,
      );
      return res.json({ message: "Pedido processado com sucesso", ...result });
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof PaymentError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error(`Erro ao processar pedido: ${error.message}`);
      return res.status(500).json({ error: "Erro interno" });
    }
  };

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(Number(id));
      res.status(200).json(order);
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        res.status(404).json({ message: error.message });
      }
    }
  }
}
