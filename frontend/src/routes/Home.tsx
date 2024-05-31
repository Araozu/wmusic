import { batch, createEffect, createMemo, createResource, createSignal, onMount } from "solid-js";
import { GetAlbumCover, GetRandomAlbums, TriggerAlbumReload } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";
import { createStore } from "solid-js/store";

type AlbumsData = {
    status: "loading" | "ok",
    albums: Array<main.Album | null>
}

export function Home() {
    const [hidden, setHidden] = createSignal(true);

    const [albumsStore, setAlbumsStore] = createStore<AlbumsData>({
        status: "loading",
        albums: new Array(20).fill(null),
    });

    onMount(() => {
        // Fade in the UI
        setTimeout(() => setHidden(false), 150);
        // Load the albums
        loadAlbums();
    });

    // Loads the random albums from Go.
    // This function, when called multiple times, returns the same set.
    const loadAlbums = async() => {
        const response = await GetRandomAlbums();

        // Update the albums
        batch(() => {
            for (let i = 0; i < response.length; i += 1) {
                const album = response[i];

                setAlbumsStore("albums", i, album);
            }
        });
    };

    const triggerAlbumReload = () => {
        // Assign all albums to null
        batch(() => {
            for (let i = 0; i < 20; i += 1) {
                setAlbumsStore("albums", i, null);
            }
        });

        TriggerAlbumReload();
        setTimeout(loadAlbums, 50);
    };

    const els = albumsStore.albums.map((_, idx) => (<Album albums={albumsStore.albums} idx={idx} />));

    return (
        <div class={`min-h-screen ${hidden() ? "opacity-0" : "opacity-100"} transition-opacity`}>
            <h1 class="font-black text-2xl pt-6 pb-4 pl-2">
                Random albums
                <button
                    class="text-xs font-normal mx-1 p-1 rounded underline hover:bg-zinc-900"
                    onClick={triggerAlbumReload}
                >
                    Reload
                </button>
            </h1>
            <div class="pb-4 overflow-scroll whitespace-nowrap">
                {els}
            </div>
        </div>
    );
}

function Album(props: { albums: Array<main.Album | null>, idx: number }) {
    const [coverBytes, {mutate, refetch}] = createResource<Array<number> | null>(async() => GetAlbumCover(props.albums[props.idx]?.id ?? ""));
    const [albumName, setAlbumName] = createSignal("");
    const [artistName, setArtistName] = createSignal("");
    const [imageBase64, setImageBase64] = createSignal("");
    const [imgReady, setImgReady] = createSignal(false);

    const album = createMemo(() => props.albums[props.idx]);

    createEffect(() => {
        const a = album();
        if (a === null) {
            setImgReady(false);
            mutate(null);
            return;
        } else {
            setAlbumName(a.name);
            setArtistName(a.albumArtist);
        }

        refetch();
    });

    createEffect(() => {
        const status = coverBytes.state;
        if (status === "ready") {
            const bytes = coverBytes();
            if (bytes === null) return;
            console.log("new image pushed, ");
            setImageBase64(`data:;base64,${coverBytes()}`);
            setImgReady(true);
        }
    });

    const isNull = createMemo(() => !album());
    const opacity = createMemo(() => `${isNull() ? "opacity-0" : "opacity-100"} transition-opacity`);
    const imgOpacity = createMemo(() => (imgReady() && !isNull() ? "opacity-100" : "opacity-0"));

    return (
        <div class="inline-block mx-2 p-1 w-32 rounded bg-zinc-900">
            <div class="w-30 h-30" >
                <img
                    class={`inline-block rounded w-30 h-30 transition-opacity ${imgOpacity()}`}
                    src={imageBase64()}
                    alt=""
                />
            </div>

            <div class={`text-sm overflow-hidden overflow-ellipsis pt-1 ${opacity()}`} title={albumName()}>
                {albumName()}
            </div>
            <div class={`text-xs overflow-hidden overflow-ellipsis ${opacity()}`} title={artistName()}>
                {artistName()}
            </div>

        </div>
    );
}
