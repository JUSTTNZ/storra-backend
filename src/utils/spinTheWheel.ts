// utils/spinWheel.ts

export interface SpinReward {
  name: string;
  type: "coins" | "points" | "spin_chance" | "diamond" | "item";
  amount?: number;
  weight: number; // Probability weight
}

/**
 * =============================================
 *   SPIN WHEEL REWARD TABLE (Weighted)
 * =============================================
 * Higher weight = more common
 * Lower weight = extremely rare
 */
export const SPIN_REWARDS: SpinReward[] = [
  { name: "1 Diamond", type: "diamond", amount: 1, weight: 60 },
  { name: "5 Diamonds", type: "diamond", amount: 5, weight: 30 },
  { name: "20 Diamonds", type: "diamond", amount: 20, weight: 10 },

  // ITEMS (Rare)
  { name: "Storra Sticker", type: "item", weight: 4 },
  { name: "Storra Shirt", type: "item", weight: 1 },          // Very rare
  { name: "₦100 Airtime", type: "item", weight: 0.5 },        // Extremely rare
  { name: "₦200 Airtime", type: "item", weight: 0.2 },        // SUPER rare

  // Bonus spins
  { name: "Free Spin", type: "spin_chance", amount: 1, weight: 4 },
];

/**
 * Weighted random reward generator
 */
export const getRandomReward = () => {
  const totalWeight = SPIN_REWARDS.reduce((acc, r) => acc + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const reward of SPIN_REWARDS) {
    if ((random -= reward.weight) <= 0) {
      return reward;
    }
  }

  return SPIN_REWARDS[0];
};

/**
 * Fallback small rewards (anti-abuse)
 */
export const SMALL_REWARDS: SpinReward[] = [
  { name: "1 Diamond", type: "diamond", amount: 1, weight: 70 },
  { name: "5 Diamonds", type: "diamond", amount: 5, weight: 30 },
];
