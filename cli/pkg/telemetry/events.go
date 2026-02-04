// Package telemetry provides OpenTelemetry integration for Careti CLI.
package telemetry

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
)

// Event names - matching extension telemetry events where applicable
const (
	// CLI lifecycle events
	EventCLIStarted   = "cli.started"
	EventCLICompleted = "cli.completed"
	EventCLIError     = "cli.error"

	// Task events
	EventTaskCreated   = "task.created"
	EventTaskCompleted = "task.completed"
	EventTaskError     = "task.error"

	// Auth events
	EventAuthStarted   = "user.auth_started"
	EventAuthSucceeded = "user.auth_succeeded"
	EventAuthFailed    = "user.auth_failed"
	EventAuthLoggedOut = "user.auth_logged_out"

	// Instance events
	EventInstanceStarted = "instance.started"
	EventInstanceStopped = "instance.stopped"

	// Command events
	EventCommandExecuted = "command.executed"
)

// LogCLIStarted logs CLI startup
func LogCLIStarted(ctx context.Context, version, mode string) {
	Log(ctx, EventCLIStarted,
		attribute.String("version", version),
		attribute.String("mode", mode),
	)
}

// LogCLICompleted logs CLI completion
func LogCLICompleted(ctx context.Context, durationMs int64, success bool) {
	Log(ctx, EventCLICompleted,
		attribute.Int64("duration_ms", durationMs),
		attribute.Bool("success", success),
	)
}

// LogCLIError logs CLI error
func LogCLIError(ctx context.Context, errorType, errorMessage string) {
	Log(ctx, EventCLIError,
		attribute.String("error_type", errorType),
		attribute.String("error_message", errorMessage),
	)
}

// LogTaskCreated logs task creation
func LogTaskCreated(ctx context.Context, mode string, hasImages, hasFiles bool) {
	Log(ctx, EventTaskCreated,
		attribute.String("mode", mode),
		attribute.Bool("has_images", hasImages),
		attribute.Bool("has_files", hasFiles),
	)
}

// LogTaskCompleted logs task completion
func LogTaskCompleted(ctx context.Context, durationMs int64, success bool) {
	Log(ctx, EventTaskCompleted,
		attribute.Int64("duration_ms", durationMs),
		attribute.Bool("success", success),
	)
}

// LogAuthStarted logs auth start
func LogAuthStarted(ctx context.Context, provider string) {
	Log(ctx, EventAuthStarted,
		attribute.String("provider", provider),
	)
}

// LogAuthSucceeded logs auth success
func LogAuthSucceeded(ctx context.Context, provider string) {
	Log(ctx, EventAuthSucceeded,
		attribute.String("provider", provider),
	)
}

// LogAuthFailed logs auth failure
func LogAuthFailed(ctx context.Context, provider, reason string) {
	Log(ctx, EventAuthFailed,
		attribute.String("provider", provider),
		attribute.String("reason", reason),
	)
}

// LogCommandExecuted logs command execution
func LogCommandExecuted(ctx context.Context, command string, args []string) {
	Log(ctx, EventCommandExecuted,
		attribute.String("command", command),
		attribute.Int("arg_count", len(args)),
	)
}

// LogInstanceStarted logs instance startup
func LogInstanceStarted(ctx context.Context, address string) {
	Log(ctx, EventInstanceStarted,
		attribute.String("address", address),
	)
}

// LogInstanceStopped logs instance shutdown
func LogInstanceStopped(ctx context.Context, address string) {
	Log(ctx, EventInstanceStopped,
		attribute.String("address", address),
	)
}
