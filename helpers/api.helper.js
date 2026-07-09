require('dotenv').config()
const axios = require('axios')
const mysql = require('mysql2/promise')
const logger = require('./logger')

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'football',
  password: process.env.DB_PASSWORD || 'football123',
  database: process.env.DB_NAME || 'football_auth',
  port: process.env.DB_PORT || 3306,
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  logger.debug(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    logger.error(`❌ API Error: ${status} ${error.config?.url} — ${message}`)
    throw error
  }
)

const ApiHelper = {
  /**
   * Login via API dan dapatkan token
   * Berguna untuk setup state (misal: sudah login) sebelum test UI
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async loginViaApi(email, password) {
    logger.info(`🔑 Login via API: ${email}`)
    const response = await apiClient.post('/auth/login', { email, password })
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    }
  },

  /**
   * Registrasi user baru via API (untuk setup test data)
   *
   * @param {Object} userData
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} [userData.fullName]
   * @returns {Promise<Object>}
   */
  async registerViaApi(userData) {
    logger.info(`👤 Registrasi user via API: ${userData.email}`)
    const response = await apiClient.post('/auth/register', {
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName || userData.username || userData.email.split('@')[0],
    })
    return response.data
  },

  /**
   * @param {string} email
   * @param {string} adminToken 
   */
  async deleteTestUser(email, adminToken) {
    logger.info(`🗑️  Hapus test user: ${email}`)
    try {
      await apiClient.delete(`/auth/users/${email}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    } catch (error) {
      logger.warn(`⚠ Gagal hapus user (mungkin sudah tidak ada): ${error.message}`)
    }
  },

  /**
   * @param {string} email
   */
  async verifyTestUser(email) {
    logger.info(`🛠️ Bypass verifikasi untuk user: ${email} via DB`)
    let connection
    try {
      connection = await mysql.createConnection(DB_CONFIG)
      const [result] = await connection.execute(
        'UPDATE User SET isVerified = 1 WHERE email = ?',
        [email]
      )
      if (result.affectedRows > 0) {
        logger.info(`✅ User ${email} sekarang terverifikasi (isVerified = 1)`)
      } else {
        logger.warn(`⚠ User ${email} tidak ditemukan di database saat mencoba verifikasi.`)
      }
    } catch (error) {
      logger.error(`❌ Gagal bypass verifikasi DB: ${error.message}`)
      throw error
    } finally {
      if (connection) await connection.end()
    }
  },

  /**
   * @returns {Promise<boolean>}
   */
  async isBackendHealthy() {
    try {
      await apiClient.get('/health', { timeout: 5000 })
      logger.info('✅ Backend sehat dan dapat diakses')
      return true
    } catch {
      try {
        await apiClient.get('/auth/health', { timeout: 5000 })
        return true
      } catch {
        logger.warn('⚠ Backend tidak dapat diakses. Pastikan Docker running.')
        return false
      }
    }
  },

  /**
   * @param {Object} userData
   * @returns {Promise<void>}
   */
  async ensureTestUserExists(userData) {
    try {
      await this.loginViaApi(userData.email, userData.password)
      logger.info(`✅ Test user sudah ada: ${userData.email}`)
    } catch (loginError) {
      logger.info(`📝 Test user belum ada/belum verifikasi, mencoba mendaftarkan: ${userData.email}`)
      try {
        try {
          await this.registerViaApi(userData)
          logger.info(`✅ Test user berhasil diregistrasi: ${userData.email}`)
        } catch (regErr) {
          logger.warn(`⚠ Registrasi dilewati (mungkin email sudah dipakai): ${regErr.message}`)
        }

        await this.verifyTestUser(userData.email)

        await this.loginViaApi(userData.email, userData.password)
        logger.info(`✅ Test user siap digunakan: ${userData.email}`)
      } catch (error) {
        logger.error(`❌ Gagal menyiapkan test user: ${error.message}`)
        throw error
      }
    }
  },

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} 
   */
  async getAccessToken(email, password) {
    const { accessToken } = await this.loginViaApi(email, password)
    return accessToken
  },

  /**
   * @param {string} token 
   * @param {Object} [options]
   * @param {string} [options.sort='hot'] 
   * @param {number} [options.page=1]
   * @param {number} [options.limit=20]
   * @returns {Promise<Array>} 
   */
  async getForumPosts(token, { sort = 'hot', page = 1, limit = 20 } = {}) {
    logger.info(`📥 Ambil forum posts (sort=${sort}, page=${page})`)
    const response = await apiClient.get('/forum/posts', {
      params: { sort, page, limit },
      headers: { Authorization: `Bearer ${token}` },
    })
    const posts = response.data?.data?.posts ?? response.data?.posts ?? []
    logger.info(`✅ Ditemukan ${posts.length} post`)
    return posts
  },

  /**
   * @param {Object} userData 
   * @param {Object} [options] 
   * @returns {Promise<Array>}
   */
  async getForumPostsAsUser(userData, options = {}) {
    const token = await this.getAccessToken(userData.email, userData.password)
    return this.getForumPosts(token, options)
  },

  /**
   * @param {string} token
   * @param {Object} [options]
   */
  async getReports(token, { sort = 'new', page = 1, limit = 20 } = {}) {
    logger.info(`📥 Ambil reports (sort=${sort}, page=${page})`)
    const response = await apiClient.get('/reports', {
      params: { sort, page, limit },
      headers: { Authorization: `Bearer ${token}` },
    })
    const reports = response.data?.data ?? []
    return reports
  },

  async getReportsAsUser(userData, options = {}) {
    const token = await this.getAccessToken(userData.email, userData.password)
    return this.getReports(token, options)
  },

  /**
   * @param {string} token 
   * @param {string} reportId 
   * @param {string} content 
   * @param {string} [imageBase64] 
   */
  async commentOnReport(token, reportId, content, imageBase64) {
    logger.info(`💬 Mengirim komentar ke laporan ${reportId}`)
    const payload = { content }
    if (imageBase64) payload.imageBase64 = imageBase64
    const response = await apiClient.post(`/reports/${reportId}/comments`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}

module.exports = ApiHelper