import type { Schema, Struct } from '@strapi/strapi';

export interface TextBlockTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_text_block_text_blocks';
  info: {
    displayName: 'textBlock';
  };
  attributes: {
    TextBlock: Schema.Attribute.Blocks;
  };
}

export interface VideoLinkVideoLink extends Struct.ComponentSchema {
  collectionName: 'components_video_link_video_links';
  info: {
    displayName: 'VideoLink';
    icon: 'attachment';
  };
  attributes: {
    Url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'text-block.text-block': TextBlockTextBlock;
      'video-link.video-link': VideoLinkVideoLink;
    }
  }
}
