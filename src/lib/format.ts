/** Paise are the only money unit crossing the wire (API_CONTRACT.md §1). */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
