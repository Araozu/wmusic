package main

import (
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/go-resty/resty/v2"
)

type AuthError struct {
	Error string `json:"error"`
}

var LoggedUser AuthSuccess
var randomAlbumWaitGroup sync.WaitGroup
var randomAlbums []Album

// (Tries to) login to a remote navidrome server
func (a *App) Login(server, username, password string) (bool, error) {
	log.Print("begin Login to server")
	client := resty.New()

	// TODO: check server for leading https and trailing /, normalize

	successData := AuthSuccess{}
	errorData := AuthError{}

	response, err := client.R().
		SetHeader("Content-Type", "").
		SetBody(fmt.Sprintf(`{"username":"%s","password":"%s"}`, username, password)).
		SetResult(&successData).
		SetError(&errorData).
		Post(fmt.Sprintf("%s/auth/login", server))

	if err != nil {
		log.Print("Login error", err)
		return false, err
	}

	if response.IsSuccess() {
		log.Printf("%+v", successData)

		// Set global session
		LoggedUser = successData
		// Begin to load the list of albums on the background
		randomAlbumWaitGroup.Add(1)
		go loadAlbums(server)

		return true, nil
	} else if response.IsError() {
		log.Printf("%+v", errorData)
		return false, errors.New(errorData.Error + ".")
	} else {
		log.Printf("ehhh???")
		return false, errors.New("invalid state")
	}
}

// Waits for the random albums to be loaded, and returns them.
// This function assumes that the random albums are being loaded in the background.
func (a *App) GetRandomAlbums() ([]Album, error) {
	log.Printf("Waiting for loading group...")
	randomAlbumWaitGroup.Wait()
	log.Printf("Waiting group finished")

	return randomAlbums, nil
}

// Loads a list of random albums from the server.
func loadAlbums(serverUrl string) {
	defer randomAlbumWaitGroup.Done()
	log.Print("begin loadAlbums")
	client := resty.New()

	var errorData AuthError
	response, err := client.R().
		SetHeader("x-nd-authorization", fmt.Sprintf("Bearer %s", LoggedUser.Token)).
		SetResult(&randomAlbums).
		SetError(&errorData).
		Get(fmt.Sprintf("%s/api/album?_end=20&_order=DESC&_sort=random&_start=0", serverUrl))

	if err != nil {
		log.Print("Get albums error")
	}

	if response.IsSuccess() {
		log.Print("Get albums success")
		// TODO: Begin to load album artwork in the background
		// Album artwork comes from the url /rest/getCoverArt.view
	}

	// TODO: Do the loading
}
