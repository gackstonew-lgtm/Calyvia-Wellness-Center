import { CryptoService } from './crypto.service';

describe('CryptoService (AES-256-GCM KDPA 2019 compliance)', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  it('should encrypt sensitive string and decrypt back to original text', () => {
    const plainText = 'Patient exhibits severe alcohol dependence with tremors and delirium risk';
    const encrypted = service.encrypt(plainText);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(plainText);
    expect(encrypted).toContain(':'); // Contains iv:authTag:cipher

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toEqual(plainText);
  });

  it('should return null when encrypting null or undefined', () => {
    expect(service.encrypt(null)).toBeNull();
    expect(service.encrypt(undefined)).toBeNull();
  });

  it('should handle tampered ciphertext securely', () => {
    const plainText = 'Confidential Psychiatric Evaluation';
    const encrypted = service.encrypt(plainText);
    expect(encrypted).toBeDefined();
    const parts = (encrypted as string).split(':');
    parts[1] = Buffer.from('corrupt_auth_tag').toString('base64');
    const tampered = parts.join(':');

    const result = service.decrypt(tampered);
    expect(result).toEqual('[ENCRYPTED_DATA_ACCESS_DENIED]');
  });
});
