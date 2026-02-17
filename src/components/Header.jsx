import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/stock', label: 'Stock' },
    { path: '/research', label: 'Research' },
    { path: '/risk', label: 'Risk' },
  ]

  return (
    <header>
      <nav>
        <Link to="/" className="logo">로고</Link>
        <ul>
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <Link to={path} className={location.pathname === path ? 'active' : ''}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
