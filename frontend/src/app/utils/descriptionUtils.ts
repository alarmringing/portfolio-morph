import { TextNode, LinkNode, ParagraphNode, HeadingNode } from '@/strapi/StrapiData';

type DescriptionNode = TextNode | LinkNode | ParagraphNode | HeadingNode;

export function splitDescription(description: DescriptionNode[] | null) {
  // If no description or not enough paragraphs, return all in primary
  if (!description || description.length <= 3) {
    return [description, null];
  }
  
  // Try to find a good splitting point (a heading)
  let splitIndex = -1;
  
  // Look for a heading node to split at (after the first 2 paragraphs)
  for (let i = 2; i < description.length - 1; i++) {
    const node = description[i];
    if (node.type === 'heading') {
      splitIndex = i;
      break;
    }
  }
  
  // If no heading found, split after approximately 1/3 of the content
  if (splitIndex === -1) {
    splitIndex = Math.min(Math.ceil(description.length / 3), 3);
  }
  
  return [
    description.slice(0, splitIndex),
    description.slice(splitIndex)
  ] as const;
} 