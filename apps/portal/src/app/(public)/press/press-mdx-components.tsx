import type { MDXComponents } from "mdx/types";

export const pressBaselComponents: MDXComponents = {
    h1: (props) => (
        <h1
            className="text-3xl md:text-4xl font-black tracking-tight mb-6"
            {...props}
        />
    ),
    h2: (props) => (
        <h2
            className="text-xl md:text-2xl font-black tracking-tight mt-10 mb-4"
            {...props}
        />
    ),
    h3: (props) => (
        <h3
            className="text-lg font-bold tracking-tight mt-8 mb-3"
            {...props}
        />
    ),
    p: (props) => (
        <p
            className="text-base text-base-content/80 mb-4 leading-relaxed"
            {...props}
        />
    ),
    ul: (props) => (
        <ul
            className="space-y-2 mb-6 text-base-content/80"
            {...props}
        />
    ),
    ol: (props) => (
        <ol
            className="list-decimal list-inside space-y-2 mb-6 text-base-content/80"
            {...props}
        />
    ),
    li: (props) => (
        <li className="leading-relaxed flex gap-2">
            <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
            <span {...props} />
        </li>
    ),
    blockquote: (props) => (
        <blockquote
            className="border-l-4 border-primary pl-6 italic text-base-content/60 my-8 text-lg"
            {...props}
        />
    ),
    a: (props) => (
        <a
            className="text-primary font-semibold hover:underline transition-colors"
            {...props}
        />
    ),
    code: (props) => (
        <code
            className="bg-base-200 px-1.5 py-0.5 text-sm font-mono"
            {...props}
        />
    ),
    pre: (props) => (
        <pre
            className="bg-base-200 p-4 overflow-x-auto mb-6 border-l-4 border-base-300"
            {...props}
        />
    ),
    hr: () => <hr className="border-base-300 my-10" />,
    strong: (props) => (
        <strong className="font-bold text-base-content" {...props} />
    ),
};
