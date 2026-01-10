import { defineType, defineArrayMember } from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
          {
            title: 'Internal Link',
            name: 'internalLink',
            type: 'object',
            fields: [
              {
                name: 'reference',
                type: 'reference',
                to: [{ type: 'post' }],
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineArrayMember({
      name: 'code',
      title: 'Code Block',
      type: 'object',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Python', value: 'python' },
              { title: 'Bash', value: 'bash' },
              { title: 'JSON', value: 'json' },
            ],
          },
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
        },
      ],
    }),
    defineArrayMember({
      name: 'callout',
      title: 'Callout',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Type',
          type: 'string',
          options: {
            list: [
              { title: 'Info', value: 'info' },
              { title: 'Warning', value: 'warning' },
              { title: 'Error', value: 'error' },
              { title: 'Success', value: 'success' },
            ],
          },
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'message',
          title: 'Message',
          type: 'text',
        },
      ],
    }),
    defineArrayMember({
      name: 'divider',
      title: 'Divider',
      type: 'object',
      fields: [{ name: 'enabled', type: 'boolean', initialValue: true }],
    }),
    defineArrayMember({
      name: 'videoEmbed',
      title: 'Video Embed',
      type: 'object',
      fields: [
        { name: 'url', title: 'URL', type: 'url' },
        { name: 'caption', title: 'Caption', type: 'string' },
      ],
    }),
    defineArrayMember({
      name: 'quoteBlock',
      title: 'Quote Block',
      type: 'object',
      fields: [
        { name: 'text', title: 'Quote Text', type: 'text' },
        { name: 'author', title: 'Author', type: 'string' },
      ],
    }),
    defineArrayMember({
      name: 'highlight',
      title: 'Highlight',
      type: 'object',
      fields: [
        { name: 'text', title: 'Text', type: 'string' },
        {
          name: 'color',
          title: 'Color',
          type: 'string',
          options: {
            list: [
              { title: 'Yellow', value: 'yellow' },
              { title: 'Green', value: 'green' },
              { title: 'Blue', value: 'blue' },
              { title: 'Red', value: 'red' },
            ],
          },
        },
      ],
    }),
    defineArrayMember({
      name: 'previewBlock',
      title: 'Preview Block',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'previewContent', title: 'Preview Content', type: 'text' },
        {
          name: 'bgType',
          title: 'Background Type',
          type: 'string',
          options: {
            list: [
              { title: 'Light', value: 'light' },
              { title: 'Dark', value: 'dark' },
              { title: 'Code', value: 'code' },
            ],
          },
        },
      ],
    }),
  ],
})

