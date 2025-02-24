export default function Home({ title, welcomeText, heroImage, bgImage }) {
  return (
    <section className="p-4 bg-white">
      <h1 className="text-3xl font-bold">{title || 'No Title'}</h1>
      <p className="my-2">{welcomeText || 'No Welcome Text'}</p>
      {heroImage ? <img src={heroImage} alt="Hero" className="w-full rounded" /> : <p>No Hero Image</p>}
      {bgImage ? <img src={bgImage} alt="Background" className="w-full rounded mt-2" /> : <p>No Background Image</p>}
    </section>
  );
}