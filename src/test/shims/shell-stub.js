// CARETI MODIFICATION: test stub for shell utilities to avoid ESM loader issues
module.exports = {
	getShellPath: async () => "/bin/sh",
	getUserShell: () => "/bin/sh",
	getDefaultShell: () => "/bin/sh",
	getEnvVariables: () => ({}),
	getWindowsHomeDrive: () => "C:",
	getWindowsHomePath: () => "C:\\Users\\test",
	getUserHomeDir: () => "/tmp",
	getWorkspaceHomeDir: () => "/tmp",
	formatWindowsPath: (p) => p,
	formatWSLPath: (p) => p,
	isWindows: false,
	isMac: false,
	isLinux: true,
	ensureShellPath: () => "/bin/sh",
}
