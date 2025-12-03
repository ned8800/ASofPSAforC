package utils

import (
	"errors"
	"regexp"
	"strings"
)

const (
	minSearchSymbols = 5
	minFormatSymbols = 15
	minFormatWords   = 4
)

var (
	ErrDigitsOnly     = errors.New("input is only digits")
	ErrInputTooShort  = errors.New("input is too short")
	ErrNotEnoughWords = errors.New("not enough words")
)

func SearchInputIsValid(input string) error {
	if len(input) < minSearchSymbols {
		return ErrInputTooShort
	}

	if isDigitsOnly(input) {
		return ErrDigitsOnly
	}

	return nil
}

func FormatInputIsValid(input string) error {
	if len(input) < minFormatSymbols {
		return ErrInputTooShort
	}

	if countWords(input) < minFormatWords {
		return ErrNotEnoughWords
	}

	if isDigitsOnly(input) {
		return ErrDigitsOnly
	}

	return nil
}

func countWords(s string) int {
	words := strings.Fields(s)
	return len(words)
}

func isDigitsOnly(str string) bool {
	match, _ := regexp.MatchString(`^\d+$`, str)
	return match
}
