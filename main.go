package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", ":8080", "http service address")
var homeTemplate = template.Must(template.ParseFiles("home.html"))

func main() {
	flag.Parse()

	if port, ok := os.LookupEnv("PORT"); ok {
		*addr = fmt.Sprintf(":%s", port)
	}

	hub := newHub()
	go hub.run()

	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	log.Printf("Listening on port %s", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not Found", 404)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	homeTemplate.Execute(w, r.Host)
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan *Message
	register   chan *Client
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			log.Println("Registering new client")
			h.clients[client] = true
		case client := <-h.unregister:
			log.Println("-Unregistering client", client)
			if _, ok := h.clients[client]; ok {
				close(client.send)
				delete(h.clients, client)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

const (
	maxMessageSize = 1024000
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}

	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024000,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan *Message
}

type Message struct {
	Type   string `json:"type"`
	Symbol string `json:"symbol"`
	Data   string `json:"data"`
}

func (m *Message) Json() []byte {
	if b, err := json.Marshal(m); err == nil {
		return b
	}
	log.Printf("Message marshal error: %s", m)
	return []byte{}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)

	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		json := new(Message)
		err := c.conn.ReadJSON(json)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		typeHandler(json)
		c.hub.broadcast <- json
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	go c.Populate()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				log.Println(err)
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func (c *Client) Populate() {

	for key, val := range cache {
		m := &Message{}
		m.Symbol = key
		m.Type = "ADD_STOCK_SUCCESS"
		m.Data = string(val)
		c.send <- m
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error: ", err)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan *Message, 10)}
	client.hub.register <- client

	go client.writePump()
	client.readPump()
}
