export default function Section({ id, kicker, title, note, children }) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-title`}>
      <header className="section__head">
        {kicker && <p className="section__kicker">{kicker}</p>}
        <h2 className="section__title" id={`${id}-title`}>{title}</h2>
        {note && <p className="section__note">{note}</p>}
      </header>
      {children}
    </section>
  )
}
