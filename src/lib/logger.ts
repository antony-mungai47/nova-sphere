import { prisma } from "@/lib/prisma";

type LogLevel = "INFO" | "WARN" | "ERROR" | "FATAL";

export const logger = {
  async log(level: LogLevel, source: string, message: string, meta?: any, error?: any) {
    try {
      // We don't await this so it doesn't block the main thread execution
      prisma.systemLog.create({
        data: {
          level,
          source,
          message,
          stackTrace: error instanceof Error ? error.stack : undefined,
          metadata: meta ? JSON.stringify(meta) : undefined,
        }
      }).catch(e => console.error("Failed to write to SystemLog:", e));

      // Also log to console for local dev visibility
      if (level === "ERROR" || level === "FATAL") {
        console.error(`[${source}] ${level}: ${message}`, error || meta || "");
      } else {
        console.log(`[${source}] ${level}: ${message}`);
      }
    } catch (e) {
      console.error("Logger failed", e);
    }
  },

  info(source: string, message: string, meta?: any) {
    return this.log("INFO", source, message, meta);
  },
  
  warn(source: string, message: string, meta?: any) {
    return this.log("WARN", source, message, meta);
  },
  
  error(source: string, message: string, error?: any, meta?: any) {
    return this.log("ERROR", source, message, meta, error);
  },
  
  fatal(source: string, message: string, error?: any, meta?: any) {
    return this.log("FATAL", source, message, meta, error);
  }
};
