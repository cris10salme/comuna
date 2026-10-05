// Versión ligera sin WebGL: la misma idea de capas con CSS.
const LAYER_COLORS = {
  bunBottom: '#c98a43',
  bunTop: '#b8661f',
  patty: '#4a2412',
  chicken: '#c98a3a',
  cheese: '#f39a1e',
  sauce: '#e2853a',
  jam: '#4a1a2c',
  lettuce: '#86b83c',
  bacon: '#8e2a1c',
  onionDiced: '#efe6cf',
  onionCrispy: '#b86b22',
  onionCaramel: '#7a3a12',
  pickles: '#5d7a2a',
  goatRound: '#efe9db',
}

export default function FlatStack({ recipe, exploded }) {
  const layers = [...recipe].reverse()
  return (
    <div className={`flatstack ${exploded ? 'is-exploded' : ''}`}>
      {layers.map((l, i) => (
        <div key={i} className={`flatstack__layer flatstack__layer--${l.type}`} style={{ '--c': LAYER_COLORS[l.type], '--i': i }}>
          <span className="flatstack__label">{l.label}</span>
        </div>
      ))}
    </div>
  )
}
