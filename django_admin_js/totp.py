import base64
import hashlib
import hmac
import secrets
import time
import struct

def generate_secret():
    """Generates a random 20-byte Base32 encoded secret key (160 bits)."""
    # 20 bytes is standard for Google Authenticator (160 bits strength)
    random_bytes = secrets.token_bytes(20)
    return base64.b32encode(random_bytes).decode("utf-8").replace("=", "")

def get_totp_token(secret, time_slice):
    """Calculates the TOTP token for a given secret and time slice."""
    # Ensure key has padding
    missing_padding = len(secret) % 8
    if missing_padding:
        secret += "=" * (8 - missing_padding)
    
    key = base64.b32decode(secret, casefold=True)
    
    # Pack the time slice into an 8-byte big-endian integer
    msg = struct.pack(">Q", time_slice)
    
    # Calculate the HMAC-SHA1 signature
    hmac_hash = hmac.new(key, msg, hashlib.sha1).digest()
    
    # Dynamic truncation to extract a 4-byte segment
    offset = hmac_hash[-1] & 0x0F
    code = (
        (hmac_hash[offset] & 0x7F) << 24
        | (hmac_hash[offset + 1] & 0xFF) << 16
        | (hmac_hash[offset + 2] & 0xFF) << 8
        | (hmac_hash[offset + 3] & 0xFF)
    )
    
    # Return code modulo 10^6 padded to 6 digits
    return str(code % 1000000).zfill(6)

def verify_totp(secret, token, window=1):
    """
    Validates a TOTP token against a secret.
    Allows a window of +/- 30s intervals (default window=1) to compensate for clock drift.
    """
    if not token or len(token) != 6 or not token.isdigit():
        return False
        
    current_time = int(time.time())
    current_slice = current_time // 30
    
    # Check within the time window
    for i in range(-window, window + 1):
        if get_totp_token(secret, current_slice + i) == token:
            return True
            
    return False
