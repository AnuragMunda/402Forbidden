use anchor_lang::prelude::*;

use crate::utils::GameError;

//------------------------------------ Helper Functions / Utils ------------------------------------//

pub const MAX_BPS: u16 = 10_000; // Max basis point
pub const BPS_CAP: u16 = 5000; // Max cap on platform fee

pub fn checked_mul_div(x: u64, y: u64, z: u64) -> Result<u64> {
    let mul_res = x.checked_mul(y).ok_or(GameError::ArenaOverflow)?;
    let result = mul_res.checked_div(z).ok_or(GameError::ArenaOverflow)?;
    Ok(result)
}