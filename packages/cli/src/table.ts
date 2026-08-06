/** Minimal fixed-width table renderer so the CLI stays dependency-light. */
export function renderTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((header, col) =>
    Math.max(header.length, ...rows.map((row) => row[col]?.length ?? 0)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, col) => cell.padEnd(widths[col])).join("  ");
  const divider = widths.map((w) => "-".repeat(w)).join("  ");
  return [line(headers), divider, ...rows.map(line)].join("\n");
}

export function formatUsd(value: number): string {
  if (value === 0) return "$0";
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}
