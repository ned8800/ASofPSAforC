package search

import (
    "io"
    "log"
    "net/http"
    "net/url"
    "net/http/cookiejar"
    "strings"
    "golang.org/x/net/html"
    "bytes"
    "crypto/rand"
    "fmt"
    "math/big"
    "strconv"
    "time"
)

const MaxIDsToProcess = 5

func Search(title string) []string {
    
    queryParams := url.Values{}
    queryParams.Set("where_fulltext", "on")
    queryParams.Set("where_name", "on")
    queryParams.Set("where_abstract", "on")
    queryParams.Set("where_keywords", "on")
    queryParams.Set("where_affiliation", "")
    queryParams.Set("where_references", "")
    queryParams.Set("type_article", "on")
    queryParams.Set("type_disser", "on")
    queryParams.Set("type_book", "on")
    queryParams.Set("type_report", "on")
    queryParams.Set("type_conf", "on")
    queryParams.Set("type_patent", "on")
    queryParams.Set("type_preprint", "on")
    queryParams.Set("type_grant", "on")
    queryParams.Set("type_dataset", "on")
    queryParams.Set("search_freetext", "")
    queryParams.Set("search_morph", "on")
    queryParams.Set("search_fulltext", "")
    queryParams.Set("search_open", "")
    queryParams.Set("search_results", "")
    queryParams.Set("titles_all", "")
    queryParams.Set("authors_all", "")
    queryParams.Set("rubrics_all", "")
    queryParams.Set("queryboxid", "")
    queryParams.Set("itemboxid", "")
    queryParams.Set("begin_year", "")
    queryParams.Set("end_year", "")
    queryParams.Set("issues", "all")
    queryParams.Set("orderby", "rank")
    queryParams.Set("order", "rev")
    queryParams.Set("changed", "1")
    queryParams.Set("ftext", title)

    // Формируем URL с параметрами
    url := "https://www.elibrary.ru/query_results.asp?"
    fullURL := url + queryParams.Encode()
    //log.Println(fullURL)

    jar, _ := cookiejar.New(nil)
    client := &http.Client{Jar: jar}

    resp, err := client.Get(fullURL)
    if err != nil {
        log.Fatalf("Ошибка при выполнении запроса: %v", err)
    }

    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatalf("Ошибка чтения ответа: %v\n", err)
    }

    htmlContent := string(bodyBytes)

    //log.Println(htmlContent)

    ids, err := extractIDs(htmlContent)
    if err != nil {
        log.Fatalf("Ошибка извлечения id: %v\n", err)
        return nil
    }

    var references []string

    for _, id := range ids[:min(len(ids), MaxIDsToProcess)] {
        randParam := randNumber()
        url := fmt.Sprintf("https://www.elibrary.ru/for_reference.asp?id=%s&rand=%s", id, randParam)

        resp, err := client.Get(url)
        if err != nil {
            log.Fatalf("Ошибка при выполнении запроса: %v", err)
        }

        bodyBytes, err := io.ReadAll(resp.Body)
        if err != nil {
            log.Fatalf("Ошибка чтения ответа: %v\n", err)
        }

        htmlContent := string(bodyBytes)
        result, err := extractRefDiv(htmlContent)
        if err != nil {
            log.Fatalf("Ошибка извлечения контента: %v\n", err)
            return nil
        }

        references = append(references, result)

    }

    return references

}


func extractIDs(htmlContent string) ([]string, error) {
    r := bytes.NewBufferString(htmlContent)
    doc, err := html.Parse(r)
    if err != nil {
        return nil, err
    }

    var ids []string

    var f func(*html.Node)
    f = func(n *html.Node) {
        if n.Type == html.ElementNode && n.Data == "a" {
            for _, attr := range n.Attr {
                if attr.Key == "href" && strings.HasPrefix(attr.Val, "/item.asp?id=") {
                    id := strings.TrimPrefix(attr.Val, "/item.asp?id=")
                    ids = append(ids, id)
                }
            }
        }

        for c := n.FirstChild; c != nil; c = c.NextSibling {
            f(c)
        }
    }

    f(doc)

    return ids, nil
}

func randNumber() string {
    max := big.NewInt(int64(time.Now().UnixNano()))
    num, err := rand.Int(rand.Reader, max)
    if err != nil {
        panic(err)
    }
    return strconv.FormatInt(num.Int64(), 10)
}

func extractRefDiv(htmlContent string) (string, error) {
    // Парсим HTML
    doc, err := html.Parse(strings.NewReader(htmlContent))
    if err != nil {
        return "", fmt.Errorf("ошибка при разборе HTML: %w", err)
    }

    // Поиск нужного элемента
    var refDivContent string
    var traverse func(*html.Node)
    traverse = func(n *html.Node) {
        if n.Type == html.ElementNode && n.Data == "div" {
            for _, attr := range n.Attr {
                if attr.Key == "id" && attr.Val == "ref" {
                    refDivContent = innerText(n)
                    break
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

// innerText собирает внутренний текст элемента
func innerText(node *html.Node) string {
    var buffer strings.Builder

    var walk func(*html.Node)
    walk = func(n *html.Node) {
        switch n.Type {
        case html.TextNode:
            buffer.WriteString(n.Data)
        default:
            for child := n.FirstChild; child != nil; child = child.NextSibling {
                walk(child)
            }
        }
    }

    walk(node)

    return strings.TrimSpace(buffer.String())
}