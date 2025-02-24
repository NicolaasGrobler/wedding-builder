export default function Home({ title, welcomeText, heroImage, bgImage }: { title: string; welcomeText: string; heroImage?: string; bgImage?: string }) {
  return (
    <section className="p-4 bg-white">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="my-2">{welcomeText}</p>
      {heroImage && <img src={heroImage} alt="Hero" className="w-full rounded" />}
      {bgImage && <img src={bgImage} alt="Background" className="w-full rounded mt-2" />}
    </section>
  );
}