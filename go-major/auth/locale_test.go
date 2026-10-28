package auth

import "testing"

func TestPreferredLanguage(t *testing.T) {
	for header, want := range map[string]string{
		"fr-CH, fr;q=0.9, en;q=0.8": "fr",
		"":                          "en",
		"de":                        "de",
	} {
		if got := PreferredLanguage(header); got != want {
			t.Errorf("PreferredLanguage(%q) = %q, want %q", header, got, want)
		}
	}
}
