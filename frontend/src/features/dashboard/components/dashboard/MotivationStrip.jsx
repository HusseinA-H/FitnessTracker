const quotes = [
  "Discipline beats motivation.",
  "No pain, no growth.",
  "Consistency creates transformation.",
  "You vs You.",
];

// Deterministic pseudo-random (pure): no Math.random
function pickQuote(list) {
  const len = list.length;
  // value in [0, 1)
  const r = Math.abs(Math.sin(len * 999)) % 1;
  const idx = Math.floor(r * len);
  return list[idx] ?? list[0];
}

export default function MotivationStrip() {
  const quote = pickQuote(quotes);

  return (
    <div
      className="rounded-3xl p-12 text-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1546484959-fac6b59e0f7a')",
      }}
    >
      <div className="bg-black/70 p-8 rounded-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-orange-500">{quote}</h2>
      </div>
    </div>
  );
}