import { Route, HashRouter as Router } from "@solidjs/router";
import type { Component } from "solid-js";

import { Login } from "./routes/Login";
import { Home } from "./routes/Home";

const App: Component = () => (
    <div>
        <Router>
            <Route path="/" component={Login} />
            <Route path="/home" component={Home} />
        </Router>
    </div>
);

export default App;
