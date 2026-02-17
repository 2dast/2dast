import { useState } from 'react'
import './Hero.css'

function Hero() {
  const [clicked, setClicked] = useState(false)

  const handleClick = (e) => {
    e.preventDefault()
    setClicked(true)
    setTimeout(() => setClicked(false), 1500)
  }

  return (
    <section className="hero">
      <h1 className="hello-world">Hello world</h1>
      <p>React + Vite로 만든 웹사이트입니다.</p>
      <a href="#" className="btn" onClick={handleClick}>
        {clicked ? '클릭됨!' : '시작하기'}
      </a>
    </section>
  )
}

export default Hero
