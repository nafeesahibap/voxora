import logging
from cryptography.fernet import Fernet
from app.config import settings

logger = logging.getLogger(__name__)

class AESEncryption:
    """
    Handles AES encryption and decryption of sensitive data.
    """
    def __init__(self):
        # In a real app, this key should be loaded securely
        self.key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.key)

    def encrypt_data(self, data: str) -> bytes:
        return self.cipher_suite.encrypt(data.encode())

    def decrypt_data(self, encrypted_data: bytes) -> str:
        return self.cipher_suite.decrypt(encrypted_data).decode()
