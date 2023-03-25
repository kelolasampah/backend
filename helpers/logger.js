const { createLogger, format, transports } = require("winston");
const { combine, colorize, timestamp, printf, errors } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = createLogger({
  transports: [
    new transports.Console({
      level: "info",
      handleExceptions: true,
      json: true,
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        errors({ stack: true }),
        printf((info) =>
          info.message && typeof info.message === "string"
            ? colorize().colorize(
                info.level,
                `${info.timestamp} - ${info.message.trim()}`
              )
            : ""
        )
      ),
    }),
    new transports.DailyRotateFile({
      level: "info",
      handleExceptions: true,
      json: true,
      filename: "KSK_%DATE%.log",
      dirname: "logs",
      datePattern: "YYYYMMDD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "1d",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        errors({ stack: true }),
        printf((info) =>
          info.message && typeof info.message === "string"
            ? `${info.timestamp} - ${info.level}: ${info.message.trim()}`
            : ""
        )
      ),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};
