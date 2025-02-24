export default function Gallery({ images }: { images?: string[] }) {
    return (
      <section className="p-4 bg-pink-50">
        <h1 className="text-3xl font-bold mb-4 text-pink-800">Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images?.map((img, idx) => (
            <img key={idx} src={img} alt={`Gallery image ${idx + 1}`} className="w-full h-48 object-cover rounded border border-pink-200" />
          )) || <p>No images available</p>}
        </div>
      </section>
    );
  }