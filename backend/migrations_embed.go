package backend

import "embed"

//go:embed all:migrations
var MigrationFS embed.FS
