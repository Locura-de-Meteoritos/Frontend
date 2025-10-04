import './background.css'

// Genera un número aleatorio entre min y max
const rand = (min, max) => Math.random() * (max - min) + min

function Background({count = 120}) {
	const stars = Array.from({length: count}).map((_, i) => {
		// parámetros aleatorios
		const size = rand(0.8, 3) // px
		const x = rand(-10, 110) // % posición inicial X (puede empezar fuera para entrar en pantalla)
		const y = rand(-10, 110) // % posición inicial Y
		const dur = rand(8, 22) // duración del ciclo en segundos
		const delay = rand(-dur, 0) // para que no inicien todos juntos
		const driftX = rand(-40, 40) // desplazamiento horizontal durante la animación
		const driftY = rand(-30, 30) // desplazamiento vertical
		const rotate = rand(-200, 200)
		const opacity = rand(0.25, 0.95)

		const style = {
			'--size': `${size}px`,
			'--x': `${x}%`,
			'--y': `${y}%`,
			'--dur': `${dur}s`,
			'--delay': `${delay}s`,
			'--dx': `${driftX}px`,
			'--dy': `${driftY}px`,
			'--rot': `${rotate}deg`,
			'--op': opacity,
		}

		return <span key={i} className="star moving" style={style} />
	})

	return (
		<div className="background" aria-hidden>
			{stars}
		</div>
	)
}

export default Background
