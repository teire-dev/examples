package auth

import "golang.org/x/text/language"

// PreferredLanguage is the base language of the first tag in an Accept-Language header ("en" when none).
func PreferredLanguage(header string) string {
	tags, _, err := language.ParseAcceptLanguage(header)
	if err != nil || len(tags) == 0 {
		return "en"
	}
	base, _ := tags[0].Base()
	return base.String()
}
