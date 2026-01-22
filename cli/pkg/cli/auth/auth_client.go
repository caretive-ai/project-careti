package auth

import (
	"context"

	clineclient "github.com/cline/grpc-go/client"

	"github.com/cline/cli/pkg/cli/global"
)

// CARETI MODIFICATION: prefer the auth instance client when the address is injected via context
func getAuthClient(ctx context.Context) (*clineclient.ClineClient, error) {
	if addr := getAuthInstanceAddress(ctx); addr != "" {
		return global.GetClientForAddress(ctx, addr)
	}

	return global.GetDefaultClient(ctx)
}
