import MinimalistHome from "./minimalist/Home";
import MinimalistOurStory from "./minimalist/OurStory";
import MinimalistGallery from "./minimalist/Gallery";
import MinimalistNavbar from "./minimalist/Navbar";
import FloralHome from "./floral/Home";
import FloralOurStory from "./floral/OurStory";
import FloralNavbar from "./floral/Navbar";

export default {
  minimalist: {
    Navbar: MinimalistNavbar,
    Home: MinimalistHome,
    OurStory: MinimalistOurStory,
    Gallery: MinimalistGallery,
  },
  floral: {
    Navbar: FloralNavbar,
    Home: FloralHome,
    OurStory: FloralOurStory
  },
};