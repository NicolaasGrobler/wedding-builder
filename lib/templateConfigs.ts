export const templateConfigs = {
  minimalist: {
    pages: {
      home: {
        displayName: "Home",
        fields: ["title", "welcomeText", { name: "heroImage", type: "image" }, { name: "bgImage", type: "image" }],
        activeByDefault: true,
      },
      "our-story": {
        displayName: "My Story",
        fields: ["title", "text", { name: "storyImage", type: "image" }],
        activeByDefault: false,
      },
      gallery: {
        displayName: "Photo Gallery",
        fields: [{ name: "images", type: "images", max: 6 }],
        activeByDefault: false,
      },
    },
  },
  floral: {
    pages: {
      home: {
        displayName: "Home",
        fields: ["title", "welcomeText", { name: "heroImage", type: "image" }, { name: "bgImage", type: "image" }],
        activeByDefault: true,
      },
      "our-story": {
        displayName: "Our Love Story",
        fields: ["text", { name: "images", type: "images", max: 4 }, "subtitle"],
        activeByDefault: false,
      },
      details: {
        displayName: "Wedding Details",
        fields: ["title", "text"],
        activeByDefault: false,
      },
    },
  },
};

export const getThemes = () => Object.keys(templateConfigs);
export const getPagesForTheme = (theme: string) => templateConfigs[theme]?.pages || {};