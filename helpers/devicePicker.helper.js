const logger = require('./logger')

const PACKAGES = [
    'com.google.android.photopicker',           
    'com.google.android.providers.media.module',
    'com.google.android.apps.photos',             
]

const DevicePickerHelper = {
    async disableModernPhotoPicker() {
        for (const pkg of PACKAGES) {
            try {
                await driver.execute('mobile: shell', {
                    command: 'pm',
                    args: ['disable-user', '--user', '0', pkg]
                })
                logger.info(`✅ ${pkg} di-disable`)
            } catch (err) {
                logger.warn(`⚠ Gagal disable ${pkg} (lanjut): ${err.message}`)
            }
        }
    },

    async restorePhotoPicker() {
        for (const pkg of PACKAGES) {
            try {
                await driver.execute('mobile: shell', {
                    command: 'pm',
                    args: ['enable', pkg]
                })
                logger.info(`✅ ${pkg} di-restore`)
            } catch (err) {
                logger.warn(`⚠ Gagal restore ${pkg}: ${err.message}`)
            }
        }
    },
}

module.exports = DevicePickerHelper