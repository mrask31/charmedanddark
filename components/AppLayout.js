import Header from "./Header";
import MobileTabNav from "./MobileTabNav";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-6 md:pb-12">
        {children}
      </main>
      <MobileTabNav />
    </div>
  );
}
