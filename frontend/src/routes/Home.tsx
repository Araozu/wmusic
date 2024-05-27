import { createSignal, onMount } from "solid-js";

export function Home() {
    const [hidden, setHidden] = createSignal(true);

    onMount(() => {
        setTimeout(() => setHidden(false) , 150);
    });

    return (
        <div class={`min-h-screen ${hidden() ? "opacity-0" : "opacity-100"} transition-opacity`}>
            Home :D
        </div>
    );
}
