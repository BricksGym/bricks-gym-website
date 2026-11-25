import { business } from "@/config/gym";

export function MapEmbed({ className = "" }: { className?: string }) {
  const { street, city, state, zip } = business.address;
  const q = encodeURIComponent(`${street}, ${city}, ${state} ${zip}`);
  return (
    <div className={`overflow-hidden border-4 border-ink ${className}`}>
      <iframe
        title={`Map to ${business.name}, ${street}, ${city}`}
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        className="block h-72 w-full sm:h-96"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
        className="block bg-ink px-4 py-3 text-center font-condensed uppercase tracking-wider text-bone hover:bg-iron"
        rel="noopener"
      >
        Get directions →
      </a>
    </div>
  );
}
