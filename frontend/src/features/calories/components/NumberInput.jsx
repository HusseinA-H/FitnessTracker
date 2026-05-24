import { motion } from "framer-motion";

export default function NumberInput({ value, setValue, placeholder }) {
  const increment = () => setValue(Number(value || 0) + 1);
  const decrement = () =>
    setValue(Number(value || 0) > 0 ? Number(value) - 1 : 0);

  return (
    <div className="relative w-full">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 md:p-4 bg-black border border-gray-700 rounded-xl text-center text-base md:text-lg pr-12 md:pr-14"
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={increment}
          type="button"
          className="w-8 h-7 md:w-8 md:h-6 bg-orange-500 text-black rounded-md font-bold shadow-[0_0_12px_rgba(255,107,0,0.6)] hover:bg-orange-400 transition"
        >
          +
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={decrement}
          type="button"
          className="w-8 h-7 md:w-8 md:h-6 bg-orange-500 text-black rounded-md font-bold shadow-[0_0_12px_rgba(255,107,0,0.6)] hover:bg-orange-400 transition"
        >
          −
        </motion.button>
      </div>
    </div>
  );
}