interface ModelPricing {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

// Pricing per million tokens (https://docs.anthropic.com/en/docs/about-claude/pricing)
// Cache read = 10% of input, Cache write = 125% of input
export function getPricing(model: string): ModelPricing {
  if (model.includes("opus")) {
    return { input: 15.0, output: 75.0, cacheRead: 1.50, cacheWrite: 18.75 };
  } else if (model.includes("sonnet")) {
    return { input: 3.0, output: 15.0, cacheRead: 0.30, cacheWrite: 3.75 };
  } else if (model.includes("haiku")) {
    return { input: 1.0, output: 5.0, cacheRead: 0.10, cacheWrite: 1.25 };
  }
  // Default to Sonnet pricing
  return { input: 3.0, output: 15.0, cacheRead: 0.30, cacheWrite: 3.75 };
}

export function calculateCost(
  pricing: ModelPricing,
  input: number,
  output: number,
  cacheRead: number,
  cacheWrite: number,
): number {
  return (
    (input / 1_000_000) * pricing.input +
    (output / 1_000_000) * pricing.output +
    (cacheRead / 1_000_000) * pricing.cacheRead +
    (cacheWrite / 1_000_000) * pricing.cacheWrite
  );
}
