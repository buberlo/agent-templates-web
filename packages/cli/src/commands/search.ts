import type { Content } from "../content";

export function search(content: Content, query: string) {
  const terms = query.toLowerCase().split(/\s+/);
  for (const entry of content.entries) {
    const doc = content.template(entry);
    const text = [entry.id, entry.title, ...entry.tags, doc.searchText, doc.body].join(" ").toLowerCase();
    if (terms.every((term) => text.includes(term))) console.log(`${entry.id}\t${entry.title}`);
  }
}
