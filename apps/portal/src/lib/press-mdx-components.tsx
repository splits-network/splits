import type { MDXComponents } from "mdx/types";

export const pressComponents: MDXComponents = {
    h1: (props) => <h1 className="text-4xl font-bold mb-6" {...props} />,
    h2: (props) => <h2 className="text-2xl font-bold mt-10 mb-4" {...props} />,
    h3: (props) => <h3 className="text-xl font-bold mt-8 mb-3" {...props} />,
    p: (props) => (
        <p
            className="text-base text-base-content/80 mb-4 leading-relaxed"
            {...props}
        />
    ),
    ul: (props) => (
        <ul
            className="list-disc list-inside space-y-2 mb-4 text-base-content/80"
            {...props}
        />
    ),
    ol: (props) => (
        <ol
            className="list-decimal list-inside space-y-2 mb-4 text-base-content/80"
            {...props}
        />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => (
        <blockquote
            className="border-l-4 border-coral pl-4 italic text-base-content/70 my-6"
            {...props}
        />
    ),
    a: (props) => <a className="link link-hover text-primary" {...props} />,
    code: (props) => (
        <code
            className="bg-base-200 px-1.5 py-0.5 rounded text-sm"
            {...props}
        />
    ),
    pre: (props) => (
        <pre
            className="bg-base-200 p-4 rounded-lg overflow-x-auto mb-4"
            {...props}
        />
    ),
    hr: () => <hr className="border-base-300 my-8" />,
    strong: (props) => (
        <strong className="font-semibold text-base-content" {...props} />
    ),
};
