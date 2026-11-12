# AdaptiveLearn AI — Automated Testing & Verification Report

## Test Execution Summary
- **Test Runner**: Vitest v2.1.9
- **Status**: **100% PASSED (18 of 18 tests passed)**
- **Test Files**: 4 passed
- **Total Duration**: 2.24s

```
 ✓ tests/unit/trait-calculator.test.ts (3 tests) 3ms
 ✓ tests/unit/deterministic-evaluator.test.ts (6 tests) 4ms
 ✓ tests/unit/hint-machine.test.ts (7 tests) 5ms
 ✓ tests/unit/zod-schemas.test.ts (2 tests) 9ms

 Test Files  4 passed (4)
      Tests  18 passed (18)
```

---

## Detailed Test Case Verification

### 1. Progressive 2-Hint State Machine (`tests/unit/hint-machine.test.ts`)
- `awards full marks and finalizes when correct on attempt 1`: Verified that a correct first submission yields 100% of max marks, finalizes the question, and reveals no hints.
- `unlocks Hint 1 and awards 0 marks when incorrect on attempt 1`: Verified that an incorrect first attempt unlocks Hint 1, awards 0 marks so far, and advances state to `hint_1_unlocked`.
- `awards assisted marks (75%) and finalizes when correct on attempt 2`: Verified that solving the question with Hint 1 assistance applies the 25% penalty and awards 75% marks.
- `unlocks Hint 2 and awards 0 marks when incorrect on attempt 2`: Verified that an incorrect second attempt unlocks Hint 2 and advances state to `hint_2_unlocked`.
- `awards 50% marks and finalizes on attempt 3 if correct`: Verified that solving the question with Hint 2 assistance awards 50% marks and finalizes.
- `finalizes with 0 marks on attempt 3 if incorrect`: Verified that exhausting all 3 attempts finalizes the question with 0 marks.
- `strictly rejects any 4th attempt with an error`: Verified that backend state machine throws an explicit error when attempting a 4th submission.

### 2. Academic Trait Calculator (`tests/unit/trait-calculator.test.ts`)
- `correctly calculates 6 Bloom traits without double counting`: Verified weighted trait scoring formula across primary and secondary traits. Confirmed normalized denominator prevents double counting marks.
- `correctly assigns confidence levels based on evidence count and total marks`: Verified that traits with $\ge 3$ questions and $\ge 10$ marks receive `high` confidence, while traits with $< 2$ questions receive `low` confidence warnings.
- `calculates trait improvement in percentage points between baseline and final`: Verified $\Delta \text{Trait} = \text{Final} - \text{Baseline}$ (e.g. 50% to 90% yields +40 percentage points).

### 3. Deterministic Evaluator Engine (`tests/unit/deterministic-evaluator.test.ts`)
- `normalizes text properly`: Trims whitespace, lowercases, and removes boundary punctuation.
- `correctly evaluates MCQ single choice answers`: Matches exact string, lowercased string, or accepted variations.
- `correctly evaluates True/False questions`: Matches boolean text accurately.
- `correctly evaluates Numeric questions with tolerance`: Confirms $|s - c| \le \text{tolerance}$.
- `correctly evaluates Fill-in-the-blank with accepted variations`: Matches canonical terminology and accepted academic variations.
- `correctly evaluates Multiple-Select questions and computes partial credit`: Tests set equality and partial credit based on correct selections minus false positives.

### 4. AI Zod Schemas (`tests/unit/zod-schemas.test.ts`)
- `validates a complete question package`: Confirms valid JSON matching the full package schema passes with all properties.
- `rejects a question package missing required hints or answer key`: Confirms incomplete packages are rejected by Zod validation.

---

## Production Build Verification
- Command: `npm run build`
- Next.js Version: 14.2.35
- Static Pages Generated: **26 / 26 routes (100% build success)**
- Type Check Status: **0 TypeScript errors**

