package utils

const minSearchSymbols = 5
const minFormatSymbols = 15

func SearchInputIsValid(input string) bool {

	if len(input) < minSearchSymbols {
		return false
	}
	return true
}

func FormatInputIsValid(input string) bool {
	return len(input) >= minFormatSymbols
}
