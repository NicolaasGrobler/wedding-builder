export default function OurStory({ text, images, subtitle }: { text: string; images: string[]; subtitle: string }) {
  return (
    <section className="p-4 bg-pink-100 grid grid-cols-2 gap-4">
      {images?.map((img, idx) => (
        <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-full rounded" />
      ))}
      <div>
        <h3 className="text-xl">{subtitle}</h3>
        <p>{text}</p>
      </div>
    </section>
  );
}