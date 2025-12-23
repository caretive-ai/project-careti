package cli

import (
	"fmt"
	"runtime"

	"github.com/cline/cli/pkg/cli/global"
	"github.com/cline/cli/pkg/common"
	"github.com/spf13/cobra"
)

// NewVersionCommand creates the version command
func NewVersionCommand() *cobra.Command {
	var short bool

	cmd := &cobra.Command{
		Use:     "version",
		Aliases: []string{"v"},
		Short:   "Show version information",
		Long:    fmt.Sprintf("Display version information for the %s CLI.", common.BrandDisplayName()),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Versions are injected at build time via ldflags
			if short {
				fmt.Println(global.CliVersion)
				return nil
			}

			brand := common.BrandDisplayName()
			fmt.Printf("%s CLI\n", brand)
			fmt.Printf("%s CLI Version:  %s\n", brand, global.CliVersion)
			fmt.Printf("%s Core Version: %s\n", brand, global.Version)
			fmt.Printf("Commit:             %s\n", global.Commit)
			fmt.Printf("Built:              %s\n", global.Date)
			fmt.Printf("Built by:           %s\n", global.BuiltBy)
			fmt.Printf("Go version:         %s\n", runtime.Version())
			fmt.Printf("OS/Arch:            %s/%s\n", runtime.GOOS, runtime.GOARCH)

			return nil
		},
	}

	cmd.Flags().BoolVar(&short, "short", false, "show only version number")

	return cmd
}
