'use client'

import { ReactNode, createElement } from 'react';
import { getTextGlyphClass } from '@/app/utils/textUtils';
import { TextNode, LinkNode, ParagraphNode, HeadingNode } from './StrapiData';

export const renderTextNode = (node: TextNode): string => {
  return node.text;
};

export const renderLinkNode = (node: LinkNode): ReactNode => {
  return (
    <a 
      href={node.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline"
    >
      {node.children.map(child => renderTextNode(child)).join('')}
    </a>
  );
};

export const renderHeadingNode = (node: HeadingNode): ReactNode => {
  const fullText = node.children.map(child => child.text).join('');
  
  return createElement(
    `h${node.level}`,
    { className: `mb-6 ${getTextGlyphClass(fullText)}` },
    node.children.map((child, index) => (
      <span key={index} className="header-text">
        {renderTextNode(child)}
      </span>
    ))
  );
};

export const renderParagraphNode = (node: ParagraphNode): ReactNode => {
  // Get the combined text content of all children
  const fullText = node.children
    .map(child => child.type === 'text' ? child.text : 
      child.type === 'link' ? child.children.map(c => c.text).join('') : '')
    .join('');

  return (
    <p className={`mb-4 ${getTextGlyphClass(fullText)}`} >
      {node.children.map((child, index) => (
        <span key={index}>
          {child.type === 'text' ? renderTextNode(child) : renderLinkNode(child)}
        </span>
      ))}
    </p>
  );
};

export const renderNode = (node: TextNode | LinkNode | ParagraphNode | HeadingNode): ReactNode => {
  switch (node.type) {
    case 'text':
      return renderTextNode(node);
    case 'link':
      return renderLinkNode(node);
    case 'paragraph':
      return renderParagraphNode(node);
    case 'heading':
      return renderHeadingNode(node);
  }
}; 