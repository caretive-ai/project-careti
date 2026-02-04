// Package telemetry provides OpenTelemetry integration for Careti CLI.
// All telemetry is sent to otel.careti.ai endpoint.
package telemetry

import (
	"context"
	"fmt"
	"os"
	"runtime"
	"sync"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/log"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"

	"github.com/cline/cli/pkg/common"
)

const (
	// DefaultEndpoint is the default OTEL endpoint for Careti
	DefaultEndpoint = "https://otel.careti.ai"
)

var (
	logger      log.Logger
	provider    *sdklog.LoggerProvider
	initialized bool
	mu          sync.Mutex
	enabled     = true
	distinctID  string
)

// Config holds telemetry configuration
type Config struct {
	Endpoint   string
	ServiceName string
	Version    string
	Enabled    bool
}

// Init initializes the telemetry system
func Init(ctx context.Context, cfg Config) error {
	mu.Lock()
	defer mu.Unlock()

	if initialized {
		return nil
	}

	enabled = cfg.Enabled
	if !enabled {
		initialized = true
		return nil
	}

	endpoint := cfg.Endpoint
	if endpoint == "" {
		endpoint = os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
		if endpoint == "" {
			endpoint = DefaultEndpoint
		}
	}

	serviceName := cfg.ServiceName
	if serviceName == "" {
		serviceName = "careti-cli"
	}

	version := cfg.Version
	if version == "" {
		version = "unknown"
	}

	// Generate or retrieve distinct ID
	distinctID = getDistinctID()

	// Create resource with service info
	res, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(version),
			attribute.String("os.type", runtime.GOOS),
			attribute.String("os.arch", runtime.GOARCH),
			attribute.String("distinct_id", distinctID),
		),
	)
	if err != nil {
		return err
	}

	// Create OTLP HTTP exporter for logs
	// Use TLS by default for HTTPS endpoints
	opts := []otlploghttp.Option{
		otlploghttp.WithEndpoint(trimProtocol(endpoint)),
	}
	// Only use insecure for non-HTTPS endpoints (local dev)
	if !isHTTPS(endpoint) {
		opts = append(opts, otlploghttp.WithInsecure())
	}
	exporter, err := otlploghttp.New(ctx, opts...)
	if err != nil {
		return err
	}

	// Create log provider
	provider = sdklog.NewLoggerProvider(
		sdklog.WithResource(res),
		sdklog.WithProcessor(sdklog.NewBatchProcessor(exporter)),
	)

	// Get logger
	logger = provider.Logger(serviceName)

	initialized = true
	return nil
}

// Shutdown gracefully shuts down the telemetry system
func Shutdown(ctx context.Context) error {
	mu.Lock()
	defer mu.Unlock()

	if !initialized || provider == nil {
		return nil
	}

	return provider.Shutdown(ctx)
}

// Log records a telemetry event
func Log(ctx context.Context, event string, attrs ...attribute.KeyValue) {
	if !enabled || logger == nil {
		return
	}

	// Add common attributes
	allAttrs := append([]attribute.KeyValue{
		attribute.String("event", event),
		attribute.String("distinct_id", distinctID),
		attribute.String("brand", common.BrandDisplayName()),
		attribute.Int64("timestamp", time.Now().UnixMilli()),
	}, attrs...)

	record := log.Record{}
	record.SetBody(log.StringValue(event))
	record.SetSeverity(log.SeverityInfo)
	record.SetTimestamp(time.Now())

	// Convert attributes to log attributes
	for _, attr := range allAttrs {
		record.AddAttributes(toLogKeyValue(attr))
	}

	logger.Emit(ctx, record)
}

// LogRequired records a required telemetry event (always sent, ignores enabled flag)
func LogRequired(ctx context.Context, event string, attrs ...attribute.KeyValue) {
	if logger == nil {
		return
	}

	// Add common attributes + _required flag
	allAttrs := append([]attribute.KeyValue{
		attribute.String("event", event),
		attribute.String("distinct_id", distinctID),
		attribute.String("brand", common.BrandDisplayName()),
		attribute.Int64("timestamp", time.Now().UnixMilli()),
		attribute.Bool("_required", true),
	}, attrs...)

	record := log.Record{}
	record.SetBody(log.StringValue(event))
	record.SetSeverity(log.SeverityInfo)
	record.SetTimestamp(time.Now())

	for _, attr := range allAttrs {
		record.AddAttributes(toLogKeyValue(attr))
	}

	logger.Emit(ctx, record)
}

// Helper functions

func getDistinctID() string {
	// Try to get machine ID from environment or generate based on hostname + pid
	// This provides reasonable uniqueness for CLI sessions
	if envID := os.Getenv("CARETI_DISTINCT_ID"); envID != "" {
		return envID
	}

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}

	// Include PID for uniqueness across concurrent CLI instances
	return fmt.Sprintf("cli-%s-%d", hostname, os.Getpid())
}

func isHTTPS(endpoint string) bool {
	return len(endpoint) >= 8 && endpoint[:8] == "https://"
}

func trimProtocol(endpoint string) string {
	// Remove http:// or https:// prefix if present
	if len(endpoint) > 8 && endpoint[:8] == "https://" {
		return endpoint[8:]
	}
	if len(endpoint) > 7 && endpoint[:7] == "http://" {
		return endpoint[7:]
	}
	return endpoint
}

func toLogKeyValue(attr attribute.KeyValue) log.KeyValue {
	switch attr.Value.Type() {
	case attribute.STRING:
		return log.String(string(attr.Key), attr.Value.AsString())
	case attribute.BOOL:
		return log.Bool(string(attr.Key), attr.Value.AsBool())
	case attribute.INT64:
		return log.Int64(string(attr.Key), attr.Value.AsInt64())
	case attribute.FLOAT64:
		return log.Float64(string(attr.Key), attr.Value.AsFloat64())
	default:
		return log.String(string(attr.Key), attr.Value.Emit())
	}
}

// SetEnabled enables or disables telemetry
func SetEnabled(e bool) {
	mu.Lock()
	defer mu.Unlock()
	enabled = e
}

// IsEnabled returns whether telemetry is enabled
func IsEnabled() bool {
	mu.Lock()
	defer mu.Unlock()
	return enabled
}
