package utils

import (
	"regexp"
	"strings"
)

const minSearchSymbols = 5
const minFormatSymbols = 15
const minFormatWords = 4

func SearchInputIsValid(input string) bool {

	if len(input) < minSearchSymbols {
		return false
	}

	if isDigitsOnly(input) {
		return false
	}

	return true
}

func FormatInputIsValid(input string) bool {

	if len(input) < minFormatSymbols {
		return false
	}

	if countWords(input) < minFormatWords {
		return false
	}

	if isDigitsOnly(input) {
		return false
	}

	return true
}

func countWords(s string) int {
	words := strings.Fields(s)
	return len(words)
}

func isDigitsOnly(str string) bool {
	match, _ := regexp.MatchString(`^\d+$`, str)
	return match
}
