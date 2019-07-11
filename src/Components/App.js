import React from 'react';
import logo from '../Assets/dinoparks-logo.png';
import '../Styles/App.css';
import Grid from './Grid';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="logo">
          <img alt="DinoPark" src={logo} />
        </div>
        <Switch>
          <Route exact path="/" component={Grid} />
          <Route render={() => <h1>Whoops.. Page not found :(</h1>} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
