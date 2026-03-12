import { Products } from "@/src/views/home/ui/products";
import Hero from "@/src/widgets/hero/hero";

export default function Home() {
  return (

    <main>
      <section className="relative w-full h-screen z-0">
        <Hero />
      </section>
      <section className="relative w-full min-h-[500px]">
        <Products />
      </section>
    </main>
  );
}
