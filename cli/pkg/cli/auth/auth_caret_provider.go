package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/charmbracelet/huh"
	"github.com/cline/cli/pkg/cli/global"
	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/grpc-go/caret"
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
		fmt.Println("You can configure a model later with 'cline auth' and selecting 'Select active provider'")
	}

	return HandleAuthMenuNoArgs(ctx)
}

func caretSignOut(ctx context.Context) error {
	client, err := global.GetDefaultClient(ctx)
	if err != nil {
		return err
	}

	if _, err = client.Caretaccount.CaretAccountLogoutClicked(ctx, &cline.EmptyRequest{}); err != nil {
		return err
	}

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
	client, err := global.GetDefaultClient(ctx)
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
	}
	fmt.Println("  Waiting for you to complete authentication in your browser...")
	fmt.Println("   (This may take a few moments. Timeout: 5 minutes)")

	verboseLog("Waiting for Caret authentication to complete...")
	if err := listener.WaitForAuthentication(5 * time.Minute); err != nil {
		verboseLog("Caret authentication failed or timed out: %v", err)
		fmt.Println("\n  Authentication failed or timed out.")
		fmt.Println("  Please try again with 'cline auth'")
		return err
	}

	isCaretSessionAuthenticated = true
	verboseLog("Caret login successful")
	return nil
}

func IsCaretAuthenticated(ctx context.Context) bool {
	if isCaretSessionAuthenticated {
		verboseLog("Caret session is already authenticated")
		return true
	}

	verboseLog("Verifying Caret authentication with server...")
	client, err := global.GetDefaultClient(ctx)
	if err != nil {
		verboseLog("Failed to get client for Caret auth check: %v", err)
		return false
	}

	_, err = client.Caretaccount.GetCaretUserCredits(ctx, &cline.EmptyRequest{})
	if err == nil {
		verboseLog("Caret server verification successful, updating session flag")
		isCaretSessionAuthenticated = true
		return true
	}

	verboseLog("Caret server verification failed: %v", err)
	return false
}

// HandleSelectCaretOrganization allows Caret-authenticated users to select which organization to use
func HandleSelectCaretOrganization(ctx context.Context) error {
	if !IsCaretAuthenticated(ctx) {
		return fmt.Errorf("you must be authenticated with Caret to select an organization. Run 'cline auth' to sign in")
	}

	client, err := global.GetDefaultClient(ctx)
	if err != nil {
		return fmt.Errorf("failed to get client: %w", err)
	}

	orgsResponse, err := client.Caretaccount.GetCaretUserOrganizations(ctx, &cline.EmptyRequest{})
	if err != nil {
		return fmt.Errorf("failed to fetch Caret organizations: %w", err)
	}

	organizations := orgsResponse.GetOrganizations()
	if len(organizations) == 0 {
		fmt.Println("You don't have any Caret organizations yet.")
		fmt.Println("Visit https://app.caret.team/dashboard to create an organization.")
		return HandleAuthMenuNoArgs(ctx)
	}

	var options []huh.Option[string]
	options = append(options, huh.NewOption("Personal", "personal"))

	for _, org := range organizations {
		displayName := org.GetName()
		if org.GetActive() {
			displayName = fmt.Sprintf("%s (active)", displayName)
		}
		options = append(options, huh.NewOption(displayName, org.GetOrganizationId()))
	}

	options = append(options, huh.NewOption("(Cancel)", "cancel"))

	var selected string
	form := huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Select which Caret account to use").
				Options(options...).
				Value(&selected),
		),
	)

	if err := form.Run(); err != nil {
		return fmt.Errorf("failed to select Caret organization: %w", err)
	}

	if selected == "cancel" {
		return HandleAuthMenuNoArgs(ctx)
	}

	var orgId *string
	if selected != "personal" {
		orgId = &selected
	}

	req := &caret.CaretUserOrganizationUpdateRequest{
		OrganizationId: orgId,
	}

	if _, err := client.Caretaccount.SetCaretUserOrganization(ctx, req); err != nil {
		return fmt.Errorf("failed to set Caret organization: %w", err)
	}

	if selected == "personal" {
		fmt.Println("✓ Switched to Caret personal account")
	} else {
		var orgName string
		for _, org := range organizations {
			if org.GetOrganizationId() == selected {
				orgName = org.GetName()
				break
			}
		}
		fmt.Printf("✓ Switched to Caret organization: %s\n", orgName)
	}

	return HandleAuthMenuNoArgs(ctx)
}

// CaretAuthStatusListener manages subscription to Caret auth status updates
type CaretAuthStatusListener struct {
	stream    caret.CaretAccountService_SubscribeToCaretAuthStatusUpdateClient
	updatesCh chan *caret.CaretAuthState
	errCh     chan error
	ctx       context.Context
	cancel    context.CancelFunc
}

// NewCaretAuthStatusListener creates a new auth status listener for Caret
func NewCaretAuthStatusListener(parentCtx context.Context) (*CaretAuthStatusListener, error) {
	client, err := global.GetDefaultClient(parentCtx)
	if err != nil {
		return nil, fmt.Errorf("failed to get client: %w", err)
	}

	ctx, cancel := context.WithCancel(parentCtx)

	stream, err := client.Caretaccount.SubscribeToCaretAuthStatusUpdate(ctx, &cline.EmptyRequest{})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to subscribe to Caret auth updates: %w", err)
	}

	return &CaretAuthStatusListener{
		stream:    stream,
		updatesCh: make(chan *caret.CaretAuthState, 10),
		errCh:     make(chan error, 1),
		ctx:       ctx,
		cancel:    cancel,
	}, nil
}

func (l *CaretAuthStatusListener) Start() error {
	verboseLog("Starting Caret auth status listener...")
	go l.readStream()
	return nil
}

func (l *CaretAuthStatusListener) readStream() {
	defer close(l.updatesCh)
	defer close(l.errCh)

	for {
		select {
		case <-l.ctx.Done():
			verboseLog("Caret auth listener context cancelled")
			return
		default:
			state, err := l.stream.Recv()
			if err != nil {
				verboseLog("Error reading from Caret auth status stream: %v", err)
				select {
				case l.errCh <- err:
				case <-l.ctx.Done():
				}
				return
			}

			verboseLog("Received Caret auth state update: user=%v", state.GetUser() != nil)

			select {
			case l.updatesCh <- state:
			case <-l.ctx.Done():
				return
			}
		}
	}
}

func (l *CaretAuthStatusListener) WaitForAuthentication(timeout time.Duration) error {
	verboseLog("Waiting for Caret authentication (timeout: %v)...", timeout)

	timer := time.NewTimer(timeout)
	defer timer.Stop()

	for {
		select {
		case <-timer.C:
			return fmt.Errorf("authentication timeout after %v - please try again", timeout)
		case <-l.ctx.Done():
			return fmt.Errorf("authentication cancelled")
		case err := <-l.errCh:
			return fmt.Errorf("authentication stream error: %w", err)
		case state := <-l.updatesCh:
			if isCaretAuthenticatedState(state) {
				verboseLog("Caret authentication successful!")
				return nil
			}
			verboseLog("Received Caret auth update but not authenticated yet...")
		}
	}
}

func (l *CaretAuthStatusListener) Stop() {
	verboseLog("Stopping Caret auth status listener...")
	l.cancel()
}

func isCaretAuthenticatedState(state *caret.CaretAuthState) bool {
	return state != nil && state.User != nil
}

// DefaultCaretModelID is the default model ID for the Caret provider
const DefaultCaretModelID = "gemini/gemini-2.5-flash"
const DefaultCaretBaseURL = "https://api.caret.team"

// FetchCaretModels retrieves available Caret models from static definitions
func FetchCaretModels() ([]string, error) {
	modelIDs, _, err := FetchStaticModels(cline.ApiProvider_CARET)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Caret models: %w", err)
	}
	return modelIDs, nil
}

// SetDefaultCaretModel configures the default Caret model after authentication
func SetDefaultCaretModel(ctx context.Context, manager *task.Manager) error {
	modelIDs, err := FetchCaretModels()
	if err != nil {
		fmt.Printf("Warning: Could not fetch Caret models: %v\n", err)
		fmt.Printf("Using default model: %s\n", DefaultCaretModelID)
		return applyCaretModelConfiguration(ctx, manager, DefaultCaretModelID)
	}

	// Use default if present, otherwise fallback to first model
	for _, id := range modelIDs {
		if id == DefaultCaretModelID {
			return applyCaretModelConfiguration(ctx, manager, id)
		}
	}

	if len(modelIDs) > 0 {
		fmt.Printf("Using available Caret model: %s\n", modelIDs[0])
		return applyCaretModelConfiguration(ctx, manager, modelIDs[0])
	}

	return fmt.Errorf("no usable Caret models found")
}

// SelectCaretModel presents a menu to select a Caret model and applies the configuration.
func SelectCaretModel(ctx context.Context, manager *task.Manager) error {
	modelIDs, err := FetchCaretModels()
	if err != nil {
		return fmt.Errorf("failed to fetch Caret models: %w", err)
	}

	selectedModelID, err := DisplayModelSelectionMenu(modelIDs, "Caret")
	if err != nil {
		return fmt.Errorf("model selection failed: %w", err)
	}

	if err := applyCaretModelConfiguration(ctx, manager, selectedModelID); err != nil {
		return err
	}

	fmt.Println()
	return HandleAuthMenuNoArgs(ctx)
}

// configureDefaultCaretModel configures the default Caret model after authentication
func configureDefaultCaretModel(ctx context.Context) error {
	manager, err := task.NewManagerForDefault(ctx)
	if err != nil {
		return fmt.Errorf("failed to create task manager: %w", err)
	}

	if err := SetDefaultCaretModel(ctx, manager); err != nil {
		return err
	}

	if err := setWelcomeViewCompletedWithManager(ctx, manager); err != nil {
		verboseLog("Warning: Failed to mark welcome view as completed: %v", err)
	}

	return nil
}

func applyCaretModelConfiguration(ctx context.Context, manager *task.Manager, modelID string) error {
	provider := cline.ApiProvider_CARET
	baseURL := DefaultCaretBaseURL

	updates := ProviderUpdatesPartial{
		ModelID: &modelID,
		BaseURL: &baseURL,
	}

	return UpdateProviderPartial(ctx, manager, provider, updates, true)
}
