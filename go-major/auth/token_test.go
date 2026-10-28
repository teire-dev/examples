package auth

import (
	"errors"
	"testing"
	"time"
)

var secret = []byte("test-secret")

func TestIssueAndVerify(t *testing.T) {
	token, err := Issue(secret, "u-42", "agent", time.Now(), time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	claims, err := Verify(secret, token)
	if err != nil {
		t.Fatal(err)
	}
	subj, _ := claims.GetSubject()
	if claims.UserID != "u-42" || claims.Role != "agent" || subj != "u-42" {
		t.Fatalf("unexpected claims %+v", claims)
	}
}

func TestExpiredToken(t *testing.T) {
	token, err := Issue(secret, "u-42", "agent", time.Now().Add(-2*time.Hour), time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Verify(secret, token); !errors.Is(err, ErrExpired) {
		t.Fatalf("want ErrExpired, got %v", err)
	}
}

func TestWrongSecret(t *testing.T) {
	token, err := Issue(secret, "u-42", "agent", time.Now(), time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Verify([]byte("another-secret"), token); err == nil || errors.Is(err, ErrExpired) {
		t.Fatalf("want a signature error, got %v", err)
	}
}
