package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

const (
	apiKey = "c896ba62d7b5227dee7f54a70bb461e7"
	host   = "http://marketdata.websol.barchart.com/getHistory.json"
)

var (
	cache = make(map[string][]byte, 10)
)

func typeHandler(m *Message) *Message {
	switch m.Type {
	case "ADD_STOCK_REQUEST":
		var status = 200
		var data []byte
		var ok bool

		if data, ok = cache[m.Symbol]; ok {
			log.Println(m.Symbol, "from cache")
			m.Data = string(data)
		} else {
			log.Println(m.Symbol, "from request")
			status, data = addHandler(m.Symbol)
			m.Data = string(data)
		}

		log.Println("status", status)
		if status != 200 {
			m.Type = "ADD_STOCK_FAIL"
		} else {
			m.Type = "ADD_STOCK_SUCCESS"
			cache[m.Symbol] = data
		}

	case "REMOVE_STOCK_REQUEST":
		m.Type = "REMOVE_STOCK_SUCCESS"
		delete(cache, m.Symbol)
	}
	return m
}

func addHandler(ticker string) (int, []byte) {
	client := &http.Client{}
	body := bytes.NewBuffer(nil)

	u, err := url.Parse(host)
	if err != nil {
		log.Println("URL parse error: ", err)
		return 400, body.Bytes()
	}

	q := u.Query()
	q.Set("key", apiKey)
	q.Set("symbol", ticker)
	q.Set("type", "daily")
	// Go back a year and format YYYYMMDD
	q.Set("startDate", time.Now().AddDate(-1, 0, 0).Format("20060102"))
	u.RawQuery = q.Encode()

	log.Println(u.String())
	request, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		log.Println("NewRequest error: ", err)
		return 400, body.Bytes()
	}

	resp, err := client.Do(request)
	if err != nil {
		log.Println("Do error: ", err)
		return 400, body.Bytes()
	}
	defer resp.Body.Close()

	io.Copy(body, resp.Body)

	var foo interface{}
	err = json.Unmarshal(body.Bytes(), &foo)
	foo = foo.(map[string]interface{})["status"].(map[string]interface{})["code"].(float64)

	return int(foo.(float64)), body.Bytes()
}
