'use client'

import { ReactNode } from 'react';
import { TextNode, LinkNode, ParagraphNode } from '@/lib/types/ParagraphNode';
import { getTextClass } from '@/app/utils/textUtils';
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

export const renderParagraphNode = (node: ParagraphNode): ReactNode => {
  // Get the combined text content of all children
  const fullText = node.children
    .map(child => child.type === 'text' ? child.text : 
      child.type === 'link' ? child.children.map(c => c.text).join('') : '')
    .join('');

  return (
    <p className={`mb-4 ${getTextClass(fullText)}`} >
      {node.children.map((child, index) => (
        <span key={index}>
          {child.type === 'text' ? renderTextNode(child) : renderLinkNode(child)}
        </span>
      ))}
    </p>
  );
};

export const renderNode = (node: TextNode | LinkNode | ParagraphNode): ReactNode => {
  switch (node.type) {
    case 'text':
      return renderTextNode(node);
    case 'link':
      return renderLinkNode(node);
    case 'paragraph':
      return renderParagraphNode(node);
  }
}; 