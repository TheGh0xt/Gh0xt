import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
      description: 'Email is optional but allows for replies',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required().min(1).max(1000),
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
      description: 'Comments must be approved before they appear',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      description: 'Anonymous session identifier',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      content: 'content',
      post: 'post.title',
      approved: 'approved',
    },
    prepare(selection) {
      const {name, content, post, approved} = selection
      return {
        title: `${name} on ${post}`,
        subtitle: `${approved ? '✓' : '⏳'} ${content.substring(0, 50)}...`,
      }
    },
  },
})
