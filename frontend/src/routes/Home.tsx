import { For, Show, createEffect, createMemo, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { GetAlbumCover, GetRandomAlbums, LoadRandomAlbums } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export function Home() {
    const [hidden, setHidden] = createSignal(true);
    const [albums, {mutate, refetch}] = createResource<Array<main.Album | null>>(GetRandomAlbums);

    onMount(() => {
        // Fade in the UI
        setTimeout(() => setHidden(false), 150);
    });

    const reload = () => {
        LoadRandomAlbums();
        mutate((new Array(20)).map(() => null));
        setTimeout(refetch, 100);
    };

    return (
        <div class={`min-h-screen ${hidden() ? "opacity-0" : "opacity-100"} transition-opacity`}>
            <h1 class="font-black text-2xl pt-6 pb-4 pl-2">
                Random albums
                <button
                    class="text-xs font-normal mx-1 p-1 rounded underline hover:bg-zinc-900"
                    onClick={reload}
                >
                    Reload
                </button>
            </h1>
            <div class="pb-4 overflow-scroll whitespace-nowrap">
                <For each={albums()}>
                    {(album) => <Album album={album} />}
                </For>
            </div>
        </div>
    );
}

function Album(props: { album: main.Album | null }) {
    const [coverBytes, {mutate, refetch}] = createResource<Array<number> | null>(async() => GetAlbumCover(props.album?.id ?? ""));

    createEffect(() => {
        if (!props.album) {
            mutate(null);
            return;
        }

        refetch();
    });

    const base64Image = createMemo(() => {
        if (coverBytes.state !== "ready") return "";

        // At runtime this is a string, not a number array
        const bytes = coverBytes() as unknown as string;
        return `data:;base64,${bytes}`;
    });

    const isNull = createMemo(() => !props.album);
    const opacity = createMemo(() => `${isNull() ? "opacity-0" : "opacity-100"} transition-opacity`);

    return (
        <div class="inline-block mx-2 p-1 w-32 rounded bg-zinc-900">
            <Show when={isNull()}>
                <div class="w-30 h-30" />
            </Show>
            <Show when={!isNull()}>
                <img
                    class={`inline-block rounded w-30 h-30 transition-opacity ${coverBytes.state === "ready" ? "opacity-100" : "opacity-0"}`}
                    src={base64Image()}
                    alt=""
                />
            </Show>

            <div class={`text-sm overflow-hidden overflow-ellipsis pt-1 ${opacity()}`}>
                {props.album?.name ?? "..."}
            </div>
            <div class={`text-xs overflow-hidden overflow-ellipsis ${opacity()}`}>
                {props.album?.albumArtist ?? "..."}
            </div>

        </div>
    );
}
