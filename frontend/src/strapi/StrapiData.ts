// Text and Node Types
export interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
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

export interface HeadingNode {
  type: 'heading';
  children: TextNode[];
  level: number;
}

// Image and Media Types
export interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface MediaData {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// About Types
export interface AboutData {
  data: {
    id: number;
    documentId: string;
    description: (HeadingNode | ParagraphNode)[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}


// Project Types
export interface ProjectData {
  id: number;
  documentId: string;
  Title: string;
  Show: boolean;
  IsFeatured?: boolean;
  Description: ParagraphNode[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Type: string | null;
  Thumbnail: MediaData;
  Media: MediaData[] | null;
  Stack: string | null;
  Year: string | null;
  HeroType: string | null;
  Collaborators: string | null;
  HeroMedia: MediaData | null;
  Iframe: string | null;
  Youtube: string | null;
  Github: string | null;
  Vimeo: string | null;
}

export interface ProjectsResponse {
  data: ProjectData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
} 

export interface ProjectResponse {
  data: ProjectData;
  meta: object;
} 