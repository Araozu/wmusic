import { For, createMemo, createResource, createSignal, onMount } from "solid-js";
import { GetAlbumCover, GetRandomAlbums } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export function Home() {
    const [hidden, setHidden] = createSignal(true);
    const [albums] = createResource(GetRandomAlbums);

    onMount(() => {
        // Fade in the UI
        setTimeout(() => setHidden(false), 150);
    });

    return (
        <div class={`min-h-screen ${hidden() ? "opacity-0" : "opacity-100"} transition-opacity`}>
            <h1 class="font-black text-2xl pt-6 pb-4 pl-2">Random albums</h1>
            <div class="pb-4 overflow-scroll whitespace-nowrap">
                <For each={albums()}>
                    {(album) => <Album album={album} />}
                </For>
            </div>
        </div>
    );
}

function Album(props: { album: main.Album }) {
    const [coverBytes] = createResource(async() => await GetAlbumCover(props.album.id));

    const base64Image = createMemo(() => {
        if (coverBytes.state !== "ready") return "";

        // At runtime this is a string, not a number array
        const bytes = coverBytes() as unknown as string;
        return `data:;base64,${bytes}`;
    });

    return (
        <div class="inline-block mx-2 p-1 w-32 rounded bg-zinc-900">
            <img
                class={`inline-block rounded w-30 h-30 min-w-30 min-h-30 transition-opacity ${coverBytes.state === "ready" ? "opacity-100" : "opacity-0"}`}
                src={base64Image()}
                alt=""
            />

            <br />
            <div class="text-sm overflow-hidden overflow-ellipsis pt-1">
                {props.album.name}
            </div>
            <div class="text-xs overflow-hidden overflow-ellipsis opacity-50">
                {props.album.albumArtist}
            </div>

        </div>
    );
}
