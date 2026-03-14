import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCustomerOrderEmail({
  email,
  orderId,
  items,
  total
}: {
  email: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const itemList = items
    .map((item) => `<li>${item.name} × ${item.quantity}</li>`)
    .join("");

  await resend.emails.send({
    from: "NeoStep <orders@neostep.com>",
    to: email,
    subject: `NeoStep Order Confirmation - ${orderId}`,
    html: `
      <h2>Thank you for your order</h2>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <h3>Items</h3>
      <ul>
        ${itemList}
      </ul>

      <p><strong>Total:</strong> $${total}</p>

      <p>Your order is being processed. You will receive shipping information soon.</p>

      <p>NeoStep Research Compounds</p>
    `
  });
}

export async function sendAdminOrderNotification({
  orderId,
  email,
  items,
  total
}: {
  orderId: string;
  email: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const itemList = items
    .map((item) => `<li>${item.name} × ${item.quantity}</li>`)
    .join("");

if (!process.env.RESEND_API_KEY) {
  console.log("Email skipped: RESEND_API_KEY not configured");
  return;
}

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_ORDER_EMAIL!,
    subject: `New NeoStep Order - ${orderId}`,
    html: `
      <h2>New Order Received</h2>

      <p><strong>Customer:</strong> ${email}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>

      <h3>Items</h3>
      <ul>
        ${itemList}
      </ul>

      <p><strong>Total:</strong> $${total}</p>
    `
  });
}