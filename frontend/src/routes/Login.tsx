export function Login() {
    return (
        <div class="w-screen h-screen flex items-center justify-center">
            <div class="w-80">
                <h1 class="text-center font-black text-xl">Login</h1>
                <label class="form-control" for="login-server">
                    <div class="label">
                        <span class="label-text text-xs">Server URL</span>
                    </div>
                    <input id="login-server" type="text"
                        class="input input-bordered"
                        placeholder="https://"
                    />
                </label>
                <label class="form-control" for="login-username">
                    <div class="label">
                        <span class="label-text text-xs">Username</span>
                    </div>
                    <input id="login-username" type="text"
                        class="input input-bordered"
                        placeholder="username"
                    />
                </label>
                <label class="form-control" for="login-password">
                    <div class="label">
                        <span class="label-text text-xs">Password</span>
                    </div>
                    <input id="login-password" type="password"
                        class="input input-bordered"
                        placeholder="********"
                    />
                </label>
                <br />
                <div class="text-center">
                    <button class="btn btn-primary">Login</button>
                </div>
            </div>
        </div>
    );
}
