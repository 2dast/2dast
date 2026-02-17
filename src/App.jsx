import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Content from './components/Content'
import StockPage from './domains/stock/StockPage'
import ResearchPage from './domains/research/ResearchPage'
import RiskPage from './domains/risk/RiskPage'

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<><Hero /><Content /></>} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/risk" element={<RiskPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
