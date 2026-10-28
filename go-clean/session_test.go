package session

import (
	"testing"
	"time"
)

var secret = []byte("desk-secret")

func TestRoundTrip(t *testing.T) {
	token, err := Issue(secret, "ada", time.Hour, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	agent, err := Agent(secret, token)
	if err != nil || agent != "ada" {
		t.Fatalf("got %q, %v", agent, err)
	}
}

func TestExpiredIsRejected(t *testing.T) {
	token, _ := Issue(secret, "ada", time.Minute, time.Now().Add(-time.Hour))
	if _, err := Agent(secret, token); err == nil {
		t.Fatal("expired token accepted")
	}
}

func TestWrongSecretIsRejected(t *testing.T) {
	token, _ := Issue(secret, "ada", time.Hour, time.Now())
	if _, err := Agent([]byte("other"), token); err == nil {
		t.Fatal("token signed with another secret accepted")
	}
}
