export const templateConfigs = {
  minimalist: {
    home: { fields: ['title', 'welcomeText', { name: 'heroImage', type: 'image' }, { name: 'bgImage', type: 'image' }] },
    'our-story': { fields: ['title', 'text', { name: 'storyImage', type: 'image' }] },
  },
  floral: {
    home: { fields: ['title', 'welcomeText', { name: 'heroImage', type: 'image' }, { name: 'bgImage', type: 'image' }] },
    'our-story': { fields: ['text', { name: 'images', type: 'images', max: 4 }, 'subtitle'] },
  },
};