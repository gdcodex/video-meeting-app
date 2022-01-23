import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import VideoLayout from "./js/VideoLayout";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={VideoLayout} />
        <Route exact path="/:uuid" component={VideoLayout} />
      </Switch>
    </Router>
  );
}
