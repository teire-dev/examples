// Package session issues and checks signed session tokens for a support desk.
package session

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Issue signs a token for the agent that expires after ttl.
func Issue(secret []byte, agent string, ttl time.Duration, now time.Time) (string, error) {
	claims := jwt.MapClaims{"sub": agent, "exp": now.Add(ttl).Unix()}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

// Agent returns the agent a valid token was issued to.
func Agent(secret []byte, token string) (string, error) {
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})
	if err != nil || !parsed.Valid {
		return "", errors.New("invalid session")
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid session")
	}
	sub, _ := claims["sub"].(string)
	return sub, nil
}
