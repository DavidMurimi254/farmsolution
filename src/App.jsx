import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './assets/home'
import Signup from './assets/signup'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/:mode' element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
