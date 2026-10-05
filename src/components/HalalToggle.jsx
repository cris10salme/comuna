import { HALAL_LABEL } from '../data/menu'

export default function HalalToggle({ checked, onChange, small = false }) {
  return (
    <label className={`toggle ${small ? 'toggle--small' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__box" aria-hidden="true" />
      <span>{HALAL_LABEL}</span>
    </label>
  )
}
