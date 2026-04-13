package util

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/ttacon/libphonenumber"
)

// NormalizePhoneNumber normalizes Indonesian phone numbers to format 628xxxxxxxxxx
// Accepts formats: 08xxxxxxxxxx, 628xxxxxxxxxx, +628xxxxxxxxxx, 08-xxxx-xxxx, 628-xxxx-xxxx, etc.
func NormalizePhoneNumber(phone string) (string, error) {
	if phone == "" {
		return "", fmt.Errorf("phone number cannot be empty")
	}

	// Remove all non-digit characters
	cleaned := regexp.MustCompile(`[^\d]`).ReplaceAllString(phone, "")

	// Check if it starts with country code +62 or 62
	if strings.HasPrefix(cleaned, "62") {
		// Already has country code, validate using libphonenumber
		num, err := libphonenumber.Parse(cleaned, "ID")
		if err != nil {
			return "", fmt.Errorf("invalid phone number format: %w", err)
		}

		if !libphonenumber.IsValidNumber(num) {
			return "", fmt.Errorf("invalid phone number")
		}

		// Format to E.164 format (with country code)
		formatted := libphonenumber.Format(num, libphonenumber.E164)
		// Remove + sign to match our format (628xxxxxxxxxx)
		return strings.TrimPrefix(formatted, "+"), nil
	}

	// Assume it starts with 0, add 62 country code
	cleaned = "62" + cleaned

	// Validate using libphonenumber
	num, err := libphonenumber.Parse(cleaned, "ID")
	if err != nil {
		return "", fmt.Errorf("invalid phone number format: %w", err)
	}

	if !libphonenumber.IsValidNumber(num) {
		return "", fmt.Errorf("invalid phone number")
	}

	// Format to E.164 format (with country code)
	formatted := libphonenumber.Format(num, libphonenumber.E164)
	// Remove + sign to match our format (628xxxxxxxxxx)
	return strings.TrimPrefix(formatted, "+"), nil
}

// GeneratePasswordFromPhone generates a password from the last 6 digits of phone number
func GeneratePasswordFromPhone(phone string) string {
	if len(phone) < 6 {
		// Fallback: if phone is too short, use last digits
		return phone
	}
	return phone[len(phone)-6:]
}
