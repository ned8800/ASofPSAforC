package utils

const minSearchSymbols = 5

func SearchInputIsValid(input string) bool {

	if len(input) < minSearchSymbols {
		return false
	}
	return true
}
