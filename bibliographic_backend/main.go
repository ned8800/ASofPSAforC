package main

import (
	gigachatService "bibliographic_litriture_gigachat/gigachat"
	search "bibliographic_litriture_gigachat/search"
	"bibliographic_litriture_gigachat/utils"

	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/evgensoft/gigachat"
	"github.com/gorilla/mux"
)

type elibraryArticlesJSON struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}

func handleElibrarySearch(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	query := params.Get("query")

	if err := utils.SearchInputIsValid(query); err != nil {
		log.Printf("utils.SearchInputIsValid: %v", err)
		http.Error(w, "Недостаточно данных для поиска", http.StatusBadRequest)
		return
	}

	articles, err := search.Search(query)
	if err != nil {
		log.Printf("Ошибка при выполнении запроса: %v \n", err)
		http.Error(w, "Не удалось выполнить поиск", http.StatusBadRequest)
		return
	}

	var response []elibraryArticlesJSON

	for link, title := range articles {
		article := elibraryArticlesJSON{
			Title: title,
			Link:  link,
		}
		response = append(response, article)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Создаём GigaChat клиент
	gigachatClient := gigachat.NewClient(os.Getenv("GIGACHAT_CLIENT_ID"), os.Getenv("GIGACHAT_CLIENT_SECRET"))

	gigaChatService := gigachatService.New(gigachatClient)

	// b, err := bot.New(gigaChatService)
	// if err != nil {
	// 	log.Fatalf("bot.New: %s", err)
	// }

	// err = b.Start()
	// if err != nil {
	// 	log.Fatalf("failed to start bot: %s", err)
	// }

	r := mux.NewRouter()

	// CORS middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	r.HandleFunc("/request", gigaChatService.HandleForm).Methods(http.MethodPost, http.MethodOptions)

	r.HandleFunc("/search_elibrary", handleElibrarySearch).Methods(http.MethodGet, http.MethodOptions)

	r.HandleFunc("/requestMultyRow", gigaChatService.HandleFormMultyRow).Methods(http.MethodPost, http.MethodOptions)

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
