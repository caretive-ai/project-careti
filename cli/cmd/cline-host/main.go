package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/cline/cli/pkg/common"
	"github.com/cline/cli/pkg/hostbridge"
)

var (
	port    int
	verbose bool
)

func main() {
	brandName := common.BrandDisplayName()
	commandName := common.BrandCommandName()
	rootCmd := &cobra.Command{
		Use:   fmt.Sprintf("%s-host", strings.ToLower(commandName)),
		Short: fmt.Sprintf("%s Host Bridge Service", brandName),
		Long:  fmt.Sprintf("A simple host bridge service that provides host operations for %s.", common.BrandCoreName()),
		RunE:  runServer,
	}

	rootCmd.Flags().IntVarP(&port, "port", "p", 51052, "port to listen on")
	rootCmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "verbose logging")

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func runServer(cmd *cobra.Command, args []string) error {
	ctx := cmd.Context()
	brandName := common.BrandDisplayName()

	// Create gRPC hostbridge service
	service := hostbridge.NewGrpcServer(port, verbose)

	// Handle graceful shutdown
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		if verbose {
			log.Println("Shutting down hostbridge server...")
		}

		cancel()
	}()

	// Start server
	if verbose {
		log.Printf("Starting %s Host Bridge on port %d", brandName, port)
	}

	// Run the service
	if err := service.Start(ctx); err != nil {
		return fmt.Errorf("failed to run service: %w", err)
	}

	return nil
}
