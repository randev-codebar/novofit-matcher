import { CustomerRecord } from "./types";

// 1. Preprocess name for comparison
export function preprocessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, "") // Remove special characters
    .replace(/\\s+/g, " ") // Normalize spaces
    .trim();
}

// 2. Calculate Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, j) =>
    Array.from({ length: a.length + 1 }, (_, i) =>
      j === 0 ? i : i === 0 ? j : 0
    )
  );

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// 3. Convert distance to a similarity percentage
function calculateSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return ((maxLength - distance) / maxLength) * 100;
}

// 4. Matching logic
type MatchResult = {
  review: Array<[CustomerRecord, CustomerRecord]>;
  requiresAction: Array<[CustomerRecord, CustomerRecord]>;
  unmatched: CustomerRecord[];
};

export function matchCustomers(
  excelA: CustomerRecord[],
  excelB: CustomerRecord[]
): MatchResult {
  const review: Array<[CustomerRecord, CustomerRecord]> = [];
  const requiresAction: Array<[CustomerRecord, CustomerRecord]> = [];
  const unmatched: CustomerRecord[] = [];

  // Map for O(1) exact lookups in excelB
  const processedBMap = new Map(
    excelB.map((recB) => [preprocessName(recB.name ?? ""), recB])
  );

  // Process each record from excelA
  excelA.forEach((recordA) => {
    const processedA = preprocessName(recordA.customerName ?? "");

    // 1) Exact match?
    if (processedBMap.has(processedA)) {
      review.push([recordA, processedBMap.get(processedA)!]);
      return;
    }

    // 2) Partial / Fuzzy match
    let bestMatch: { record: CustomerRecord; similarity: number } | null = null;

    // Pre-filter: only compare if there's some substring overlap
    // (Optional optimization if you have extremely large datasets)
    const candidates = Array.from(processedBMap.entries()).filter(
      ([name]) => processedA.includes(name) || name.includes(processedA)
    );

    // Evaluate similarity among filtered candidates
    for (const [name, recB] of candidates) {
      const similarity = calculateSimilarity(processedA, name);
      if (
        similarity >= 85 &&
        (!bestMatch || similarity > bestMatch.similarity)
      ) {
        bestMatch = { record: recB, similarity };
      }
    }

    if (bestMatch) {
      requiresAction.push([recordA, bestMatch.record]);
    } else {
      unmatched.push(recordA);
    }
  });

  return { review, requiresAction, unmatched };
}
