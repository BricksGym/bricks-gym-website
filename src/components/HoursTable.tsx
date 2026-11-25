import { hours } from "@/config/gym";

export function HoursTable({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <table className={`w-full ${className}`}>
      <caption className="sr-only">Gym hours</caption>
      <tbody>
        {hours.map((h) => (
          <tr key={h.days} className={`border-b ${dark ? "border-bone/10" : "border-ink/10"} last:border-0`}>
            <th scope="row" className="py-1.5 pr-3 text-left font-normal">
              {h.days}
            </th>
            <td className={`py-1.5 text-right tabular-nums ${dark ? "text-bone" : "text-ink"}`}>
              {h.open} – {h.close}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
