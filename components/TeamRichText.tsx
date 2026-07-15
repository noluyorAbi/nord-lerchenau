import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

// The project does not ship @tailwindcss/typography, so `prose-*` classes are
// inert. Team descriptions get explicit converters instead, keeping the type
// scale in the club's display/mono system. Tuned tighter than the article body
// (NewsRichText) since a team blurb is short-form.
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (node.tag === "h2") {
      return (
        <h2 className="mt-9 font-display text-[22px] font-black uppercase leading-[1.15] tracking-[-0.01em] text-nord-ink first:mt-0 md:text-[26px]">
          <span className="mb-2.5 block h-1 w-10 rounded-full bg-nord-gold" />
          {children}
        </h2>
      );
    }

    if (node.tag === "h3") {
      return (
        <h3 className="mt-7 font-display text-[18px] font-extrabold leading-[1.25] tracking-[-0.01em] text-nord-ink md:text-[20px]">
          {children}
        </h3>
      );
    }

    return (
      <h4 className="mt-6 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-nord-muted">
        {children}
      </h4>
    );
  },

  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (children.length === 0) return null;
    return (
      <p className="mt-4 text-[16px] leading-[1.7] text-nord-ink/85 first:mt-0 md:text-[17px]">
        {children}
      </p>
    );
  },

  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const className =
      "mt-4 space-y-1.5 pl-5 text-[16px] leading-[1.7] text-nord-ink/85 marker:text-nord-gold md:text-[17px]";
    return node.listType === "number" ? (
      <ol className={`list-decimal ${className}`}>{children}</ol>
    ) : (
      <ul className={`list-disc ${className}`}>{children}</ul>
    );
  },

  listitem: ({ node, nodesToJSX }) => (
    <li className="pl-1">{nodesToJSX({ nodes: node.children })}</li>
  ),

  quote: ({ node, nodesToJSX }) => (
    <blockquote className="mt-6 border-l-2 border-nord-gold py-1 pl-5 font-display text-[18px] font-bold leading-[1.35] text-nord-ink md:text-[20px]">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
});

export function TeamRichText({ data }: { data: SerializedEditorState }) {
  return <RichText converters={converters} data={data} disableContainer />;
}
