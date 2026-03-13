export default {
  name: 'currentDrop',
  title: 'Current Drop',
  type: 'document',
  fields: [
    {
      name: 'dropName',
      title: 'Drop Name',
      type: 'string',
      description: 'Name of the current drop (e.g., "Midnight Ritual Collection")',
    },
    {
      name: 'previewDate',
      title: 'Preview Window Date',
      type: 'datetime',
      description: 'When the preview window opens',
    },
    {
      name: 'releaseDate',
      title: 'Release Window Date',
      type: 'datetime',
      description: 'When the public release window opens',
    },
    {
      name: 'sanctuaryAccessDate',
      title: 'Sanctuary Early Access Date',
      type: 'datetime',
      description: 'When Sanctuary members get early access',
    },
  ],
  preview: {
    select: {
      title: 'dropName',
      subtitle: 'releaseDate',
    },
  },
};
