import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'reaction',
  title: 'Reaction',
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
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          {title: '👍 Like', value: '👍'},
          {title: '❤️ Love', value: '❤️'},
          {title: '🔥 Fire', value: '🔥'},
          {title: '🎉 Celebrate', value: '🎉'},
          {title: '🤔 Thinking', value: '🤔'},
          {title: '💡 Insightful', value: '💡'},
        ],
      },
    }),
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      description: 'Anonymous session identifier',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      emoji: 'emoji',
      post: 'post.title',
      createdAt: 'createdAt',
    },
    prepare(selection) {
      const {emoji, post, createdAt} = selection
      return {
        title: `${emoji} on ${post}`,
        subtitle: createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date',
      }
    },
  },
})
