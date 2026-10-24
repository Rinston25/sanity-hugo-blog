import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          // Only demand alt text when an image has actually been uploaded.
          // `parent` is the image object; `asset` is only set once a file is added.
          validation: (rule) =>
            rule.custom((alt, context) => {
              const image = context.parent as {asset?: unknown} | undefined
              return image?.asset && !alt ? 'Alt text is required when an image is set' : true
            }),
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'bio', media: 'image'},
  },
})
