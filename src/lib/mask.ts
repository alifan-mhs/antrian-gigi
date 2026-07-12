/** "Budi Santoso" -> "B**i S*****o" — keeps first/last letter per word so a
 * patient can still recognize their own name in a public list. */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word[0] + "*".repeat(word.length - 1);
      return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
    })
    .join(" ");
}
