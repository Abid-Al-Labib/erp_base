"""
Custom database types for better SQLite compatibility
"""
from sqlalchemy import types
from sqlalchemy.types import DateTime as SQLAlchemyDateTime
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DateTime(types.TypeDecorator):
    """
    Custom DateTime type that strips whitespace from SQLite datetime strings.

    SQLite stores datetimes as ISO format strings. Sometimes these strings
    have trailing whitespace (like \r\n from Windows). This type automatically
    strips that whitespace before parsing.
    """
    impl = SQLAlchemyDateTime
    cache_ok = True

    def process_result_value(self, value, dialect):
        """Process value when reading from database"""
        logger.info(f"[RESULT] Processing value from database: type={type(value).__name__}, value={repr(value)}")

        if value is None:
            logger.info("[RESULT] Value is None, returning None")
            return None

        # If value is already a datetime, return it
        if isinstance(value, datetime):
            logger.info(f"[RESULT] Value is already datetime: {value}")
            return value

        # If value is a string (from SQLite), strip whitespace and parse
        if isinstance(value, str):
            logger.info(f"[RESULT] Original string value: {repr(value)} (length={len(value)})")

            # Strip ALL whitespace including \r\n
            value = value.strip()
            logger.info(f"[RESULT] After strip: {repr(value)} (length={len(value)})")

            try:
                # Handle ISO format with Z timezone indicator
                if value.endswith('Z'):
                    logger.info("[RESULT] Removing 'Z' timezone indicator")
                    value = value[:-1] + '+00:00'
                    logger.info(f"[RESULT] After Z replacement: {repr(value)}")

                parsed = datetime.fromisoformat(value)
                logger.info(f"[RESULT] Successfully parsed to datetime: {parsed}")
                return parsed
            except ValueError as e:
                logger.error(f"[RESULT] Failed to parse datetime string: {repr(value)} - Error: {e}")
                raise

        logger.warning(f"[RESULT] Unexpected value type: {type(value)}")
        return value

    def process_bind_param(self, value, dialect):
        """Process value when writing to database"""
        logger.info(f"[BIND] Processing value for database write: type={type(value).__name__}, value={repr(value)}")

        if value is None:
            logger.info("[BIND] Value is None, returning None")
            return None

        # If it's a datetime object, return as-is
        # SQLAlchemy's DateTime type will handle the conversion to string for SQLite
        if isinstance(value, datetime):
            logger.info(f"[BIND] Datetime object, returning as-is: {value}")
            return value

        # If someone passed a string, clean it and convert to datetime
        if isinstance(value, str):
            logger.warning(f"[BIND] Received string instead of datetime: {repr(value)}")
            value = value.strip()
            logger.info(f"[BIND] After strip: {repr(value)}")
            try:
                # Handle ISO format with Z timezone indicator
                if value.endswith('Z'):
                    value = value[:-1] + '+00:00'
                parsed = datetime.fromisoformat(value)
                logger.info(f"[BIND] Parsed to datetime: {parsed}")
                # Return as datetime object
                return parsed
            except ValueError as e:
                logger.error(f"[BIND] Failed to parse datetime string for binding: {repr(value)} - Error: {e}")
                raise

        logger.warning(f"[BIND] Unexpected value type: {type(value)}, returning as-is")
        return value
