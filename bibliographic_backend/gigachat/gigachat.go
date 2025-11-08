package gigachat

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/evgensoft/gigachat"
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

type Service struct {
	Client *gigachat.Client
}

func New(cl *gigachat.Client) *Service {
	return &Service{Client: cl}
}

func (s *Service) HandleForm(w http.ResponseWriter, r *http.Request) {
	var req FormRequest

	// Парсим входной JSON
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		log.Println(err)
		return
	}

	response, err := s.SendRequest(req)
	if err != nil {
		http.Error(w, "failed to send request to gptServer", http.StatusInternalServerError)
		log.Println(fmt.Errorf("gptServerClient.SendRequest: %w", err))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Service) SendRequest(req FormRequest) (FormResponse, error) {
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
	resp, err := s.Client.Chat(chatReq)
	if err != nil {
		return FormResponse{}, fmt.Errorf("s.Client.Chat: %w", err)
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
	// response.Answer = "Исследование механизма балансировки нагрузки многосерверной сетевой системы на основе теории Марковских процессов / Т. Н. Моисеев, О. Я. Кравец // Информационные технологии моделирования и управления. – 2005."

	return response, nil
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

//task13--------------------------------------------------------------------------------------------

func (s *Service) IdentifyTypes(unformedLinks []string) []string {
	directive, userMessage := buildTypePrompt(unformedLinks)
	types, err := s.SendPromptRequest(directive, userMessage)
	if err != nil {
		log.Println(fmt.Errorf("gptServerClient.SendRequest: %w", err))
	}
	return types
}

func (s *Service) SendPromptRequest(directive string, userMessage string) ([]string, error) {

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
	resp, err := s.Client.Chat(chatReq)
	if err != nil {
		return nil, fmt.Errorf("s.Client.Chat: %w", err)
	}

	// Формируем ответ
	response := FormResponse{
		Answer: "",
	}

	for _, choice := range resp.Choices {
		response.Answer += choice.Message.Content
	}
	result := strings.Split(response.Answer, ";")

	return result, nil
}

func buildTypePrompt(unformedLinks []string) (string, string) {
	userMessage := GPTUserTypeRequestAnnotationString + "'"
	for _, str := range unformedLinks {
		userMessage += (str + "; ")
	}
	userMessage += "'"

	directive := GPTTypeDirectiveString

	return directive, userMessage
}
