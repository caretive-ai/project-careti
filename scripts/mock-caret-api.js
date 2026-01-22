#!/usr/bin/env node
// Minimal mock Careti API server for CLI auth flow verification
// Endpoints:
//   GET  /v1/auth/authorize   -> 302 redirect to callback with code/provider
//   POST /v1/auth/token       -> returns access/refresh tokens and userInfo
//   GET  /v1/profile/balance  -> returns mock balance data

const http = require("http")
const { URL } = require("url")

const PORT = process.env.MOCK_CARET_PORT ? Number(process.env.MOCK_CARET_PORT) : 8000

function sendJSON(res, status, data) {
	res.writeHead(status, { "Content-Type": "application/json" })
	res.end(JSON.stringify(data))
}

function handleAuthorize(req, res) {
	const url = new URL(req.url, `http://localhost:${PORT}`)
	const callbackUrl =
		url.searchParams.get("callback_url") || url.searchParams.get("redirect_uri") || "http://127.0.0.1:48801/auth"
	const state = url.searchParams.get("state") || ""
	const code = "mock-code"

	const location = `${callbackUrl}?provider=caret&code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`
	res.writeHead(302, { Location: location })
	res.end("Redirecting to callback")
}

async function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = ""
		req.on("data", (chunk) => {
			body += chunk
		})
		req.on("end", () => {
			try {
				resolve(body ? JSON.parse(body) : {})
			} catch (err) {
				reject(err)
			}
		})
		req.on("error", reject)
	})
}

async function handleToken(req, res) {
	let body = {}
	try {
		body = await parseBody(req)
	} catch (err) {
		return sendJSON(res, 400, { success: false, error: "Invalid JSON body" })
	}

	const now = new Date()
	const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString() // +1h

	sendJSON(res, 200, {
		success: true,
		data: {
			accessToken: "mock-access",
			refreshToken: "mock-refresh",
			expiresAt,
			userInfo: {
				id: "user-123",
				email: body.email || "mock@careti.ai",
				name: body.name || "Mock User",
			},
		},
	})
}

function handleBalance(_req, res) {
	sendJSON(res, 200, {
		success: true,
		data: {
			balance: 10000,
			currency: "USD",
			last_updated: new Date().toISOString(),
		},
	})
}

function requestHandler(req, res) {
	const { method, url } = req
	if (!url) {
		res.writeHead(404)
		return res.end()
	}

	if (method === "GET" && url.startsWith("/v1/auth/authorize")) {
		return handleAuthorize(req, res)
	}
	if (method === "POST" && url.startsWith("/v1/auth/token")) {
		return handleToken(req, res)
	}
	if (method === "GET" && url.startsWith("/v1/profile/balance")) {
		return handleBalance(req, res)
	}

	res.writeHead(404)
	res.end("Not found")
}

const server = http.createServer(requestHandler)
server.listen(PORT, () => {
	console.log(`[mock-careti-api] listening on http://localhost:${PORT}`)
})

process.on("SIGINT", () => {
	console.log("[mock-careti-api] shutting down")
	server.close(() => process.exit(0))
})
