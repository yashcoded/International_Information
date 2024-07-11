import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>International Travel Information</h1>
      <p>
        <Link href="/TravelInfo">Go to Travel Information</Link>
      </p>
    </div>
  );
}
