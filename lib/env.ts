export const env = (() => {
  const explicit =
    process.env.MOCK_PUBLIC_API ??
    process.env.NEXT_PUBLIC_MOCK_PUBLIC_API ??
    process.env.MOCK_PUBLIC_API?.toString();

  // Safe default: in non-production, run mock mode unless explicitly disabled.
  const mock =
    explicit !== undefined ? explicit === 'true' : process.env.NODE_ENV !== 'production';

  return {
    mock,
    publicBaseUrl: process.env.PUBLIC_API_BASE_URL ?? 'https://api.public.com',
    publicSecretToken: process.env.PUBLIC_SECRET_TOKEN ?? '',
    personalAccessTokenTtlMinutes: Number(process.env.PUBLIC_ACCESS_TOKEN_TTL_MINUTES ?? '15'),

    // Trading safety gates (server-side)
    enableTrading: process.env.ENABLE_TRADING === 'true',
    tradingUnlockCode: process.env.TRADING_UNLOCK_CODE ?? ''
  };
})();