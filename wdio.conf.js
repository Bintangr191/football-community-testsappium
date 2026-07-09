require('dotenv').config()

const capabilities = require('./config/capabilities')

exports.config = {
  // ─── Runner ───────────────────────────────────────────────────────────────
  runner: 'local',

  // ─── Appium Server ────────────────────────────────────────────────────────
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723'),
  path: '/',

  // ─── Capabilities ─────────────────────────────────────────────────────────
  capabilities: [capabilities.android],

  // ─── Test Files ───────────────────────────────────────────────────────────
  specs: ['./tests/**/*.test.js'],
  exclude: [],

  // ─── Test Framework ───────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000, // 2 menit per test (Expo Go startup bisa lambat)
    retries: 1,      // retry 1x jika gagal
  },

  // ─── Reporters ────────────────────────────────────────────────────────────
  reporters: [
    'spec',
    [
      'spec',
      {
        showPreface: false,
        realtimeReporting: true,
      },
    ],
  ],

  // ─── Parallelism ──────────────────────────────────────────────────────────
  maxInstances: 1, // 1 device, jangan parallel

  // ─── Log Level ────────────────────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || 'info',

  // ─── Timeouts ─────────────────────────────────────────────────────────────
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // ─── Hooks ────────────────────────────────────────────────────────────────

  /**
   * onPrepare: dijalankan SEKALI sebelum semua test suite
   */
  onPrepare() {
    const fs = require('fs-extra')
    // Pastikan folder output tersedia
    fs.ensureDirSync('./screenshots')
    fs.ensureDirSync('./logs')
    fs.ensureDirSync('./recordings')
    console.log('\n🚀 Appium test session dimulai...')
    console.log(`📱 App Package : host.exp.exponent (Expo Go)`)
    console.log(`🌐 API Base URL: ${process.env.API_BASE_URL || 'http://10.0.2.2:3000'}`)
  },

  /**
   * before: dijalankan sebelum setiap test suite
   * - Attach DriverHelper ke browser global
   * - Set GPS palsu (Jakarta) supaya getCurrentPositionAsync() di app
   *   langsung dapat koordinat valid, tanpa nunggu GPS fix asli di emulator
   */
  before(capabilities, specs) {
    const DriverHelper = require('./helpers/driver.helper')
    global.driverHelper = new DriverHelper(browser)

    return browser.setGeoLocation({
      latitude: -6.2088,
      longitude: 106.8456,
      altitude: 10,
    }).catch(e => {
      console.warn(`⚠ Gagal set geolocation: ${e.message}`)
    })
  },

  /**
   * beforeTest: dijalankan sebelum setiap it() / test case
   */
  beforeTest(test, context) {
    const logger = require('./helpers/logger')
    logger.info(`▶ Memulai test: [${test.parent}] ${test.title}`)
  },

  /**
   * afterTest: dijalankan setelah setiap it() / test case
   * Jika test GAGAL → ambil screenshot + stop recording + simpan video
   */
  afterTest: async function (test, context, { error, result, duration, passed }) {
    const logger = require('./helpers/logger')
    const path = require('path')
    const fs = require('fs-extra')

    if (!passed) {
      // ── Screenshot ─────────────────────────────────────────────────────
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const testName = test.title.replace(/\s+/g, '_').toLowerCase()
      const screenshotName = `FAILED_${testName}_${timestamp}.png`
      const screenshotPath = path.join('screenshots', screenshotName)

      try {
        await browser.saveScreenshot(screenshotPath)
        logger.error(`📸 Screenshot disimpan: ${screenshotPath}`)
      } catch (screenshotError) {
        logger.error(`❌ Gagal mengambil screenshot: ${screenshotError.message}`)
      }

      // ── Stop Recording & Simpan Video ──────────────────────────────────
      try {
        const videoBase64 = await browser.stopRecordingScreen()
        if (videoBase64) {
          const videoName = `FAILED_${testName}_${timestamp}.mp4`
          const videoPath = path.join('recordings', videoName)
          fs.writeFileSync(videoPath, Buffer.from(videoBase64, 'base64'))
          logger.error(`🎥 Recording disimpan: ${videoPath}`)
        }
      } catch (recordError) {
        // Recording mungkin belum dimulai atau tidak tersedia
        logger.warn(`⚠ Recording tidak tersedia: ${recordError.message}`)
      }

      // ── Log Error ──────────────────────────────────────────────────────
      if (error) {
        logger.error(`💥 Error: ${error.message}`)
        logger.error(`   Stack: ${error.stack}`)
      }

      logger.error(`❌ GAGAL [${duration}ms]: [${test.parent}] ${test.title}`)
    } else {
      logger.info(`✅ LULUS [${duration}ms]: [${test.parent}] ${test.title}`)
    }
  },

  /**
   * beforeSuite: mulai screen recording sebelum setiap suite
   */
  beforeSuite: async function (suite) {
    try {
      await browser.startRecordingScreen({
        timeLimit: 600,           // maks 10 menit
        videoQuality: 'medium',   // low | medium | high
        videoType: 'mp4',
        forceRestart: true,
      })
    } catch (e) {
      // Tidak gagalkan test jika recording gagal dimulai
      console.warn(`⚠ Tidak dapat memulai recording: ${e.message}`)
    }
  },

  /**
   * afterSuite: simpan recording setelah suite (jika test passed, simpan ke recordings/passed/)
   */
  afterSuite: async function (suite) {
    const fs = require('fs-extra')
    const path = require('path')
    try {
      const videoBase64 = await browser.stopRecordingScreen()
      if (videoBase64 && suite.error) {
        const suiteName = suite.title.replace(/\s+/g, '_').toLowerCase()
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const videoPath = path.join('recordings', `suite_${suiteName}_${timestamp}.mp4`)
        fs.writeFileSync(videoPath, Buffer.from(videoBase64, 'base64'))
      }
    } catch (e) {
      // Abaikan error stop recording
    }
  },

  /**
   * onComplete: dijalankan setelah semua test selesai
   */
  onComplete(exitCode, config, capabilities, results) {
    console.log('\n──────────────────────────────────────────')
    console.log(`🏁 Semua test selesai. Exit code: ${exitCode}`)
    console.log(`📁 Screenshots: ./screenshots/`)
    console.log(`📁 Recordings : ./recordings/`)
    console.log(`📁 Logs       : ./logs/`)
    console.log('──────────────────────────────────────────\n')
  },
}