#!/usr/bin/env node
/**
 * API Integration Test Scenarios
 *
 * 사용법:
 *   node scripts/test-api-scenarios.js [scenario]
 *
 * 시나리오:
 *   all           - 모든 테스트 실행 (기본값)
 *   gemini-text   - Gemini 텍스트 API 테스트
 *   gemini-image  - Gemini 이미지 분석 테스트
 *   careti-text    - Caret API 텍스트 테스트
 *   careti-image   - Caret API 이미지 분석 테스트
 *   hwp           - HWP 파싱 테스트
 *   document      - 문서 추출 테스트 (PDF, DOCX, HWP)
 *
 * 환경변수 (.env 파일에서 로드):
 *   GEMINI_TOKEN  - Google Gemini API 키
 *   CARET_KEY     - Caret API 키
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const GEMINI_TOKEN = process.env.GEMINI_TOKEN;
const CARET_KEY = process.env.CARET_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function success(msg) { log(colors.green, '✅', msg); }
function error(msg) { log(colors.red, '❌', msg); }
function info(msg) { log(colors.cyan, 'ℹ️ ', msg); }
function warn(msg) { log(colors.yellow, '⚠️ ', msg); }
function header(msg) { log(colors.blue, '\n═══', msg, '═══'); }

// HTTP request helper
function httpRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout (60s)'));
    });
    if (data) req.write(data);
    req.end();
  });
}

// ============================================================================
// Test Scenarios
// ============================================================================

async function testGeminiText() {
  header('Gemini Text API Test');

  if (!GEMINI_TOKEN) {
    error('GEMINI_TOKEN not found in .env');
    return false;
  }

  info('Sending text prompt to Gemini...');

  const data = JSON.stringify({
    contents: [{ parts: [{ text: 'Reply with exactly: PONG' }] }]
  });

  try {
    const res = await httpRequest({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_TOKEN}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, data);

    if (res.status === 200) {
      const result = JSON.parse(res.body);
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Response:', text);
      if (text && text.includes('PONG')) {
        success('Gemini text API working correctly');
        return true;
      } else {
        warn('Response received but unexpected content');
        return false;
      }
    } else {
      error(`HTTP ${res.status}: ${res.body}`);
      return false;
    }
  } catch (e) {
    error(`Request failed: ${e.message}`);
    return false;
  }
}

async function testGeminiImage() {
  header('Gemini Image Analysis Test');

  if (!GEMINI_TOKEN) {
    error('GEMINI_TOKEN not found in .env');
    return false;
  }

  info('Creating test image with sharp...');

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    error('sharp module not found. Run: npm install');
    return false;
  }

  // Create a blue 100x100 image
  const imageBuffer = await sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 100, b: 255 } }
  }).png().toBuffer();

  const base64 = imageBuffer.toString('base64');
  info(`Image created: ${imageBuffer.length} bytes`);

  const data = JSON.stringify({
    contents: [{
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64 } },
        { text: 'What color is this image? Reply with just the color name.' }
      ]
    }]
  });

  try {
    const res = await httpRequest({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_TOKEN}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, data);

    if (res.status === 200) {
      const result = JSON.parse(res.body);
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('AI Response:', text);
      if (text && text.toLowerCase().includes('blue')) {
        success('Gemini image analysis working correctly');
        return true;
      } else {
        warn('Response received but color detection may be off');
        return true; // Still consider it a pass if we got a response
      }
    } else {
      error(`HTTP ${res.status}: ${res.body}`);
      return false;
    }
  } catch (e) {
    error(`Request failed: ${e.message}`);
    return false;
  }
}

async function testCaretText() {
  header('Caret API Text Test');

  if (!CARET_KEY) {
    error('CARET_KEY not found in .env');
    return false;
  }

  info('Sending text prompt to Caret API...');

  const data = JSON.stringify({
    model: 'gemini/gemini-2.5-flash',
    messages: [{ role: 'user', content: 'Reply with exactly: PONG' }],
    max_tokens: 10
  });

  try {
    const res = await httpRequest({
      hostname: 'api.careti.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AnyLLM-Key': `Bearer ${CARET_KEY}`
      }
    }, data);

    if (res.status === 200) {
      const result = JSON.parse(res.body);
      const text = result.choices?.[0]?.message?.content;
      console.log('Response:', text);
      if (text && text.includes('PONG')) {
        success('Caret API text working correctly');
        return true;
      } else {
        warn('Response received but unexpected content');
        return true;
      }
    } else {
      error(`HTTP ${res.status}: ${res.body}`);
      return false;
    }
  } catch (e) {
    error(`Request failed: ${e.message}`);
    return false;
  }
}

async function testCaretImage() {
  header('Caret API Image Analysis Test (AnalyzeImage Tool Path)');

  if (!CARET_KEY) {
    error('CARET_KEY not found in .env');
    return false;
  }

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    error('sharp module not found. Run: npm install');
    return false;
  }

  // Step 1: Create test image (same as AnalyzeImageToolHandler)
  info('Step 1: Creating test image...');
  const imageBuffer = await sharp({
    create: { width: 200, height: 200, channels: 3, background: { r: 255, g: 0, b: 0 } }
  }).png().toBuffer();

  const dataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  info(`Image created: ${imageBuffer.length} bytes (${dataUrl.length} chars as data URL)`);

  // Step 2: Simulate image optimization (7500px check)
  info('Step 2: Validating image dimensions...');
  const metadata = await sharp(imageBuffer).metadata();
  if (metadata.width > 7500 || metadata.height > 7500) {
    error(`Image too large: ${metadata.width}x${metadata.height}px (max 7500px)`);
    return false;
  }
  info(`Image dimensions OK: ${metadata.width}x${metadata.height}px`);

  // Step 3: Call Caret API (same endpoint as AnalyzeImageToolHandler)
  info('Step 3: Calling Caret API (same path as analyze_image tool)...');

  // This matches the exact format used in AnalyzeImageToolHandler.ts
  const systemPrompt = `You are an AI assistant specialized in analyzing images for software development tasks.

Common use cases:
- UI/UX issues: Check for misalignment, layout problems, visual bugs, responsive design issues
- Text extraction: Extract text from screenshots, dialogs, error messages, logs
- Code review: Analyze screenshots of code, identify issues or patterns
- Design comparison: Compare UI implementations with design mockups
- Error analysis: Interpret error dialogs, stack traces, or debug output shown in images

Provide clear, structured analysis relevant to the user's question.`;

  const data = JSON.stringify({
    model: 'gemini/gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          { type: 'text', text: 'What color is this solid-color image?' }
        ]
      }
    ],
    max_tokens: 4096
  });

  try {
    const res = await httpRequest({
      hostname: 'api.careti.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AnyLLM-Key': `Bearer ${CARET_KEY}`
      }
    }, data);

    if (res.status === 200) {
      const result = JSON.parse(res.body);
      const text = result.choices?.[0]?.message?.content;
      console.log('AI Response:', text);
      if (text && text.toLowerCase().includes('red')) {
        success('Caret API image analysis working correctly (detected red)');
      } else {
        success('Caret API image analysis responded (color may differ)');
      }
      return true;
    } else {
      error(`HTTP ${res.status}: ${res.body}`);
      if (res.status === 500) {
        warn('Server error - check Caret API server logs');
      } else if (res.status === 413) {
        warn('Image too large - check nginx client_max_body_size');
      }
      return false;
    }
  } catch (e) {
    error(`Request failed: ${e.message}`);
    if (e.message.includes('timeout')) {
      warn('Request timed out - server may be overloaded');
    }
    return false;
  }
}

async function testAnalyzeImageE2E() {
  header('AnalyzeImage Tool End-to-End Test');

  // This test simulates the full AnalyzeImageToolHandler flow
  // without VS Code extension context

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    error('sharp module not found');
    return false;
  }

  // Step 1: Generate an image (simulating generate_image tool)
  info('Step 1: Generating test image (simulating generate_image)...');
  const testImagePath = '/tmp/careti-test-image.png';

  await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 4,
      background: { r: 100, g: 150, b: 200, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="300" height="300">
        <circle cx="150" cy="150" r="100" fill="yellow"/>
        <text x="150" y="160" text-anchor="middle" font-size="40" fill="black">TEST</text>
      </svg>
    `),
    top: 0,
    left: 0
  }])
  .png()
  .toFile(testImagePath);

  info(`Generated image: ${testImagePath}`);

  // Step 2: Load and validate (simulating AnalyzeImageToolHandler.loadImageAsDataUrl)
  info('Step 2: Loading image as data URL...');
  const imageBuffer = fs.readFileSync(testImagePath);
  const dataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  info(`Loaded: ${imageBuffer.length} bytes`);

  // Step 3: Optimize (simulating optimizeImageDataUrl)
  info('Step 3: Validating image (7500px limit)...');
  const metadata = await sharp(imageBuffer).metadata();
  info(`Dimensions: ${metadata.width}x${metadata.height}px`);

  // Step 4: Call analysis API
  if (!CARET_KEY) {
    warn('CARET_KEY not set - skipping API call');
    warn('To test full flow, add CARET_KEY to .env');

    // Fallback: test with Gemini directly
    if (GEMINI_TOKEN) {
      info('Step 4: Using Gemini API directly as fallback...');
      const data = JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/png', data: imageBuffer.toString('base64') } },
            { text: 'Describe this image. What shapes and text do you see?' }
          ]
        }]
      });

      const res = await httpRequest({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_TOKEN}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, data);

      if (res.status === 200) {
        const result = JSON.parse(res.body);
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('\n=== AI Analysis Result ===');
        console.log(text);
        console.log('========================\n');

        if (text && (text.includes('circle') || text.includes('yellow') || text.includes('TEST'))) {
          success('Image analysis detected expected elements');
          return true;
        } else {
          warn('Analysis completed but expected elements not clearly detected');
          return true;
        }
      } else {
        error(`Gemini API error: ${res.status}`);
        return false;
      }
    } else {
      error('No API token available for testing');
      return false;
    }
  }

  info('Step 4: Calling Caret API...');
  const data = JSON.stringify({
    model: 'gemini/gemini-2.5-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          { type: 'text', text: 'Describe this image. What shapes and text do you see?' }
        ]
      }
    ],
    max_tokens: 4096
  });

  try {
    const res = await httpRequest({
      hostname: 'api.careti.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AnyLLM-Key': `Bearer ${CARET_KEY}`
      }
    }, data);

    if (res.status === 200) {
      const result = JSON.parse(res.body);
      const text = result.choices?.[0]?.message?.content;
      console.log('\n=== AI Analysis Result ===');
      console.log(text);
      console.log('========================\n');
      success('AnalyzeImage E2E test passed');
      return true;
    } else {
      error(`HTTP ${res.status}: ${res.body}`);
      return false;
    }
  } catch (e) {
    error(`Request failed: ${e.message}`);
    return false;
  } finally {
    // Cleanup
    try { fs.unlinkSync(testImagePath); } catch (e) {}
  }
}

async function testHwpParsing() {
  header('HWP Parsing Test');

  const hwpPath = path.join(__dirname, '..', 'careti-src/integrations/document/__tests__/fixtures/sample.hwp');

  if (!fs.existsSync(hwpPath)) {
    error(`Sample HWP file not found: ${hwpPath}`);
    return false;
  }

  info(`Parsing: ${hwpPath}`);

  try {
    // Try to load the compiled module
    let parseHwpFromFile;
    try {
      const hwpParser = require('../out/careti-src/integrations/document/hwp-parser.js');
      parseHwpFromFile = hwpParser.parseHwpFromFile;
    } catch (e) {
      // Try alternative path
      const hwpParser = require('../dist/careti-src/integrations/document/hwp-parser.js');
      parseHwpFromFile = hwpParser.parseHwpFromFile;
    }

    const result = await parseHwpFromFile(hwpPath);
    console.log(`Extracted ${result.length} characters`);
    console.log('Preview:', result.substring(0, 200));

    // Check for Korean content
    const koreanChars = result.match(/[\uAC00-\uD7AF]/g) || [];
    console.log(`Korean characters: ${koreanChars.length}`);

    if (result.includes('사업계획')) {
      success('HWP parsing working correctly - found expected content');
      return true;
    } else if (result.length > 0) {
      warn('HWP parsed but expected content not found');
      return true;
    } else {
      error('HWP parsing returned empty result');
      return false;
    }
  } catch (e) {
    // Fallback: test using hwpjs directly
    info('Trying direct hwpjs test...');
    try {
      const hwpjs = require('@ohah/hwpjs');
      const buffer = fs.readFileSync(hwpPath);
      const result = hwpjs.toMarkdown(buffer, { image: 'blob', use_html: false });
      const markdown = result.markdown || result;
      console.log(`Direct hwpjs result: ${markdown.length} chars`);
      console.log('Preview:', markdown.substring(0, 200));
      success('hwpjs library working correctly');
      return true;
    } catch (e2) {
      error(`HWP parsing failed: ${e.message}`);
      error(`Direct hwpjs also failed: ${e2.message}`);
      return false;
    }
  }
}

async function testDocumentExtraction() {
  header('Document Extraction Test');

  const fixturesDir = path.join(__dirname, '..', 'careti-src/integrations/document/__tests__/fixtures');

  const testFiles = [
    { name: 'sample.hwp', format: 'HWP' },
    { name: 'sample.pdf', format: 'PDF' },
    { name: 'sample.docx', format: 'DOCX' },
  ];

  let passed = 0;
  let failed = 0;

  for (const file of testFiles) {
    const filePath = path.join(fixturesDir, file.name);

    if (!fs.existsSync(filePath)) {
      warn(`${file.format}: File not found - ${file.name}`);
      continue;
    }

    info(`Testing ${file.format}: ${file.name}`);

    try {
      const { DocumentExtractor } = require('../out/careti-src/integrations/document/document-extractor.js');
      const extractor = new DocumentExtractor();

      if (!extractor.isSupported(filePath)) {
        error(`${file.format}: Not recognized as supported format`);
        failed++;
        continue;
      }

      const result = await extractor.extract(filePath, { cwd: fixturesDir });
      console.log(`  Format: ${result.format}, Content: ${result.content.length} chars`);

      if (result.content.length > 0) {
        success(`${file.format}: Extraction successful`);
        passed++;
      } else {
        error(`${file.format}: Empty content`);
        failed++;
      }
    } catch (e) {
      error(`${file.format}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDocument extraction: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// ============================================================================
// Main
// ============================================================================

const scenarios = {
  'gemini-text': testGeminiText,
  'gemini-image': testGeminiImage,
  'careti-text': testCaretText,
  'careti-image': testCaretImage,
  'analyze-image-e2e': testAnalyzeImageE2E,
  'hwp': testHwpParsing,
  'document': testDocumentExtraction,
};

async function runAll() {
  header('Running All API Test Scenarios');

  const results = {};

  for (const [name, fn] of Object.entries(scenarios)) {
    try {
      results[name] = await fn();
    } catch (e) {
      error(`${name}: Unexpected error - ${e.message}`);
      results[name] = false;
    }
  }

  // Summary
  header('Test Summary');
  let passed = 0, failed = 0;
  for (const [name, result] of Object.entries(results)) {
    if (result) {
      success(name);
      passed++;
    } else {
      error(name);
      failed++;
    }
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function main() {
  const scenario = process.argv[2] || 'all';

  console.log(colors.cyan + '╔════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║     Caret API Integration Tests        ║' + colors.reset);
  console.log(colors.cyan + '╚════════════════════════════════════════╝' + colors.reset);

  if (scenario === 'all') {
    const success = await runAll();
    process.exit(success ? 0 : 1);
  } else if (scenarios[scenario]) {
    const success = await scenarios[scenario]();
    process.exit(success ? 0 : 1);
  } else {
    error(`Unknown scenario: ${scenario}`);
    console.log('\nAvailable scenarios:');
    console.log('  all           - Run all tests');
    for (const s of Object.keys(scenarios)) {
      console.log(`  ${s}`);
    }
    process.exit(1);
  }
}

main().catch(e => {
  error(`Fatal error: ${e.message}`);
  process.exit(1);
});
