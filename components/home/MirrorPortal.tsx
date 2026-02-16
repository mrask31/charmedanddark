import Link from 'next/link';

export default function MirrorPortal() {
  return (
    <section className="mirror-portal">
      <div className="mirror-portal-content">
        <p className="mirror-portal-text">
          Some things are worn. Some things are known.
        </p>
        <Link href="/mirror" className="mirror-portal-button">
          Enter the Mirror
        </Link>
        <p className="mirror-portal-microtext">
          Exists separately.
        </p>
      </div>
    </section>
  );
}
