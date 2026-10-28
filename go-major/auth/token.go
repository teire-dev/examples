// Package auth issues and verifies the session tokens of the support desk API.
package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Issuer names this service in every token it signs.
const Issuer = "support-desk"

// ErrExpired is returned for a well-formed token whose lifetime has passed.
var ErrExpired = errors.New("token expired")

// Claims are the session's claims: who the user is and what they may do.
type Claims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GetExpirationTime implements the jwt.Claims interface.
func (c *Claims) GetExpirationTime() (*jwt.NumericDate, error) {
	return c.RegisteredClaims.GetExpirationTime()
}

// GetIssuedAt implements the jwt.Claims interface.
func (c *Claims) GetIssuedAt() (*jwt.NumericDate, error) {
	return c.RegisteredClaims.GetIssuedAt()
}

// GetNotBefore implements the jwt.Claims interface.
func (c *Claims) GetNotBefore() (*jwt.NumericDate, error) {
	return c.RegisteredClaims.GetNotBefore()
}

// GetIssuer implements the jwt.Claims interface.
func (c *Claims) GetIssuer() (string, error) {
	return c.RegisteredClaims.GetIssuer()
}

// GetSubject implements the jwt.Claims interface.
func (c *Claims) GetSubject() (string, error) {
	return c.RegisteredClaims.GetSubject()
}

// GetAudience implements the jwt.Claims interface.
func (c *Claims) GetAudience() (jwt.ClaimStrings, error) {
	return c.RegisteredClaims.GetAudience()
}

// Issue signs a session token for userID that is valid from now for ttl.
func Issue(secret []byte, userID, role string, now time.Time, ttl time.Duration) (string, error) {
	claims := &Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:      Issuer,
			Subject:     userID,
			IssuedAt:    jwt.NewNumericDate(now),
			ExpiresAt:   jwt.NewNumericDate(now.Add(ttl)),
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
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpired
		}
		return nil, err
	}
	claims, ok := parsed.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	issuer, err := claims.GetIssuer()
	if err != nil || issuer != Issuer {
		return nil, errors.New("token not issued by " + Issuer)
	}
	return claims, nil
}
