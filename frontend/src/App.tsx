import { Route, HashRouter as Router } from "@solidjs/router";
import type { Component } from "solid-js";

import { Login } from "./routes/Login";

const App: Component = () => (
    <div>
        <Router>
            <Route path="/" component={Login} />
        </Router>
    </div>
);

export default App;
