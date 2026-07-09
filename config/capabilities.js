require('dotenv').config()

const androidCapabilities = {
  platformName: 'Android',

  'appium:automationName': 'UIAutomator2',
  'appium:deviceName': process.env.DEVICE_NAME || 'emulator-5554',
  'appium:udid': process.env.DEVICE_UDID || 'emulator-5554',
  'appium:platformVersion': process.env.ANDROID_VERSION || '14',

  // ─── App: Expo Go ────────────────────────────────────────────────────────
  'appium:appPackage': 'host.exp.exponent',
  'appium:appActivity': 'host.exp.exponent.experience.HomeActivity',

  // Jangan reinstall app setiap kali test 
  'appium:noReset': true,
  'appium:fullReset': false,

  // ─── Timeouts ────────────────────────────────────────────────────────────
  'appium:newCommandTimeout': 120,   
  'appium:androidInstallTimeout': 90000,
  'appium:adbExecTimeout': 30000,

  // ─── Performance ─────────────────────────────────────────────────────────
  'appium:skipUnlock': true,

  // Auto grant permissions (kamera, lokasi, dll.)
  'appium:autoGrantPermissions': true,

  // ─── UIAutomator2 Specific ───────────────────────────────────────────────
  'appium:uiautomator2ServerLaunchTimeout': 60000,
  'appium:uiautomator2ServerInstallTimeout': 60000,

  // Disable animation untuk test yang lebih cepat dan stabil
  'appium:disableWindowAnimation': true,

  // ─── Unicode Input ────────────────────────────────────────────────────────
  'appium:unicodeKeyboard': true,
  'appium:resetKeyboard': true,

  // ─── Logging ─────────────────────────────────────────────────────────────
  'appium:enablePerformanceLogging': false,
}

module.exports = {
  android: androidCapabilities,
  // physicalDevice: physicalDeviceCapabilities,
}
