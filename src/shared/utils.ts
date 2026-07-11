export const compactObject = <T extends Record<string, unknown>>(
  value: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;

export const firstOrThrow = <T>(rows: T[], message: string): T => {
  const row = rows[0];
  if (row === undefined) {
    throw new Error(message);
  }

  return row;
};

export const toPrice = (cents: bigint): string => {
  const whole = cents / 100n;
  const decimal = (cents % 100n).toString().padStart(2, "0");
  return `${whole}.${decimal}`;
};

export const toCents = (price: string): bigint => {
  const [whole = "0", decimal = ""] = price.split(".");
  return BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0").slice(0, 2));
};

export const sumPrices = (prices: string[]): string =>
  toPrice(prices.reduce((sum, price) => sum + toCents(price), 0n));

export const multiplyPrice = (price: string, quantity: number): string =>
  toPrice(toCents(price) * BigInt(quantity));
