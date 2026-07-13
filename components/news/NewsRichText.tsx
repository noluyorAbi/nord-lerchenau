import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

// The project does not ship @tailwindcss/typography, so `prose-*` classes are
// inert. Article body nodes get explicit converters instead, which also keeps
// the type scale in the club's display/mono system rather than a plugin's.
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (node.tag === "h2") {
      return (
        <h2 className="mt-14 font-display text-[26px] font-black uppercase leading-[1.1] tracking-[-0.01em] text-nord-ink first:mt-0 md:text-[32px]">
          <span className="mb-3 block h-1 w-12 rounded-full bg-nord-gold" />
          {children}
        </h2>
      );
    }

    if (node.tag === "h3") {
      return (
        <h3 className="mt-10 font-display text-[20px] font-extrabold leading-[1.2] tracking-[-0.01em] text-nord-ink md:text-[23px]">
          {children}
        </h3>
      );
    }

    return (
      <h4 className="mt-8 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-nord-muted">
        {children}
      </h4>
    );
  },

  // The first paragraph of an article carries the lead-in and gets more air.
  paragraph: ({ node, nodesToJSX, parent, childIndex }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (children.length === 0) return null;

    const isLead = parent.type === "root" && childIndex === 0;

    return (
      <p
        className={
          isLead
            ? "text-[19px] font-medium leading-[1.65] text-nord-ink md:text-[21px]"
            : "mt-5 text-[17px] leading-[1.75] text-nord-ink/85"
        }
      >
        {children}
      </p>
    );
  },

  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (node.listType === "number") {
      return (
        <ol className="mt-6 grid list-none gap-2 sm:grid-cols-3">{children}</ol>
      );
    }

    return (
      <ul className="mt-6 grid list-none gap-2 sm:grid-cols-3">{children}</ul>
    );
  },

  listitem: ({ node, nodesToJSX }) => (
    <li className="flex items-center gap-3 rounded-lg border border-nord-line bg-nord-paper-2 px-4 py-3 font-display text-[15px] font-extrabold uppercase tracking-[0.02em] text-nord-ink">
      <span className="h-2 w-2 shrink-0 rounded-full bg-nord-gold" />
      {nodesToJSX({ nodes: node.children })}
    </li>
  ),

  quote: ({ node, nodesToJSX }) => (
    <blockquote className="mt-8 border-l-2 border-nord-gold py-1 pl-5 font-display text-[20px] font-bold leading-[1.35] text-nord-ink md:text-[24px]">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
});

export function NewsRichText({ data }: { data: SerializedEditorState }) {
  return <RichText converters={converters} data={data} disableContainer />;
}
