export const templateConfigs = {
  minimalist: {
    pages: {
      home: {
        fields: ["title", "welcomeText", { name: "heroImage", type: "image" }, { name: "bgImage", type: "image" }],
        activeByDefault: true,
      },
      "our-story": {
        fields: ["title", "text", { name: "storyImage", type: "image" }],
        activeByDefault: false,
      },
      gallery: {
        fields: [{ name: "images", type: "images", max: 6 }],
        activeByDefault: false,
      },
    },
  },
  floral: {
    pages: {
      home: {
        fields: ["title", "welcomeText", { name: "heroImage", type: "image" }, { name: "bgImage", type: "image" }],
        activeByDefault: true,
      },
      "our-story": {
        fields: ["text", { name: "images", type: "images", max: 4 }, "subtitle"],
        activeByDefault: false,
      },
      details: {
        fields: ["title", "text"],
        activeByDefault: false,
      },
    },
  },
};

export const getThemes = () => Object.keys(templateConfigs);
export const getPagesForTheme = (theme: string) => templateConfigs[theme]?.pages || {};