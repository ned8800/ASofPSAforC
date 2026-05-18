package search

import (
    "bytes"
    "math/rand"
    "strconv"

    "fmt"
    "io"
    "log"
    "net/http"
    "net/http/cookiejar"
    "net/url"
    "strings"

    "golang.org/x/net/html"
)

const MaxIDsToProcess = 5

func Search(title string) (map[string]string, error) {

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

    jar, _ := cookiejar.New(nil)
    client := &http.Client{Jar: jar}

    resp, err := client.Get(fullURL)
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

    ids, err := extractIDs(htmlContent)
    if err != nil {
        log.Printf("Ошибка извлечения id: %v\n", err)
        return nil, err
    }

    references := make(map[string]string)

    for _, id := range ids[:min(len(ids), MaxIDsToProcess)] {
        randParam := RandElibraryNumber()
        url := fmt.Sprintf("https://www.elibrary.ru/for_reference.asp?id=%s&rand=%s", id, randParam)

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
        result, err := extractRefDiv(htmlContent)
        if err != nil {
            log.Printf("Ошибка извлечения контента: %v\n", err)
            return references, err
        }

        link := "https://www.elibrary.ru/item.asp?id=" + id
        references[link] = result

    }

    return references, nil
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

func RandElibraryNumber() string {
    // max := big.NewInt(int64(time.Now().UnixNano()))
    // num, err := rand.Int(rand.Reader, max)
    // if err != nil {
    //  panic(err)
    // }
    // return strconv.FormatFloat(num.Int64(), 'f' , 10, 64)

    // Генерация случайного числа float64 в диапазоне [0.0, 1.0)
    randomNumber := rand.Float64()
    return strconv.FormatFloat(randomNumber, 'f', 17, 64)
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
