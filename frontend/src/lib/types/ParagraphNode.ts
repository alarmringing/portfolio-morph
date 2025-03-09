export interface TextNode {
  type: 'text';
  text: string;
}

export interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

export interface ParagraphNode {
  type: 'paragraph';
  children: (TextNode | LinkNode)[];
} 