// Package embed provides the bundled JavaScript source for the k6 testing jslib.
// By embedding the bundle here, we ensure that Go's tooling includes it
// when the module is vendored.
package embed

import _ "embed"

// Bundle holds the compiled IIFE bundle for k6/Sobek embedding.
//
//go:embed index.iife.js
var Bundle []byte
