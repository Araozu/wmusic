package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/adrg/xdg"
)

// Stores information about the album covers cache
type AlbumCoverInfo struct {
	Cached    bool
	Error     error
	WaitGroup *sync.WaitGroup
}

// Caches info about the album covers
var albumCoverCacheInfo = make(map[string]*AlbumCoverInfo)
var cacheMutex = sync.RWMutex{}

func generateCacheFilename(albumId string) string {
	albumCacheFile, err := xdg.CacheFile(fmt.Sprintf("%s/%s", appname, albumId))
	if err != nil {
		panic(fmt.Sprint("error creating cacheFile url: ", err))
	}
	return albumCacheFile
}

// Loads a single album cover and caches it in XDG_CACHE_HOME
// First it checks if the cover already exists in XDG_CACHE_HOME
// If it doesn't, loads it and stores it
func loadAlbumCover(albumId string) {
	// Check cache info
	cacheMutex.Lock()
	_, ok := albumCoverCacheInfo[albumId]
	cacheMutex.Unlock()
	if ok {
		log.Print("album cover: cache hit: ", albumId)
		return
	}

	albumCacheFile := generateCacheFilename(albumId)

	// Attempt to read file
	if _, err := os.Stat(albumCacheFile); err == nil {
		// File exists
		log.Print("album cover: cache hit (disk): ", albumId)
		cacheMutex.Lock()
		albumCoverCacheInfo[albumId] = &AlbumCoverInfo{
			Cached:    true,
			WaitGroup: &sync.WaitGroup{},
		}
		cacheMutex.Unlock()
		return
	}

	// Load cover from network
	log.Print("load album cover for ", albumId)
	coverInfo := AlbumCoverInfo{
		Cached:    false,
		WaitGroup: &sync.WaitGroup{},
	}
	coverInfo.WaitGroup.Add(1)
	defer coverInfo.WaitGroup.Done()

	cacheMutex.Lock()
	albumCoverCacheInfo[albumId] = &coverInfo
	cacheMutex.Unlock()

	response, err := client.R().
		// TODO: replace `fernando` with the username
		Get(fmt.Sprintf(
			"%s/rest/getCoverArt.view?id=%s&u=%s&s=12e7f3&t=%s&v=1.13.0&c=wmusic&size=300",
			serverUrl,
			albumId,
			"fernando",
			"d7bbe92d7da363aa202ae16136887adc",
		))

	if err != nil {
		log.Print("error loadAlbumCover: ", err)
		return
	}

	if !response.IsSuccess() {
		log.Print("error loadAlbumCover")
		log.Printf("%s", response.Body())
		coverInfo.Error = errors.New("error loading")
		return
	}

	imgBytes := response.Body()

	// Write the image to cache
	err = os.WriteFile(albumCacheFile, imgBytes, 0644)
	if err != nil {
		coverInfo.Error = errors.New("error writing album cover to disk")
		log.Fatalf("Error writing to cache file for album cover: %s", albumCacheFile)
		return
	}

	log.Print("Loading albumCover for ", albumId, " successful")
}

// Tries to load the album cover
func (a *App) GetAlbumCover(albumId string) ([]byte, error) {
	cacheMutex.Lock()
	coverInfo, ok := albumCoverCacheInfo[albumId]
	cacheMutex.Unlock()
	if !ok {
		panic("Illegal state: Tried to load an album, but it wasn't on memory cache")
	}

	coverInfo.WaitGroup.Wait()

	if coverInfo.Error != nil {
		return nil, coverInfo.Error
	}

	// Read the file
	filename := generateCacheFilename(albumId)
	log.Print("reading: ", filename)
	bytes, err := os.ReadFile(filename)
	if err != nil {
		log.Fatal("error getting album cover: ", err)
		return nil, errors.New("error reading cover file")
	}

	return bytes, nil
}
