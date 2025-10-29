package search

import (
	//"bytes"
	// "math/rand"
	// "strconv"

	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"time"

	"strings"

	"golang.org/x/net/html"
)

const DelayTime = 1

func SearchGoogleScholar(title string) (map[string]string, error) {

	queryParams := url.Values{}
	queryParams.Set("q", title)

	url := "https://scholar.google.com/scholar?"
	fullURL := url + queryParams.Encode()

	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar}

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		fmt.Println("Ошибка формирования запроса:", err)
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept-Language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("DNT", "1")                 // Do Not Track
	req.Header.Set("Connection", "keep-alive") // поддерживает постоянное соединение
	req.Header.Set("Upgrade-Insecure-Requests", "1")
	req.Header.Set("Referer", "https://site.ru/")
	req.Header.Set("Sec-Fetch-Site", "same-site")
	req.Header.Set("Sec-Fetch-Mode", "navigate")
	req.Header.Set("Sec-Fetch-Dest", "document")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
	resp, err := client.Do(req)
	//resp, err := client.Get(fullURL)
	if err != nil {
		log.Printf("Ошибка при выполнении запроса: %v \n", err)
		return nil, err
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Ошибка чтения ответа: %v\n", err)
		return nil, err
	}

	htmlContent := string(bodyBytes)
	if strings.Contains(htmlContent, "captcha") {
		return nil, errors.New("ошибка поиска в google scholar")
	}
	//fmt.Print(resp.StatusCode)

	ids, hrefs := extractLinksAndIDs(htmlContent)
	fmt.Print(ids)

	references := make(map[string]string)
	for i, id := range ids[:min(len(ids), MaxIDsToProcess)] {

		time.Sleep(time.Second * DelayTime)

		url := fmt.Sprintf("https://scholar.google.com/scholar?q=info:%s:scholar.google.com/&output=cite", id)

		resp, err := client.Get(url)
		if err != nil {
			log.Printf("Ошибка при выполнении запроса: %v", err)
			return references, err
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Ошибка чтения ответа: %v\n", err)
			return references, err
		}

		htmlContent := string(bodyBytes)
		//fmt.Print(htmlContent)
		result, err := extractDiv(htmlContent)
		if err != nil {
			log.Printf("Ошибка извлечения контента: %v\n", err)
			return references, err
		}

		references[hrefs[i]] = result

	}

	return references, nil

}

func extractLinksAndIDs(htmlContent string) ([]string, []string) {
	var ids []string
	var hrefs []string

	// Преобразуем строку в байтовый поток
	r := strings.NewReader(htmlContent)
	z := html.NewTokenizer(r)

	for {
		tt := z.Next()
		switch tt {
		case html.ErrorToken:
			// завершение разбора
			return ids, hrefs
		case html.StartTagToken:
			// Анализируем текущий тег
			tagName, _ := z.TagName()
			if string(tagName) == "a" {
				var id, href string
				for {
					k, v, more := z.TagAttr()
					if !more {
						break
					}
					attrKey := string(k)
					attrValue := string(v)
					switch attrKey {
					case "id":
						id = attrValue
					case "href":
						href = attrValue
					}
				}
				if id != "" && href != "" {
					ids = append(ids, id)
					hrefs = append(hrefs, href)
				}
			}
		}
	}
}

func extractDiv(htmlContent string) (string, error) {
	// Парсим HTML
	doc, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		return "", fmt.Errorf("ошибка при разборе HTML: %w", err)
	}

	// Поиск нужного элемента
	var refDivContent string
	var found bool
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if found {
			return // прекращаем поиск, если уже нашли нужный элемент
		}
		if n.Type == html.ElementNode && n.Data == "div" {
			for _, attr := range n.Attr {
				if attr.Key == "class" && containsClass(attr.Val, "gs_citr") {
					refDivContent = innerText(n)
					found = true
					return
				}
			}
		}

		for child := n.FirstChild; child != nil; child = child.NextSibling {
			traverse(child)
		}
	}

	traverse(doc)

	return refDivContent, nil
}

func containsClass(classList string, targetClass string) bool {
	for _, cls := range strings.Fields(classList) {
		if cls == targetClass {
			return true
		}
	}
	return false
}
