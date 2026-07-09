const path = require('path')
const fs = require('fs')
const logger = require('./logger')

// ── Ganti dengan base64 foto kamu (TANPA prefix "data:image/...;base64,") ──
const DUMMY_JPEG_B64 = 'your_base64_encoded_image_here' // <-- Ganti dengan base64 foto kamu
const DEVICE_PHOTO_PATH = '/sdcard/Pictures/appium_test_photo.jpg'
const LOCAL_FIXTURE_PATH = path.join(__dirname, '..', 'fixtures', 'test_photo.jpg')

const PhotoHelper = {
  ensureDummyPhotoLocal() {
    if (!fs.existsSync(LOCAL_FIXTURE_PATH)) {
      const buffer = Buffer.from(DUMMY_JPEG_B64, 'base64')
      const dir = path.dirname(LOCAL_FIXTURE_PATH)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(LOCAL_FIXTURE_PATH, buffer)
      logger.info(`📁 Dummy photo lokal dibuat: ${LOCAL_FIXTURE_PATH}`)
    }
  },

  async pushPhotoToDevice() {
    try {
      this.ensureDummyPhotoLocal()
      await driver.pushFile(DEVICE_PHOTO_PATH, DUMMY_JPEG_B64)
      logger.info(`✅ Dummy photo di-push ke device: ${DEVICE_PHOTO_PATH}`)

      try {
        await driver.execute('mobile: shell', {
          command: 'am',
          args: [
            'broadcast',
            '-a', 'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
            '-d', `file://${DEVICE_PHOTO_PATH}`
          ]
        })
        logger.info('✅ Media scan broadcast dikirim')
      } catch (scanErr) {
        logger.warn(`⚠ Media scan gagal (mungkin perlu waktu): ${scanErr.message}`)
      }

      await browser.pause(2000)
    } catch (err) {
      logger.warn(`⚠ Gagal push photo ke device: ${err.message}`)
    }
  },

  async setMockLocation(lat = -6.2088, lng = 106.8456) {
    try {
      await driver.setGeoLocation({ latitude: lat, longitude: lng, altitude: 10 })
      logger.info(`✅ Mock GPS diset via Appium: lat=${lat}, lng=${lng}`)
    } catch (err) {
      logger.warn(`⚠ setGeoLocation gagal (HP fisik mungkin pakai GPS real): ${err.message}`)
    }
  },

  async handlePhotoAccessDialog() {
    try {
      const allowAllBtn = await $('id=com.google.android.permissioncontroller:id/permission_allow_all_button')
      if (await allowAllBtn.isDisplayed({ timeout: 2000 }).catch(() => false)) {
        await allowAllBtn.click()
        logger.info('✅ Dialog izin akses foto: Allow All ditekan')
        await browser.pause(1000)
        return
      }
    } catch (_) { }

    try {
      const allowBtn = await $('//*[@text="Allow" or @text="ALLOW" or @text="Izinkan"]')
      if (await allowBtn.isDisplayed({ timeout: 2000 }).catch(() => false)) {
        await allowBtn.click()
        logger.info('✅ Dialog izin: Allow ditekan (fallback)')
        await browser.pause(1000)
      }
    } catch (_) { }
  },

  /**
   * @returns {Promise<boolean>} true jika ada dialog & berhasil ditekan
   */
  async handleConfirmSelectionDialog() {
    const confirmTexts = [
      'OK', 'Ok', 'SELECT', 'Select',
      'USE THIS PHOTO', 'Use', 'USE',
      'DONE', 'Done',
      'Pilih', 'SELESAI', 'Selesai',
      'ADD', 'Add', 'CHOOSE', 'Choose'
    ]

    for (const text of confirmTexts) {
      try {
        const btn = await $(`//*[@text="${text}"]`)
        if (await btn.isDisplayed({ timeout: 800 }).catch(() => false)) {
          await btn.click()
          logger.info(`✅ Dialog konfirmasi "${text}" ditekan`)
          await browser.pause(1500)
          return true
        }
      } catch (_) { }
    }

    try {
      const btn = await $('id=android:id/button1')
      if (await btn.isDisplayed({ timeout: 800 }).catch(() => false)) {
        await btn.click()
        logger.info('✅ Dialog konfirmasi (android:id/button1) ditekan')
        await browser.pause(1500)
        return true
      }
    } catch (_) { }

    try {
      const btn = await $('id=com.android.documentsui:id/action_menu_select')
      if (await btn.isDisplayed({ timeout: 800 }).catch(() => false)) {
        await btn.click()
        logger.info('✅ DocumentsUI Select action ditekan')
        await browser.pause(1500)
        return true
      }
    } catch (_) { }

    logger.info('ℹ️ Tidak ada dialog konfirmasi tambahan, lanjut')
    return false
  },

  /**
   * @returns {Promise<boolean>} true jika berhasil memilih foto
   */
  async selectFirstPhotoFromGallery() {
    logger.info('🖼️ Menunggu app galeri/file picker terbuka...')
    await browser.pause(2000)
    await this.handlePhotoAccessDialog()
    await browser.pause(1000)

    const strategies = [
      async () => {
        const el = await $('//android.view.View[contains(@content-desc, "Foto diambil pada")][1]/..')
        if (await el.isDisplayed({ timeout: 3000 }).catch(() => false)) {
          await el.click()
          return true
        }
        return false
      },
      // ── Variasi bahasa Inggris, jaga-jaga kalau locale device berubah ──
      async () => {
        const el = await $('//android.view.View[contains(@content-desc, "Photo taken on")][1]/..')
        if (await el.isDisplayed({ timeout: 2000 }).catch(() => false)) {
          await el.click()
          return true
        }
        return false
      },
      // ── DocumentsUI (kalau opsi A berhasil disable & fallback ke legacy) ──
      async () => {
        const el = await $('android=new UiSelector().resourceId("com.android.documentsui:id/dir_list").childSelector(new UiSelector().index(0))')
        if (await el.isDisplayed()) { await el.click(); return true }
        return false
      },
      async () => {
        const el = await $('android=new UiSelector().className("android.widget.GridView").childSelector(new UiSelector().index(0))')
        if (await el.isDisplayed()) { await el.click(); return true }
        return false
      },
      // ── Google Photos (app biasa, bukan picker) ──
      async () => {
        const el = await $('//android.widget.FrameLayout[contains(@content-desc,"Photo")]')
        if (await el.isDisplayed()) { await el.click(); return true }
        return false
      },
      // ── Samsung Gallery ──
      async () => {
        const el = await $('//android.widget.GridView//android.widget.FrameLayout[1]')
        if (await el.isDisplayed()) { await el.click(); return true }
        return false
      },
      // ── RecyclerView-based galleries (banyak ROM) ──
      async () => {
        const el = await $('//androidx.recyclerview.widget.RecyclerView//android.widget.ImageView[1]')
        if (await el.isDisplayed()) { await el.click(); return true }
        return false
      },
      // ── Generic ImageView pertama yang cukup besar (last resort lama) ──
      async () => {
        const images = await $$('//android.widget.ImageView')
        for (const img of images) {
          try {
            const displayed = await img.isDisplayed()
            const size = await img.getSize()
            if (displayed && size.width > 50 && size.height > 50) {
              await img.click()
              return true
            }
          } catch (_) { }
        }
        return false
      },
    ]

    for (const strategy of strategies) {
      try {
        const success = await strategy()
        if (success) {
          logger.info('✅ Foto ditap, cek dialog konfirmasi tambahan...')
          await browser.pause(1500)

          await this.handleConfirmSelectionDialog()

          await browser.pause(1500)
          const backToApp = await this.verifyBackToCreateScreen()

          if (backToApp) {
            logger.info('✅ Foto berhasil dipilih, kembali ke Create Report Screen')
            return true
          } else {
            logger.warn('⚠ Foto ditap tapi belum kembali ke app, coba strategy lain...')
            try {
              const src = await driver.getPageSource()
              logger.warn(`📄 Screen saat ini: ${src.substring(0, 800)}`)
            } catch (_) { }
            continue
          }
        }
      } catch (_) {
        // Coba strategy berikutnya
      }
    }

    logger.warn('⚠ Tidak dapat menemukan/memilih foto di gallery, tekan Back...')
    await driver.back()
    await browser.pause(1000)
    return false
  },

  /**
   * Cek apakah app sudah kembali ke Create Report Screen
   * (pakai anchor testID "create-report-title" yang selalu ada di screen itu).
   */
  async verifyBackToCreateScreen() {
    try {
      const el = await $('~create-report-title')
      return await el.isDisplayed({ timeout: 3000 }).catch(() => false)
    } catch (_) {
      return false
    }
  },
}

module.exports = PhotoHelper