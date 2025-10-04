package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	gigachat "github.com/evgensoft/gigachat"
	"github.com/gorilla/mux"
)

// Структура формы
type FormRequest struct {
	UserRequest   string `json:"user_request"`
	PromptType    string `json:"prompt_type,omitempty"`
	ExampleRecord string `json:"example_record,omitempty"`
}

type FormResponse struct {
	Answer string `json:"answer"`
}

type GigaChatServerClient struct {
	Client *gigachat.Client
}

func (gptServerClient *GigaChatServerClient) handleForm(w http.ResponseWriter, r *http.Request) {
	var req FormRequest

	// Парсим входной JSON
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		log.Println(err)
		return
	}

	directive, userMessage := buildPrompt(req)

	// Запрос в GigaChat
	chatReq := &gigachat.ChatRequest{
		Model: gigachat.ModelGigaChat,
		Messages: []gigachat.Message{
			{
				Role:    gigachat.RoleSystem,
				Content: directive,
			},
			{
				Role:    gigachat.RoleUser,
				Content: userMessage,
			},
		},
	}

	// Отправляем запрос
	resp, err := gptServerClient.Client.Chat(chatReq)
	if err != nil {
		http.Error(w, "request failed: "+err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}

	// Формируем ответ
	response := FormResponse{
		Answer: "",
	}

	for _, choice := range resp.Choices {
		response.Answer += fmt.Sprintf("Библиографическая запись:\n%s\n", choice.Message.Content)
	}

	// format answer
	currentDate := time.Now().Format("02.01.2006") // текущая дата в формате DD.MM.YYYY

	// заменяем все вхождения "DD.MM.YYYY" на текущую дату
	response.Answer = strings.ReplaceAll(response.Answer, "DD.MM.YYYY", currentDate)

	// no spaces between word and :
	response.Answer = strings.ReplaceAll(response.Answer, " \u003a", "\u003a")

	// correct En Dash as in GOST
	response.Answer = strings.ReplaceAll(response.Answer, "\u2014", "\u2013")

	// correct URL as in GOST
	if !strings.Contains(response.Answer, "[Электронный ресурс] \u2013 URL:") {
		response.Answer = strings.ReplaceAll(response.Answer, "URL:", "[Электронный ресурс] \u2013 URL:")
	}

	response.Answer = formatDateReference(response.Answer)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Форматируем дату обращения, добавляя круглые скобки,
// если указанный формат ещё не установлен
func formatDateReference(input string) string {
	// 1. Регулярное выражение для поиска строки вида "(дата обращения: выбран пользователем)"
	reWithParens := regexp.MustCompile(`(?i)\(дата обращения: [^)]*\)`)

	// 2. Регулярное выражение для поиска строки вида "дата обращения: выбран пользователем" (без скобок)
	reWithoutParens := regexp.MustCompile(`(?i)дата обращения: [^\n\r]*`)

	// Текущая дата в формате DD.MM.YYYY
	currentDate := time.Now().Format("02.01.2006")
	replacement := fmt.Sprintf("(дата обращения: %s)", currentDate)

	// Case 1: Заменяем, если есть строка со скобками
	if reWithParens.MatchString(input) {
		return reWithParens.ReplaceAllString(input, replacement)
	}

	// Case 2: Добавляем скобки, если есть строка без них
	if reWithoutParens.MatchString(input) {
		return reWithoutParens.ReplaceAllString(input, replacement)
	}

	// Возвращаем исходную строку, если ни один из шаблонов не найден
	return input
}

func main() {
	// Создаём GigaChat клиент
	gigaChatServerClient := GigaChatServerClient{
		Client: gigachat.NewClient(os.Getenv("GIGACHAT_CLIENT_ID"), os.Getenv("GIGACHAT_CLIENT_SECRET")),
	}

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

	r.HandleFunc("/request", gigaChatServerClient.handleForm).Methods(http.MethodPost, http.MethodOptions)

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func buildPrompt(req FormRequest) (string, string) {
	// Собираем текст вопроса для GPT из формы
	userMessage := fmt.Sprintf("%s'%s'", GPTUserRequestAnnotationString, req.UserRequest)
	promptType := GPTDefaultRecordTypeString

	if req.PromptType != "" && req.PromptType != "Другой" {
		promptType = fmt.Sprintf("\nPrompt type: %s", req.PromptType)
	}

	// Если есть пример записи, добавляем к запросу
	if req.ExampleRecord != "" {
		userMessage = fmt.Sprintf("\nExample: %s. %s", req.ExampleRecord, userMessage)
	} else if example, ok := exampleMap[req.PromptType]; ok {
		userMessage = fmt.Sprintf("\nExample: %s. %s", example, userMessage)
	}

	directive := fmt.Sprintf("%s\n%s'%s'", GPTDirectiveString, GPTLibraryRecordTypeString, promptType)

	return directive, userMessage
}
