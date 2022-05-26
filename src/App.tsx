import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import f from './function'
// import TheCanvas from './components/TheCanvas/TheCanvas'

function App() {

  const [res, setRes] = useState(0);
  return (
    <div className="App">
      {/* <TheCanvas/> */}
      <button onClick={() => {
        const newRes = f.randn_bm();
        setRes(newRes)
      }}>test</button>
      <p>{res}</p>
    </div>
  );
}

export default App;
