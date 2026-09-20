import { formModal } from "./FormModal.js";
import { allOrders } from "../../store/posData.js";

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash" },
  { id: "card", name: "Card" },
  { id: "transfer", name: "Transfer" },
];

const enabledMethods = { cash: true, card: true, transfer: true };

class PaymentModal {
  async show({ title = "New Payment" } = {}) {
    const unpaidOrders = allOrders.filter((o) => o.status === "served");

    const orderOptions = [
      { value: "", label: "Select an order..." },
      ...unpaidOrders.map((order) => ({
        value: order.fullId,
        label: `Order #${order.id} - Table ${order.table} ($${order.total.toFixed(2)})`,
      })),
    ];

    const methodOptions = PAYMENT_METHODS.filter((m) => enabledMethods[m.id]).map((m) => ({
      value: m.id,
      label: m.name,
    }));

    return formModal.show({
      title,
      width: 380,
      confirmText: "Create Payment",
      fields: [
        {
          id: "orderId",
          label: "Order",
          type: "select",
          required: true,
          placeholder: "Select an order...",
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
          label: "Payment Method",
          type: "select",
          required: true,
          placeholder: "Select method...",
          options: methodOptions,
          fullWidth: true,
        },
        {
          id: "amount",
          label: "Amount",
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
