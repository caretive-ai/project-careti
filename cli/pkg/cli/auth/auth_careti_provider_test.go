package auth

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/cline/cli/pkg/cli/global"
	"github.com/cline/grpc-go/caret"
)

func TestWaitForAuthenticationReturnsOnStreamAuth(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	listener := &CaretAuthStatusListener{
		updatesCh: make(chan *careti.CaretAuthState, 1),
		errCh:     make(chan error, 1),
		ctx:       ctx,
		cancel:    cancel,
	}

	listener.updatesCh <- &careti.CaretAuthState{
		User: &careti.CaretUserInfo{Uid: "user-123"},
	}

	if err := listener.WaitForAuthentication(200 * time.Millisecond); err != nil {
		t.Fatalf("expected authentication to succeed via stream update, got error: %v", err)
	}
}

func TestWaitForAuthenticationReturnsStreamError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	expectedErr := errors.New("stream failure")
	listener := &CaretAuthStatusListener{
		updatesCh: make(chan *careti.CaretAuthState, 1),
		errCh:     make(chan error, 1),
		ctx:       ctx,
		cancel:    cancel,
	}

	listener.errCh <- expectedErr

	err := listener.WaitForAuthentication(200 * time.Millisecond)
	if err == nil {
		t.Fatalf("expected error, got nil")
	}
	if !errors.Is(err, expectedErr) {
		t.Fatalf("expected wrapped error %v, got %v", expectedErr, err)
	}
}

func TestWaitForAuthenticationTimesOut(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	listener := &CaretAuthStatusListener{
		updatesCh: make(chan *careti.CaretAuthState, 1),
		errCh:     make(chan error, 1),
		ctx:       ctx,
		cancel:    cancel,
	}

	err := listener.WaitForAuthentication(20 * time.Millisecond)
	if err == nil {
		t.Fatalf("expected timeout error, got nil")
	}
	if !strings.Contains(strings.ToLower(err.Error()), "timeout") {
		t.Fatalf("expected timeout-driven error, got: %v", err)
	}
}

func TestWaitForAuthenticationReturnsOnCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	listener := &CaretAuthStatusListener{
		updatesCh: make(chan *careti.CaretAuthState, 1),
		errCh:     make(chan error, 1),
		ctx:       ctx,
		cancel:    func() {},
	}

	err := listener.WaitForAuthentication(200 * time.Millisecond)
	if err == nil {
		t.Fatalf("expected cancellation error, got nil")
	}
	if !strings.Contains(strings.ToLower(err.Error()), "cancel") {
		t.Fatalf("expected cancellation-driven error, got: %v", err)
	}
}

func TestClearCaretLocalSessionRemovesKeys(t *testing.T) {
	tmp := t.TempDir()
	oldCfg := global.Config
	global.Config = &global.GlobalConfig{ConfigPath: tmp}
	defer func() { global.Config = oldCfg }()

	dataDir := filepath.Join(tmp, "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		t.Fatalf("failed to create data dir: %v", err)
	}

	secretsPath := filepath.Join(dataDir, "secrets.json")
	globalStatePath := filepath.Join(dataDir, "globalState.json")
	if err := os.WriteFile(secretsPath, []byte(`{"caret:caretAccountId":"abc","foo":1}`), 0644); err != nil {
		t.Fatalf("failed to write secrets: %v", err)
	}
	if err := os.WriteFile(globalStatePath, []byte(`{"userInfo":{"id":"123"},"bar":2}`), 0644); err != nil {
		t.Fatalf("failed to write globalState: %v", err)
	}

	clearCaretLocalSession()

	content, _ := os.ReadFile(secretsPath)
	if strings.Contains(string(content), "caret:caretAccountId") {
		t.Fatalf("expected caret:caretAccountId to be removed from secrets.json, got: %s", string(content))
	}

	content, _ = os.ReadFile(globalStatePath)
	if strings.Contains(string(content), "userInfo") {
		t.Fatalf("expected userInfo to be removed from globalState.json, got: %s", string(content))
	}
}

