import type {
  AccountsResponse,
  PortfolioV2Response,
  QuotesResponse,
  OptionExpirationsResponse,
  OptionChainResponse,
  HistoryResponse,
  InstrumentRef
} from '@/types/public';

export const mock = {
  accounts(): AccountsResponse {
    return {
      accounts: [
        { accountId: 'mock-brokerage-001', accountType: 'BROKERAGE', optionsLevel: 'LEVEL_1' }
      ]
    };
  },

  portfolio(): PortfolioV2Response {
    return {
      equityValue: { amount: '123456.78', currency: 'USD' },
      buyingPower: { amount: '10234.56', currency: 'USD' },
      positions: [
        {
          symbol: 'VUG',
          type: 'EQUITY',
          quantity: '120',
          lastPrice: { amount: '300.12', currency: 'USD' },
          marketValue: { amount: '36014.40', currency: 'USD' },
          costBasis: { amount: '32000.00', currency: 'USD' },
          percentOfPortfolio: '29.2',
          instrumentGain: { amount: '4014.40', currency: 'USD' },
          positionDailyGain: { amount: '120.12', currency: 'USD' }
        },
        {
          symbol: 'VOO',
          type: 'EQUITY',
          quantity: '50',
          lastPrice: { amount: '450.33', currency: 'USD' },
          marketValue: { amount: '22516.50', currency: 'USD' },
          costBasis: { amount: '21000.00', currency: 'USD' },
          percentOfPortfolio: '18.2',
          instrumentGain: { amount: '1516.50', currency: 'USD' },
          positionDailyGain: { amount: '-30.50', currency: 'USD' }
        },
        {
          symbol: 'SMH',
          type: 'EQUITY',
          quantity: '40',
          lastPrice: { amount: '200.10', currency: 'USD' },
          marketValue: { amount: '8004.00', currency: 'USD' },
          costBasis: { amount: '7600.00', currency: 'USD' },
          percentOfPortfolio: '6.5',
          instrumentGain: { amount: '404.00', currency: 'USD' },
          positionDailyGain: { amount: '44.00', currency: 'USD' }
        }
      ],
      openOrders: [
        {
          orderId: 'mock-order-001',
          symbol: 'VUG',
          side: 'BUY',
          orderType: 'LIMIT',
          quantity: '5',
          limitPrice: { amount: '295.00', currency: 'USD' },
          status: 'NEW',
          createdAt: new Date(Date.now() - 8 * 60_000).toISOString()
        },
        {
          orderId: 'mock-order-002',
          symbol: 'SMH',
          side: 'SELL',
          orderType: 'MARKET',
          quantity: '2',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 22 * 60_000).toISOString()
        },
        {
          orderId: 'mock-order-003',
          symbol: 'VEA',
          side: 'BUY',
          orderType: 'LIMIT',
          quantity: '20',
          limitPrice: { amount: '49.10', currency: 'USD' },
          status: 'PARTIALLY_FILLED',
          createdAt: new Date(Date.now() - 65 * 60_000).toISOString()
        }
      ]};
  },

  quotes(instruments: InstrumentRef[]): QuotesResponse {
    const now = new Date().toISOString();
    return {
      quotes: instruments.map(i => {
        const base = mockPrice(i.symbol);
        const jitter = (Math.random() - 0.5) * base * 0.002;
        const last = base + jitter;
        return {
          symbol: i.symbol,
          type: i.type,
          last: { amount: last.toFixed(2), currency: 'USD' },
          bid: { amount: (last - 0.05).toFixed(2), currency: 'USD' },
          ask: { amount: (last + 0.05).toFixed(2), currency: 'USD' },
          volume: String(Math.floor(1_000_000 * Math.random())),
          timestamp: now
        };
      })
    };
  },

  expirations(): OptionExpirationsResponse {
    const today = new Date();
    const dates = [7, 14, 28, 56].map(d => {
      const x = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
      return x.toISOString().slice(0, 10);
    });
    return { expirationDates: dates };
  },

  chain(symbol: string, expirationDate: string): OptionChainResponse {
    const base = mockPrice(symbol);
    const strikes = [-0.1, -0.05, 0, 0.05, 0.1].map(m => Math.round(base * (1 + m)));
    const mk = (cp: 'C' | 'P', strike: number) => {
      const osi = `${symbol.padEnd(6, ' ')}${expirationDate.replaceAll('-', '').slice(2)}${cp}${String(strike * 1000).padStart(8, '0')}`;
      const mid = Math.max(0.25, Math.abs(base - strike) * 0.05 + 1.0);
      return {
        osiSymbol: osi,
        strike: String(strike),
        bid: { amount: (mid - 0.05).toFixed(2), currency: 'USD' },
        ask: { amount: (mid + 0.05).toFixed(2), currency: 'USD' },
        last: { amount: mid.toFixed(2), currency: 'USD' },
        openInterest: String(Math.floor(5000 * Math.random()))
      };
    };

    return {
      calls: strikes.map(s => mk('C', s)),
      puts: strikes.map(s => mk('P', s))
    };
  },

  history(): HistoryResponse {
    const now = Date.now();
    const events = Array.from({ length: 20 }).map((_, i) => {
      const t = new Date(now - i * 6 * 60 * 60 * 1000).toISOString();
      return {
        timestamp: t,
        type: i % 3 === 0 ? 'FILL' : i % 3 === 1 ? 'DIVIDEND' : 'DEPOSIT',
        description: i % 3 === 0 ? 'Filled BUY 5 VUG @ 295.00' : i % 3 === 1 ? 'Dividend VOO' : 'Deposit'
      };
    });
    return { events, nextToken: 'mock-next-token' };
  }
};

function mockPrice(symbol: string) {
  const map: Record<string, number> = {
    SPY: 500,
    QQQ: 420,
    IWM: 210,
    VUG: 300,
    VOO: 450,
    SMH: 200
  };
  return map[symbol] ?? 100;
}
