import './Header.css'

function Header() {
  return (
    <header>
      <nav>
        <a href="#" className="logo">로고</a>
        <ul>
          <li><a href="#">홈</a></li>
          <li><a href="#">소개</a></li>
          <li><a href="#">연락처</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
