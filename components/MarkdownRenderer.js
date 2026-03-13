import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseProductReferences } from '@/lib/blog/markdown-parser';

/**
 * MarkdownRenderer Server Component
 * 
 * Renders markdown content with custom styling for the Charmed & Dark design system.
 * Supports GitHub Flavored Markdown and converts [product:slug] references to links.
 * 
 * @param {Object} props
 * @param {string} props.content - The markdown content to render
 * @param {string[]} props.productSlugs - Array of valid product slugs for link conversion
 * 
 * Requirements: 2.2, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5
 */
export default function MarkdownRenderer({ content, productSlugs = [] }) {
  if (!content) return null;

  // Replace [product:slug] with markdown links to /shop/[slug]
  // Invalid product slugs are rendered as plain text
  const processedContent = parseProductReferences(content, productSlugs);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings: Georgia font with uppercase tracking
        h1: ({ node, ...props }) => (
          <h1 
            className="font-serif text-4xl mb-6 uppercase tracking-widest text-white" 
            {...props} 
          />
        ),
        h2: ({ node, ...props }) => (
          <h2 
            className="font-serif text-3xl mb-4 uppercase tracking-widest text-white" 
            {...props} 
          />
        ),
        h3: ({ node, ...props }) => (
          <h3 
            className="font-serif text-2xl mb-3 uppercase tracking-wide text-white" 
            {...props} 
          />
        ),
        h4: ({ node, ...props }) => (
          <h4 
            className="font-serif text-xl mb-2 uppercase tracking-wide text-white" 
            {...props} 
          />
        ),
        h5: ({ node, ...props }) => (
          <h5 
            className="font-serif text-lg mb-2 uppercase tracking-wide text-white" 
            {...props} 
          />
        ),
        h6: ({ node, ...props }) => (
          <h6 
            className="font-serif text-base mb-2 uppercase tracking-wide text-white" 
            {...props} 
          />
        ),
        
        // Paragraphs: text-zinc-400 for body text
        p: ({ node, ...props }) => (
          <p 
            className="mb-4 leading-7 text-zinc-400" 
            {...props} 
          />
        ),
        
        // Links: gold accent color #B89C6D
        a: ({ node, ...props }) => (
          <a 
            className="text-[#B89C6D] hover:underline transition-all" 
            {...props} 
          />
        ),
        
        // Lists: text-zinc-400 with proper spacing
        ul: ({ node, ...props }) => (
          <ul 
            className="list-disc list-inside mb-4 text-zinc-400 space-y-1" 
            {...props} 
          />
        ),
        ol: ({ node, ...props }) => (
          <ol 
            className="list-decimal list-inside mb-4 text-zinc-400 space-y-1" 
            {...props} 
          />
        ),
        li: ({ node, ...props }) => (
          <li 
            className="text-zinc-400" 
            {...props} 
          />
        ),
        
        // Blockquotes: gold border with italic text
        blockquote: ({ node, ...props }) => (
          <blockquote 
            className="border-l-2 border-[#B89C6D] pl-4 italic text-zinc-500 mb-4" 
            {...props} 
          />
        ),
        
        // Code blocks: inline and block styles
        code: ({ node, inline, ...props }) => 
          inline 
            ? (
              <code 
                className="bg-zinc-900 px-1 py-0.5 text-sm text-zinc-300 rounded" 
                {...props} 
              />
            )
            : (
              <code 
                className="block bg-zinc-900 p-4 overflow-x-auto text-sm mb-4 text-zinc-300 rounded" 
                {...props} 
              />
            ),
        
        // Pre blocks: wrapper for code blocks
        pre: ({ node, ...props }) => (
          <pre 
            className="mb-4 overflow-x-auto" 
            {...props} 
          />
        ),
        
        // Strong and emphasis
        strong: ({ node, ...props }) => (
          <strong 
            className="font-semibold text-white" 
            {...props} 
          />
        ),
        em: ({ node, ...props }) => (
          <em 
            className="italic text-zinc-300" 
            {...props} 
          />
        ),
        
        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr 
            className="my-8 border-t border-white/10" 
            {...props} 
          />
        ),
        
        // Tables (GFM support)
        table: ({ node, ...props }) => (
          <div className="mb-4 overflow-x-auto">
            <table 
              className="min-w-full border border-white/10 text-zinc-400" 
              {...props} 
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead 
            className="bg-zinc-900" 
            {...props} 
          />
        ),
        tbody: ({ node, ...props }) => (
          <tbody 
            {...props} 
          />
        ),
        tr: ({ node, ...props }) => (
          <tr 
            className="border-b border-white/10" 
            {...props} 
          />
        ),
        th: ({ node, ...props }) => (
          <th 
            className="px-4 py-2 text-left font-semibold text-white uppercase tracking-wide text-sm" 
            {...props} 
          />
        ),
        td: ({ node, ...props }) => (
          <td 
            className="px-4 py-2 text-zinc-400" 
            {...props} 
          />
        ),
        
        // Strikethrough (GFM support)
        del: ({ node, ...props }) => (
          <del 
            className="line-through text-zinc-500" 
            {...props} 
          />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
