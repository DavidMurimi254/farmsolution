import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './assets/home'
import Signup from './assets/signup'
import Login from './assets/login'
import Field from './assets/field'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/field/:id' element={<Field />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
