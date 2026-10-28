// Package auth issues and verifies the session tokens of the support desk API.
package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Issuer names this service in every token it signs.
const Issuer = "support-desk"

// ErrExpired is returned for a well-formed token whose lifetime has passed.
var ErrExpired = errors.New("token expired")

// Claims are the session's claims: who the user is and what they may do.
type Claims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// Issue signs a session token for userID that is valid from now for ttl.
func Issue(secret []byte, userID, role string, now time.Time, ttl time.Duration) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			Issuer:    Issuer,
			Subject:   userID,
			IssuedAt:  now.Unix(),
			ExpiresAt: now.Add(ttl).Unix(),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

// Verify checks the signature and lifetime of a session token and returns its claims.
func Verify(secret []byte, token string) (*Claims, error) {
	parsed, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", t.Header["alg"])
		}
		return secret, nil
	})
	if err != nil {
		var ve *jwt.ValidationError
		if errors.As(err, &ve) && ve.Errors&jwt.ValidationErrorExpired != 0 {
			return nil, ErrExpired
		}
		return nil, err
	}
	claims, ok := parsed.Claims.(*Claims)
	if !ok || claims.Issuer != Issuer {
		return nil, errors.New("token not issued by " + Issuer)
	}
	return claims, nil
}
