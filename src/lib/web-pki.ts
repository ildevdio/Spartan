import LacunaWebPKI from "web-pki";

let pki: LacunaWebPKI | null = null;
let initialized = false;

export interface CertificateInfo {
  thumbprint: string;
  subjectName: string;
  issuerName: string;
  validityEnd: string;
  pkiBrazil?: {
    cpf?: string;
    cnpj?: string;
    companyName?: string;
    responsavel?: string;
  };
}

export function getWebPKI(): LacunaWebPKI {
  if (!pki) {
    // Pass license key here if you have one, or leave empty for localhost testing
    pki = new LacunaWebPKI();
  }
  return pki;
}

export async function initWebPKI(): Promise<boolean> {
  if (initialized) return true;

  return new Promise((resolve) => {
    const instance = getWebPKI();
    instance.init({
      ready: () => {
        initialized = true;
        resolve(true);
      },
      notInstalled: () => {
        resolve(false);
      },
      defaultFail: (ex: any) => {
        console.error("Web PKI init failed:", ex);
        resolve(false);
      },
    });
  });
}

export async function listCertificates(): Promise<CertificateInfo[]> {
  const instance = getWebPKI();

  return new Promise((resolve, reject) => {
    instance.listCertificates({
      selectId: undefined,
      selectOptionFormatter: undefined,
    }).success((certs: any[]) => {
      const mapped: CertificateInfo[] = certs.map((c) => ({
        thumbprint: c.thumbprint,
        subjectName: c.subjectName,
        issuerName: c.issuerName,
        validityEnd: c.validityEnd,
        pkiBrazil: c.pkiBrazil
          ? {
              cpf: c.pkiBrazil.cpf,
              cnpj: c.pkiBrazil.cnpj,
              companyName: c.pkiBrazil.companyName,
              responsavel: c.pkiBrazil.responsavel,
            }
          : undefined,
      }));
      resolve(mapped);
    }).fail((ex: any) => {
      reject(ex);
    });
  });
}

export async function signData(
  thumbprint: string,
  dataToSign: string // base64-encoded data
): Promise<string> {
  const instance = getWebPKI();

  return new Promise((resolve, reject) => {
    instance.signData({
      thumbprint,
      data: dataToSign,
      digestAlgorithm: "SHA-256",
    }).success((signature: string) => {
      resolve(signature);
    }).fail((ex: any) => {
      reject(ex);
    });
  });
}

export async function signHash(
  thumbprint: string,
  hashBase64: string
): Promise<string> {
  const instance = getWebPKI();

  return new Promise((resolve, reject) => {
    instance.signHash({
      thumbprint,
      hash: hashBase64,
      digestAlgorithm: "SHA-256",
    }).success((signature: string) => {
      resolve(signature);
    }).fail((ex: any) => {
      reject(ex);
    });
  });
}

export async function readCertificate(thumbprint: string): Promise<string> {
  const instance = getWebPKI();

  return new Promise((resolve, reject) => {
    instance.readCertificate({
      thumbprint,
    }).success((certEncoding: string) => {
      resolve(certEncoding);
    }).fail((ex: any) => {
      reject(ex);
    });
  });
}

export function isInitialized(): boolean {
  return initialized;
}
