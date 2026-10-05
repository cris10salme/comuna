// Grupo de opciones tipo "chip". multiple=false se comporta como radio (permite desmarcar si optional).
export default function Chips({ legend, options, value, onChange, multiple = false, optional = false, max }) {
  const selected = multiple ? value : value ? [value] : []
  const toggle = (opt) => {
    if (multiple) {
      if (selected.includes(opt)) onChange(selected.filter((o) => o !== opt))
      else if (!max || selected.length < max) onChange([...selected, opt])
    } else {
      onChange(selected.includes(opt) && optional ? null : opt)
    }
  }
  return (
    <fieldset className="chips">
      <legend className="chips__legend">{legend}</legend>
      <div className="chips__row">
        {options.map((opt) => {
          const label = typeof opt === 'string' ? opt : opt.label
          const key = typeof opt === 'string' ? opt : opt.id
          const on = selected.includes(key)
          return (
            <button
              type="button"
              key={key}
              className={`chip ${on ? 'chip--on' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(key)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
