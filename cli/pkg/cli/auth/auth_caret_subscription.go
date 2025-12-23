package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/cline/cli/pkg/common"
	"github.com/cline/grpc-go/caret"
	"github.com/cline/grpc-go/cline"
)

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
	client, err := getAuthClient(parentCtx)
	if err != nil {
		return nil, fmt.Errorf("failed to get client: %w", err)
	}

	ctx, cancel := context.WithCancel(parentCtx)

	stream, err := client.Caretaccount.SubscribeToCaretAuthStatusUpdate(ctx, &cline.EmptyRequest{})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to subscribe to %s auth updates: %w", common.BrandDisplayName(), err)
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
	verboseLog("Starting %s auth status listener...", common.BrandDisplayName())
	go l.readStream()
	return nil
}

func (l *CaretAuthStatusListener) readStream() {
	defer close(l.updatesCh)
	defer close(l.errCh)

	for {
		select {
		case <-l.ctx.Done():
			verboseLog("%s auth listener context cancelled", common.BrandDisplayName())
			return
		default:
			state, err := l.stream.Recv()
			if err != nil {
				verboseLog("Error reading from %s auth status stream: %v", common.BrandDisplayName(), err)
				select {
				case l.errCh <- err:
				case <-l.ctx.Done():
				}
				return
			}

			verboseLog("Received %s auth state update: user=%v", common.BrandDisplayName(), state.GetUser() != nil)

			select {
			case l.updatesCh <- state:
			case <-l.ctx.Done():
				return
			}
		}
	}
}

// WaitForAuthentication blocks until authentication succeeds or timeout occurs
func (l *CaretAuthStatusListener) WaitForAuthentication(timeout time.Duration) error {
	verboseLog("Waiting for authentication (timeout: %v)...", timeout)

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
			if isCaretAuthenticated(state) {
				verboseLog("Authentication successful!")
				return nil
			}
			verboseLog("Received auth update but not authenticated yet...")
		}
	}
}

func (l *CaretAuthStatusListener) Stop() {
	verboseLog("Stopping %s auth status listener...", common.BrandDisplayName())
	l.cancel()
}

func isCaretAuthenticated(state *caret.CaretAuthState) bool {
	return state != nil && state.User != nil
}
