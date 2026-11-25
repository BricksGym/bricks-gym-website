import { agreementPlainText } from "@/content/agreement";

/** Plain-text agreement to copy into Club Systems' agreement template. */
export function GET() {
  return new Response(agreementPlainText(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
