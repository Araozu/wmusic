package main

import (
	"fmt"
	"log"
	"time"

	"github.com/go-resty/resty/v2"
)

type AuthSuccess struct {
	Id            string `json:"id"`
	IsAdmin       bool   `json:"isAdmin"`
	Name          string `json:"name"`
	SubsonicSalt  string `json:"subsonicSalt"`
	SubsonicToken string `json:"subsonicToken"`
	Token         string `json:"token"`
	Username      string `json:"fernando"`
}

type AuthError struct {
	Error string `json:"error"`
}

// / (Tries to) login to a remote navidrome server
func (a *App) Login(server, username, password string) bool {
	client := resty.New()

	// TODO: check server for leading https and ending /, normalize

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
		return false
	}

	if response.IsSuccess() {
		log.Printf("%+v", successData)
		return true
	} else if response.IsError() {
		log.Printf("%+v", errorData)
		return false
	}

	log.Print("Login: ", server, username, password)
	time.Sleep(1 * time.Second)

	return true
}
