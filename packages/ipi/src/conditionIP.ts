type Repr32 = string;
type Repr64 = [Repr32, Repr32];
type Repr128 = [Repr64, Repr64];
type ReprSMTH = Repr32 | Repr64 | Repr128;

interface MathType<T extends ReprSMTH> {
  eq: (a: T, b: T) => string;
  lt: (a: T, b: T) => string;
  gt: (a: T, b: T) => string;
}

const eq = <T extends ReprSMTH>(
  [LOWER, UPPER]: [T, T],
  [COMPARE_LOWER, COMPARE_UPPER]: [T, T],
  math: MathType<T>
) => `(${math.eq(LOWER, COMPARE_LOWER)} AND ${math.eq(UPPER, COMPARE_UPPER)})`;

const gt = <T extends ReprSMTH>(
  [LOWER, UPPER]: [T, T],
  [COMPARE_LOWER, COMPARE_UPPER]: [T, T],
  math: MathType<T>
) =>
  `iif(${math.eq(UPPER, COMPARE_UPPER)}, ${math.gt(
    LOWER,
    COMPARE_LOWER
  )}, ${math.gt(UPPER, COMPARE_UPPER)})`;
const lt = <T extends ReprSMTH>(
  [LOWER, UPPER]: [T, T],
  [COMPARE_LOWER, COMPARE_UPPER]: [T, T],
  math: MathType<T>
) =>
  `iif(${math.eq(UPPER, COMPARE_UPPER)}, ${math.lt(
    LOWER,
    COMPARE_LOWER
  )}, ${math.lt(UPPER, COMPARE_UPPER)})`;

const gteq = <T extends ReprSMTH>(a: [T, T], b: [T, T], math: MathType<T>) =>
  `(${gt(a, b, math)} OR ${eq(a, b, math)})`;
const lteq = <T extends ReprSMTH>(a: [T, T], b: [T, T], math: MathType<T>) =>
  `(${lt(a, b, math)} OR ${eq(a, b, math)})`;

const math32: MathType<Repr32> = {
  eq: (a: string, b: string) => `(${a} == ${b})`,
  lt: (a: string, b: string) => `(${a} < ${b})`,
  gt: (a: string, b: string) => `(${a} > ${b})`,
};

const math64: MathType<Repr64> = {
  eq: (a, b) => eq(a, b, math32),
  lt: (a, b) => lt(a, b, math32),
  gt: (a, b) => gt(a, b, math32),
};

const var_range_start: Repr128 = [
  ["range_start4", "range_start3"],
  ["range_start2", "range_start1"],
];

const var_range_end: Repr128 = [
  ["range_end4", "range_end3"],
  ["range_end2", "range_end1"],
];

const bind_var_ip: Repr128 = [
  [":ip4", ":ip3"],
  [":ip2", ":ip1"],
];

const conditionIP =
  lteq(var_range_start, bind_var_ip, math64) +
  " AND " +
  gteq(var_range_end, bind_var_ip, math64);

export default conditionIP;
