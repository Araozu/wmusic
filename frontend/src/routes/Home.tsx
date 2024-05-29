import { For, createResource, createSignal, onMount } from "solid-js";
import { GetRandomAlbums } from "../../wailsjs/go/main/App";
import {main} from "../../wailsjs/go/models";

export function Home() {
    const [hidden, setHidden] = createSignal(true);
    const [albums] = createResource(GetRandomAlbums);

    onMount(() => {
        // Fade in the UI
        setTimeout(() => setHidden(false) , 150);
    });


    return (
        <div class={`min-h-screen ${hidden() ? "opacity-0" : "opacity-100"} transition-opacity`}>
            <div class="py-10 h-64 overflow-scroll whitespace-nowrap">
                <For each={albums()}>
                    {(album) => <Album album={album} />}
                </For>
            </div>
        </div>
    );
}

function Album(props: {album: main.Album}) {
    return (
        <div class="inline-block mx-2 p-1 w-32 rounded bg-zinc-900">
            <img
                class="inline-block rounded w-30 h-30 min-w-30 min-h-30"
                src={props.album.mediumImageUrl}
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
