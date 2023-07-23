import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import TokenRouter from './components/TokenRouter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v1/callback" element={<TokenRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
