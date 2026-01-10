import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";

const components: PortableTextComponents = {
    block: {
        h1: ({ children }) => <h1 className="portable-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="portable-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="portable-h3">{children}</h3>,
        h4: ({ children }) => <h4 className="portable-h4">{children}</h4>,
        blockquote: ({ children }) => (
            <blockquote className="portable-blockquote">{children}</blockquote>
        ),
        normal: ({ children }) => <p className="portable-p">{children}</p>,
    },
    list: {
        bullet: ({ children }) => <ul className="portable-ul">{children}</ul>,
        number: ({ children }) => <ol className="portable-ol">{children}</ol>,
    },
    listItem: {
        bullet: ({ children }) => <li className="portable-li-bullet">{children}</li>,
        number: ({ children }) => <li>{children}</li>,
    },
    marks: {
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        code: ({ children }) => <code>{children}</code>,
        underline: ({ children }) => <u>{children}</u>,
        "strike-through": ({ children }) => <s>{children}</s>,
        link: ({ children, value }) => {
            const rel = !value.href.startsWith("/")
                ? "noopener noreferrer"
                : undefined;
            const target = !value.href.startsWith("/") ? "_blank" : undefined;
            return (
                <a
                    href={value.href}
                    rel={rel}
                    target={target}
                    className="portable-link"
                >
                    {children}
                </a>
            );
        },
        internalLink: ({ children, value }) => (
            <a
                href={`/articles/${value.reference?.slug?.current}`}
                className="internal-link"
            >
                {children}
            </a>
        ),
    },
    types: {
        image: ({ value }) => {
            const src = value.asset?.url || (value.asset?._ref
                ? `https://cdn.sanity.io/images/kciy3tvs/production/${value.asset._ref
                    .replace("image-", "")
                    .replace("-webp", ".webp")
                    .replace("-png", ".png")
                    .replace("-jpg", ".jpg")}`
                : "");
            return (
                <figure className="portable-image">
                    <img src={src} alt={value.alt || "Image"} loading="lazy" />
                    {value.caption && <figcaption>{value.caption}</figcaption>}
                </figure>
            );
        },
        code: ({ value }) => (
            <pre className="code-block" data-language={value.language || "text"}>
                <code>{value.code}</code>
            </pre>
        ),
        callout: ({ value }) => (
            <div className={`callout callout-${value.type || "info"}`}>
                {value.title && <span className="callout-title">{value.title}</span>}
                <p className="callout-message">{value.message}</p>
            </div>
        ),
        divider: () => <hr className="portable-divider" />,
        videoEmbed: ({ value }) => {
            const convertToEmbedUrl = (url: string) => {
                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    const videoId = url.match(
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
                    )?.[1];
                    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                }
                if (url.includes("vimeo.com")) {
                    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
                }
                return url;
            };
            return (
                <figure className="portable-video">
                    <div className="video-container">
                        <iframe
                            src={convertToEmbedUrl(value.url)}
                            frameBorder="0"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                    {value.caption && <figcaption>{value.caption}</figcaption>}
                </figure>
            );
        },
        quoteBlock: ({ value }) => (
            <blockquote className="portable-quote">
                <p>{value.text}</p>
                {value.author && (
                    <footer className="quote-author">— {value.author}</footer>
                )}
            </blockquote>
        ),
        highlight: ({ value }) => (
            <mark className={`highlight-${value.color || "yellow"}`}>
                {value.text}
            </mark>
        ),
        previewBlock: ({ value }) => (
            <div className={`preview-block preview-${value.bgType || "light"}`}>
                <div className="preview-header">
                    <div className="preview-title">{value.title}</div>
                    {value.description && (
                        <div className="preview-description">{value.description}</div>
                    )}
                </div>
                <div className="preview-content">{value.previewContent}</div>
            </div>
        ),
    },
};

export default function PortableTextRenderer({ value }: { value: any }) {
    if (!value) return null;
    return (
        <div className="portable-text">
            <PortableText value={value} components={components} />
        </div>
    );
}
