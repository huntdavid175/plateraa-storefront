import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-stone-900 mb-4">
          Plateraa Storefront
        </h1>
        <p className="text-stone-500 mb-8">
          Order delicious food from your favorite restaurants
        </p>
        <Link
          href="/restaurant/3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-stone-900 text-stone-50 font-semibold hover:bg-stone-800 transition-colors"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}
