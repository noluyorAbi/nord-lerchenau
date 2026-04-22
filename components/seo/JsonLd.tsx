type Props = {
  data: unknown;
  id?: string;
};

/**
 * Inline JSON-LD block. Kept as a server component so the markup ships in
 * the initial HTML response — AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
 * don't execute JS, so client-rendered structured data is invisible to them.
 */
export function JsonLd({ data, id }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
