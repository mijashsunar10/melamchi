import type { PaymentMethod } from "@/types/catalog";

export const paymentMethods: PaymentMethod[] = [
  { id: "esewa", name: "eSewa", description: "Pay with your eSewa wallet", color: "#60BB46" },
  { id: "khalti", name: "Khalti", description: "Pay with Khalti wallet or bank", color: "#5C2D91" },
  { id: "imepay", name: "IME Pay", description: "Pay with IME Pay wallet", color: "#E31E24" },
  { id: "fonepay", name: "Fonepay QR", description: "Scan with any mobile banking app", color: "#D7282F" },
  { id: "bank", name: "Bank Transfer", description: "Direct transfer, verified manually", color: "#1D3FBF" },
  { id: "wallet", name: "TOPX Wallet", description: "Pay instantly from your balance", color: "#FF4D1A" },
];
