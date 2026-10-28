//! Parses the quantities warehouse staff type into stock counts.

use std::num::ParseIntError;

/// Why a typed quantity was refused.
#[derive(Debug, thiserror::Error, PartialEq)]
pub enum QtyError {
    #[error("empty quantity")]
    Empty,
    #[error("not a number: {0}")]
    NotANumber(#[from] ParseIntError),
    #[error("{0} is more than the shelf holds ({1})")]
    TooMany(u32, u32),
}

/// `" 12 "` → 12; refuses empty input, non-numbers and more than `max`.
pub fn parse_qty(raw: &str, max: u32) -> Result<u32, QtyError> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(QtyError::Empty);
    }
    let n: u32 = trimmed.parse()?;
    if n > max {
        return Err(QtyError::TooMany(n, max));
    }
    Ok(n)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_trimmed_numbers() {
        assert_eq!(parse_qty(" 12 ", 50), Ok(12));
    }

    #[test]
    fn refuses_empty_and_too_many() {
        assert_eq!(parse_qty("  ", 50), Err(QtyError::Empty));
        assert_eq!(parse_qty("60", 50), Err(QtyError::TooMany(60, 50)));
        assert_eq!(QtyError::TooMany(60, 50).to_string(), "60 is more than the shelf holds (50)");
    }

    #[test]
    fn wraps_parse_errors() {
        assert!(matches!(parse_qty("ten", 50), Err(QtyError::NotANumber(_))));
    }
}
