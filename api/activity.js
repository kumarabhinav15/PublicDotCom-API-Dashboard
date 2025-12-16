
export default function handler(req, res) {
  const now = Date.now();
  const events = [
    {
      id: "evt-1",
      type: "ORDER",
      timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
      description: "Buy AAPL filled",
      orderId: "ord-101",
      symbol: "AAPL",
      side: "BUY",
      quantity: 10,
      filledQuantity: 10,
      price: 187.32,
      orderType: "MARKET",
      status: "FILLED"
    },
    {
      id: "evt-2",
      type: "DIVIDEND",
      timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      description: "Dividend received from VTI",
      amount: 12.48,
      currency: "USD"
    },
    {
      id: "evt-3",
      type: "TRANSFER",
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      description: "Cash deposit",
      amount: 500.00,
      currency: "USD"
    },
    {
      id: "evt-4",
      type: "FEE",
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      description: "Regulatory fee",
      amount: -1.25,
      currency: "USD"
    }
  ];
  res.status(200).json(events);
}
