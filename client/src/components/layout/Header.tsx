import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-primary text-white py-4 px-6 flex justify-between items-center">
      {/* Logo and landing page link */}
      <Link href="/landingpage">
        <div className="flex items-center cursor-pointer">
          <img
            src="/logo.jpeg" // replace with your logo path
            alt="לוגו"
            className="h-8 w-8 mr-2 rounded-full"
          />
          <span className="text-xl font-bold mx-2">The Finder </span>
        </div>
      </Link>

      {/* Dashboard link */}
      <Link href="/landingpage">
        <span className="text-lg hover:underline cursor-pointer">עמוד בית</span>
      </Link>

      <Link href="/">
        <span className="text-lg hover:underline cursor-pointer">
          חיפוש דירות
        </span>
      </Link>
    </header>
  );
}
