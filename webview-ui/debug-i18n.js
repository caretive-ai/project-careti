// Debug script for i18n template processing
import { t, setGlobalUILanguage } from "./dist/caret/utils/i18n.js"

console.log("=== Debug i18n System ===")

// Test English
console.log("\n--- English Test ---")
setGlobalUILanguage("en")
const enResult = t("welcome.title", "common")
console.log("EN Result:", enResult)

// Test Korean
console.log("\n--- Korean Test ---")
setGlobalUILanguage("ko")
const koResult = t("welcome.title", "common")
console.log("KO Result:", koResult)

// Test direct brand access
console.log("\n--- Direct Brand Access ---")
const enBrand = t("brand.appName", "common")
const koBrand = t("brand.appName", "common")
console.log("EN Brand:", enBrand)
console.log("KO Brand:", koBrand)
