/**
 * Structured logger for the Trading Agent.
 * Outputs JSON lines in production, pretty-prints in development.
 */

'use strict';

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

class Logger {
  constructor(context = 'TradingAgent') {
    this.context = context;
    this.level = LOG_LEVELS[
      (process.env.LOG_LEVEL || 'INFO').toUpperCase()
    ] ?? LOG_LEVELS.INFO;
    this.isPretty = process.env.NODE_ENV !== 'production';
  }

  _write(level, message, meta = {}) {
    if (LOG_LEVELS[level] < this.level) return;

    const entry = {
      ts: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...meta,
    };

    const out = this.isPretty
      ? `[${entry.ts}] ${level.padEnd(5)} [${this.context}] ${message}` +
        (Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '')
      : JSON.stringify(entry);

    const stream = level === 'ERROR' ? process.stderr : process.stdout;
    stream.write(out + '\n');
  }

  debug(msg, meta)  { this._write('DEBUG', msg, meta); }
  info(msg, meta)   { this._write('INFO',  msg, meta); }
  warn(msg, meta)   { this._write('WARN',  msg, meta); }
  error(msg, meta)  { this._write('ERROR', msg, meta); }

  child(context) {
    const child = new Logger(`${this.context}:${context}`);
    child.level = this.level;
    child.isPretty = this.isPretty;
    return child;
  }
}

module.exports = { Logger };
