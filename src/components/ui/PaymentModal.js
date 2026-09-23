import { formModal } from "./FormModal.js";
import { allOrders } from "../../store/posData.js";

const PAYMENT_METHODS = [
  { id: "cash", name: "Efectivo" },
  { id: "card", name: "Tarjeta" },
  { id: "transfer", name: "Transferencia" },
];

const enabledMethods = { cash: true, card: true, transfer: true };

class PaymentModal {
  async show({ title = "Nuevo pago" } = {}) {
    const unpaidOrders = allOrders.filter((o) => o.status === "served");

    const orderOptions = [
      { value: "", label: "Seleccionar una orden..." },
      ...unpaidOrders.map((order) => ({
        value: order.fullId,
        label: `Orden #${order.id} - Mesa ${order.tableNumber || order.table} ($${order.total.toFixed(2)})`,
      })),
    ];

    const methodOptions = PAYMENT_METHODS.filter((m) => enabledMethods[m.id]).map((m) => ({
      value: m.id,
      label: m.name,
    }));

    return formModal.show({
      title,
      width: 380,
      confirmText: "Registrar pago",
      fields: [
        {
          id: "orderId",
          label: "Orden",
          type: "select",
          required: true,
          placeholder: "Seleccionar una orden...",
          options: orderOptions,
          fullWidth: true,
          onChange: (val, _formData, setFieldValue) => {
            const order = unpaidOrders.find((o) => o.fullId === val);
            if (order && order.total) {
              setFieldValue("amount", order.total.toFixed(2));
            }
          },
        },
        {
          id: "method",
          label: "Método de pago",
          type: "select",
          required: true,
          placeholder: "Seleccionar método...",
          options: methodOptions,
          fullWidth: true,
        },
        {
          id: "amount",
          label: "Monto",
          type: "number",
          required: true,
          placeholder: "0.00",
          step: "0.01",
          min: "0.01",
          fullWidth: true,
        },
      ],
    });
  }
}

export const paymentModal = new PaymentModal();
