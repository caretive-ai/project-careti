package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/charmbracelet/huh"
	"github.com/cline/cli/pkg/common"
	"github.com/cline/grpc-go/cline"
)

var isCaretSessionAuthenticated bool

// Caret provider specific code

func HandleCaretAuth(ctx context.Context) error {
	verboseLog("Authenticating with Caret...")

	if IsCaretAuthenticated(ctx) {
		return caretSignOutDialog(ctx)
	}

	if err := caretSignIn(ctx); err != nil {
		return err
	}

	fmt.Println()
	verboseLog("✓ You are signed in to Caret!")

	if err := configureDefaultCaretModel(ctx); err != nil {
		fmt.Printf("Warning: Could not configure default Caret model: %v\n", err)
		fmt.Printf("You can configure a model later with '%s auth' and selecting 'Select active provider'\n", common.BrandCommandName())
	}

	return HandleAuthMenuNoArgs(ctx)
}

func caretSignOut(ctx context.Context) error {
	client, err := getAuthClient(ctx)
	if err != nil {
		return err
	}

	if _, err = client.Caretaccount.CaretAccountLogoutClicked(ctx, &cline.EmptyRequest{}); err != nil {
		return err
	}

	clearCaretLocalSession()
	isCaretSessionAuthenticated = false
	fmt.Println("You have been signed out of Caret (caret.team).")
	return nil
}

func caretSignOutDialog(ctx context.Context) error {
	var confirm bool
	form := huh.NewForm(
		huh.NewGroup(
			huh.NewConfirm().
				Title("You are already signed in to Caret.").
				Description("Would you like to sign out?").
				Value(&confirm),
		),
	)

	if err := form.Run(); err != nil {
		return nil
	}

	if confirm {
		if err := caretSignOut(ctx); err != nil {
			fmt.Printf("Failed to sign out: %v\n", err)
			return err
		}
	}
	return HandleAuthMenuNoArgs(ctx)
}

func caretSignIn(ctx context.Context) error {
	if IsCaretAuthenticated(ctx) {
		return nil
	}

	verboseLog("Subscribing to Caret auth status updates...")
	listener, err := NewCaretAuthStatusListener(ctx)
	if err != nil {
		verboseLog("Failed to subscribe to Caret auth updates: %v", err)
		return fmt.Errorf("failed to subscribe to Caret auth updates: %w", err)
	}
	defer listener.Stop()

	if err := listener.Start(); err != nil {
		verboseLog("Failed to start Caret auth listener: %v", err)
		return fmt.Errorf("failed to start Caret auth listener: %w", err)
	}

	verboseLog("Initiating Caret login...")
	client, err := getAuthClient(ctx)
	if err != nil {
		verboseLog("Failed to obtain client: %v", err)
		return fmt.Errorf("failed to obtain client: %w", err)
	}

	response, err := client.Caretaccount.CaretAccountLoginClicked(ctx, &cline.EmptyRequest{})
	if err != nil {
		verboseLog("Failed to initiate Caret login: %v", err)
		return fmt.Errorf("failed to initiate Caret login: %w", err)
	}

	fmt.Println("\n  Opening browser for Caret authentication (caret.team)...")
	if response != nil && response.Value != "" {
		fmt.Printf("  If the browser doesn't open automatically, visit this URL:\n  %s\n\n", response.Value)
	} else {
		fmt.Println("  If the browser doesn't open automatically, copy/paste this URL:")
		fmt.Println("  https://caret.team")
		fmt.Println()
	}
	fmt.Println("  Waiting for you to complete authentication in your browser...")
	fmt.Println("   (This may take a few moments. Timeout: 5 minutes)")

	verboseLog("Waiting for Caret authentication to complete...")
	if err := listener.WaitForAuthentication(5 * time.Minute); err != nil {
		verboseLog("Caret authentication failed or timed out: %v", err)
		fmt.Println("\n  Authentication failed or timed out.")
		fmt.Printf("  Please try again with '%s auth'\n", common.BrandCommandName())
		return err
	}

	isCaretSessionAuthenticated = true
	verboseLog("Caret login successful")
	return nil
}

func IsCaretAuthenticated(ctx context.Context) bool {
	if isCaretSessionAuthenticated {
		verboseLog("Session is already authenticated")
		return true
	}

	verboseLog("Verifying authentication with server...")
	client, err := getAuthClient(ctx)
	if err != nil {
		verboseLog("Failed to get client for auth check: %v", err)
		return false
	}

	_, err = client.Caretaccount.GetCaretUserCredits(ctx, &cline.EmptyRequest{})
	if err == nil {
		// Update session variable for future fast-path checks
		verboseLog("Server verification successful, updating session flag")
		isCaretSessionAuthenticated = true
		return true
	}

	verboseLog("Server verification failed===>: %v", err)
	return false
}

// HandleChangeClineModel allows Cline-authenticated users to change their Cline model selection. Hidden when not authenticated.
func HandleChangeCaretModel(ctx context.Context) error {
	// Ensure user is authenticated
	if !IsCaretAuthenticated(ctx) {
		return fmt.Errorf("you must be authenticated with Caret to change models. Run '%s auth' to sign in", common.BrandCommandName())
	}

	// Get task manager
	manager, err := createTaskManager(ctx)
	if err != nil {
		return fmt.Errorf("failed to create task manager: %w", err)
	}

	// Launch Cline model selection
	return SelectCaretModel(ctx, manager)
}

// configureDefaultCaretModel configures the default Caret model after authentication
func configureDefaultCaretModel(ctx context.Context) error {
	verboseLog("Configuring default Caret model...")

	manager, err := createTaskManager(ctx)
	if err != nil {
		return fmt.Errorf("failed to create task manager: %w", err)
	}

	if caretHasExistingModel(ctx, manager) {
		verboseLog("%s model already configured; skipping default model assignment", common.BrandDisplayName())
		return nil
	}

	// Set default Caret model
	return SetDefaultCaretModel(ctx, manager)
}

// HandleSelectCaretOrganization is disabled because Caret org RPCs are commented out in proto (upstream state).
func HandleSelectCaretOrganization(ctx context.Context) error {
	fmt.Println("Caret organization selection is currently unavailable in this build.")
	fmt.Println("Visit https://app.caret.team/dashboard to manage organizations.")
	return HandleAuthMenuNoArgs(ctx)
}
