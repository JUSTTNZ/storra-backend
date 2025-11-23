// utils/spinWheel.ts

export interface SpinReward {
  name: string;
  type: "coins" | "points" | "spin_chance" | "diamond" | "item";
  amount?: number;
  weight: number; // Higher = more common
}

/**
 * =============================================
 *   SPIN WHEEL REWARD TABLE (Weighted)
 * =============================================
 */
export const SPIN_REWARDS: SpinReward[] = [
  // Coins (most common)
  { name: "10 Coins", type: "coins", amount: 10, weight: 60 },
  { name: "20 Coins", type: "coins", amount: 20, weight: 40 },
  { name: "50 Coins", type: "coins", amount: 50, weight: 20 },

  // Diamonds (rarer)
  { name: "1 Diamond", type: "diamond", amount: 1, weight: 15 },
  { name: "5 Diamonds", type: "diamond", amount: 5, weight: 5 },

  // Free spin (rare)
  { name: "Free Spin", type: "spin_chance", amount: 1, weight: 8 },

  // Items (very rare)
  { name: "Storra Sticker", type: "item", weight: 3 },
  { name: "Storra Shirt", type: "item", weight: 1 },
  { name: "₦100 Airtime", type: "item", weight: 0.5 },
];

/**
 * Weighted random reward generator
 */
export const getRandomReward = (): SpinReward => {
  const totalWeight = SPIN_REWARDS.reduce((acc, r) => acc + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const reward of SPIN_REWARDS) {
    if ((random -= reward.weight) <= 0) {
      return reward;
    }
  }

  return SPIN_REWARDS[0]; // fallback
};

/**
 * Small rewards for anti-abuse or overflow spins
 */
export const SMALL_REWARDS: SpinReward[] = [
  { name: "10 Coins", type: "coins", amount: 10, weight: 70 },
  { name: "20 Coins", type: "coins", amount: 20, weight: 30 },
];
