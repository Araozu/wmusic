import { createSignal } from "solid-js";
import { Login as GoLogin } from "../../wailsjs/go/main/App";

export function Login() {
    const [loading, setLoading] = createSignal(false);
    const [server, setServer] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");

    const login = async(ev: Event) => {
        ev.preventDefault();
        setLoading(true);

        const success = await GoLogin(server(), username(), password());
        if (success) {
            alert(":D");
        } else {
            alert("D:");
        }
        setLoading(false);
    };

    return (
        <div class="w-screen h-screen flex items-center justify-center">
            <div class="w-80">
                <form onSubmit={login} >
                    <h1 class="text-center font-black text-xl">Login</h1>
                    <label class="form-control" for="login-server">
                        <div class="label">
                            <span class="label-text text-xs">Server URL</span>
                        </div>
                        <input id="login-server" type="text"
                            onInput={(e) => setServer(e.target.value)}
                            class="input input-bordered"
                            placeholder="https://"
                            required
                            disabled={loading()}
                        />
                    </label>
                    <label class="form-control" for="login-username">
                        <div class="label">
                            <span class="label-text text-xs">Username</span>
                        </div>
                        <input id="login-username" type="text"
                            onInput={(e) => setUsername(e.target.value)}
                            class="input input-bordered"
                            placeholder="username"
                            required
                            disabled={loading()}
                        />
                    </label>
                    <label class="form-control" for="login-password">
                        <div class="label">
                            <span class="label-text text-xs">Password</span>
                        </div>
                        <input id="login-password" type="password"
                            onInput={(e) => setPassword(e.target.value)}
                            class="input input-bordered"
                            placeholder="********"
                            required
                            disabled={loading()}
                        />
                    </label>
                    <br />
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
