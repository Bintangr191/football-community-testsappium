const winston = require('winston')
const path = require('path')
const fs = require('fs-extra')

fs.ensureDirSync('logs')

// ─── Custom Format ────────────────────────────────────────────────────────────
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    const base = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}`
    return stack ? `${base}\n${stack}` : base
  })
)

// Format untuk console 
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`
  })
)

// ─── Logger Instance ──────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',

  transports: [
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File output (semua level, format plain)
    new winston.transports.File({
      filename: path.join('logs', 'appium-tests.log'),
      format: customFormat,
      maxsize: 10 * 1024 * 1024, 
      maxFiles: 5,               
      tailable: true,
    }),

    // File khusus error
    new winston.transports.File({
      filename: path.join('logs', 'errors.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
})

module.exports = logger
