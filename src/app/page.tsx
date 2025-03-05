import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>
        <div className="flex gap-4">
          <Link href="/templates" className="text-sm sm:text-base hover:underline">Templates</Link>
          <Link href="/workouts" className="text-sm sm:text-base hover:underline">Workouts</Link>
          <Link href="/login" className="text-sm sm:text-base hover:underline">Log In</Link>
        </div>
      </nav>
      <main className="flex flex-col gap-8 items-center sm:items-start">
        {/* Add content here */}
      </main>
    </div>
  );
}
