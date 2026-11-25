import { Fragment, type ReactNode } from "react";
import { agreementSections } from "@/content/agreement";

/** Renders **bold** markers as <strong>. */
function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

function Body({ lines }: { lines: string[] }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {bullets.map((b) => (
            <li key={b}>{rich(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  for (const line of lines) {
    if (line.startsWith("- ")) bullets.push(line.slice(2));
    else {
      flush();
      blocks.push(<p key={`p-${blocks.length}`}>{rich(line)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

/** The full membership agreement, from src/content/agreement.ts. */
export function AgreementText() {
  const sections = agreementSections();
  const firstCondition = sections.findIndex((s) => s.id.startsWith("c-"));
  return (
    <>
      {sections.map((s, i) => (
        <Fragment key={s.id}>
          {i === firstCondition && <h2 id="conditions">Conditions of membership</h2>}
          <section aria-labelledby={`sec-${s.id}`} className={s.emphasized ? "border-4 border-ink p-4 text-lg" : ""}>
            {s.id.startsWith("c-") ? (
              <h3 id={`sec-${s.id}`}>{s.title.replace(/^Conditions /, "")}</h3>
            ) : (
              <h2 id={`sec-${s.id}`}>{s.title}</h2>
            )}
            <Body lines={s.body} />
            {s.initial && <p className="text-sm italic text-concrete">Initialed by the member when signing.</p>}
          </section>
        </Fragment>
      ))}
    </>
  );
}
