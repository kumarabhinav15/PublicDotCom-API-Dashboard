export type InstrumentType = 'EQUITY' | 'OPTION' | 'INDEX' | 'UNDERLYING_SECURITY_FOR_INDEX_OPTION';

export type InstrumentRef = {
  symbol: string;
  type: InstrumentType;
};

export type Money = {
  amount: string; // decimal string
  currency: string;
};

export type AccountSummary = {
  accountId: string;
  accountType: string;
  optionsLevel?: string;
};

export type AccountsResponse = {
  accounts: AccountSummary[];
};

export type PortfolioPosition = {
  symbol: string;
  type: InstrumentType;
  quantity: string;
  lastPrice?: Money;
  marketValue?: Money;
  costBasis?: Money;
  percentOfPortfolio?: string;
  instrumentGain?: Money;
  positionDailyGain?: Money;
};

export type OpenOrder = {
  orderId: string;
  symbol: string;
  side: string;
  orderType: string;
  quantity?: string;
  limitPrice?: Money;
  status?: string;
  createdAt?: string;
};

export type PortfolioV2Response = {
  buyingPower?: Money;
  equityValue?: Money;
  positions?: PortfolioPosition[];
  openOrders?: OpenOrder[];
};

export type Quote = {
  symbol: string;
  type: InstrumentType;
  last?: Money;
  bid?: Money;
  ask?: Money;
  volume?: string;
  timestamp?: string;
};

export type QuotesResponse = {
  quotes: Quote[];
};

export type OptionExpirationsResponse = {
  expirationDates: string[];
};

export type OptionContract = {
  osiSymbol: string;
  strike?: string;
  bid?: Money;
  ask?: Money;
  last?: Money;
  openInterest?: string;
};

export type OptionChainResponse = {
  calls: OptionContract[];
  puts: OptionContract[];
};

export type Greeks = {
  osiSymbol: string;
  delta?: string;
  gamma?: string;
  theta?: string;
  vega?: string;
  impliedVolatility?: string;
};

export type GreeksResponse = {
  greeks: Greeks[];
};

export type HistoryEvent = {
  timestamp?: string;
  type?: string;
  description?: string;
};

export type HistoryResponse = {
  events: HistoryEvent[];
  nextToken?: string;
};
