import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CertificatePdfData = {
  studentName: string;
  schoolName: string;
  programName: string;
  amountFormatted: string;
  issuedDate: string;
  validUntil: string | null;
  certificateId: string;
  verificationUrl: string;
  tier: number;
  sponsorName: string | null;
  sponsorType: string | null;
};

/* ------------------------------------------------------------------ */
/*  Fonts — IBM Plex family (loaded from CDN for PDF generation)       */
/* ------------------------------------------------------------------ */

const PLEX_BASE = 'https://fonts.gstatic.com/s';

Font.register({
  family: 'IBM Plex Sans',
  fonts: [
    { src: `${PLEX_BASE}/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFQ.ttf`, fontWeight: 400 },
    { src: `${PLEX_BASE}/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdA.ttf`, fontWeight: 600 },
    { src: `${PLEX_BASE}/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr8AIFsdA.ttf`, fontWeight: 700 },
  ],
});

Font.register({
  family: 'IBM Plex Serif',
  fonts: [
    { src: `${PLEX_BASE}/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUa454.ttf`, fontWeight: 400 },
    { src: `${PLEX_BASE}/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI0q1s.ttf`, fontWeight: 600 },
  ],
});

Font.register({
  family: 'IBM Plex Mono',
  fonts: [
    { src: `${PLEX_BASE}/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf`, fontWeight: 400 },
    { src: `${PLEX_BASE}/ibmplexmono/v19/-F6qfjptAgt5VM-kVkqdyU8n3uAL8ldPg3w.ttf`, fontWeight: 600 },
  ],
});

/* ------------------------------------------------------------------ */
/*  Brand constants                                                    */
/* ------------------------------------------------------------------ */

const BRAND_BLUE = '#2B39A3';
const WARM_WHITE = '#FDFCFA';
const BORDER_COLOR = '#E2E0DC';
const MUTED_TEXT = '#6B6860';

const SEAL_PATH =
  process.env.NODE_ENV === 'production'
    ? 'https://doculet.ai/brand/assets/logo/doculet-shield-80.png'
    : `${process.cwd()}/public/brand/assets/logo/doculet-shield-80.png`;

const TIER_LABELS: Record<number, string> = {
  1: 'Tier 1 — Basic',
  2: 'Tier 2 — I am paying for my education',
  3: 'Tier 3 — Sponsored',
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: {
    backgroundColor: WARM_WHITE,
    paddingVertical: 48,
    paddingHorizontal: 56,
    fontFamily: 'IBM Plex Sans',
    fontSize: 10,
    color: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_BLUE,
  },
  brandName: {
    fontFamily: 'IBM Plex Serif',
    fontSize: 22,
    fontWeight: 600,
    color: BRAND_BLUE,
  },
  brandTag: {
    fontSize: 8,
    letterSpacing: 2,
    color: MUTED_TEXT,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  docTitle: {
    fontFamily: 'IBM Plex Serif',
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  certIdRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  certIdBadge: {
    backgroundColor: '#F0F0EE',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  certIdText: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    color: MUTED_TEXT,
    letterSpacing: 0.5,
  },
  mainContent: {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 8,
    padding: 28,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  nameSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: MUTED_TEXT,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  studentName: {
    fontFamily: 'IBM Plex Serif',
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1A1A',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  detailCell: {
    width: '47%',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1A1A1A',
    marginTop: 2,
  },
  amountSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: MUTED_TEXT,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amountValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 28,
    fontWeight: 600,
    color: BRAND_BLUE,
  },
  tierBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  tierText: {
    fontSize: 9,
    fontWeight: 600,
    color: BRAND_BLUE,
    backgroundColor: '#E8EAF6',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  sponsorSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    alignItems: 'center',
  },
  sponsorText: {
    fontSize: 10,
    color: MUTED_TEXT,
  },
  sponsorName: {
    fontWeight: 600,
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  footerLeft: {
    maxWidth: '60%',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  dateItem: {},
  dateLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: MUTED_TEXT,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 9,
    color: '#1A1A1A',
  },
  verifyNote: {
    fontSize: 8,
    color: MUTED_TEXT,
    marginTop: 8,
    lineHeight: 1.4,
  },
  verifyUrl: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 7,
    color: BRAND_BLUE,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrCaption: {
    fontSize: 7,
    color: MUTED_TEXT,
    marginTop: 4,
    textAlign: 'center',
  },
  watermarkLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkText: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 52,
    color: 'rgba(43,57,163,0.045)',
    letterSpacing: 6,
    transform: [{ operation: 'rotate', value: [-45] }],
  },
  sealImage: {
    width: 64,
    height: 64,
  },
  sealContainer: {
    alignItems: 'center',
  },
  sealCaption: {
    fontSize: 7,
    color: MUTED_TEXT,
    marginTop: 4,
    textAlign: 'center',
  },
});

/* ------------------------------------------------------------------ */
/*  QR Code helper — generates data URI                                */
/* ------------------------------------------------------------------ */

export async function generateQrDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: { dark: BRAND_BLUE, light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

/* ------------------------------------------------------------------ */
/*  Certificate PDF Document                                           */
/* ------------------------------------------------------------------ */

type CertificateDocumentProps = {
  data: CertificatePdfData;
  qrDataUri: string;
};

export function CertificateDocument({ data, qrDataUri }: CertificateDocumentProps) {
  const tierLabel = TIER_LABELS[data.tier] ?? `Tier ${data.tier}`;

  return (
    <Document
      title={`Doculet Certificate — ${data.studentName}`}
      author="Doculet"
      subject="Proof of Funds Certificate"
    >
      <Page size="A4" style={styles.page}>
        {/* Diagonal watermark — cert ID, absolute, very faint */}
        <View style={styles.watermarkLayer}>
          <Text style={styles.watermarkText}>{data.certificateId}</Text>
        </View>

        {/* Header — brand */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Doculet</Text>
            <Text style={styles.brandTag}>Proof of Funds Verification</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.brandTag}>Certificate of Verification</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.docTitle}>Proof of Funds Certificate</Text>

        {/* Certificate ID */}
        <View style={styles.certIdRow}>
          <View style={styles.certIdBadge}>
            <Text style={styles.certIdText}>ID: {data.certificateId}</Text>
          </View>
        </View>

        {/* Main content card */}
        <View style={styles.mainContent}>
          {/* Student name */}
          <View style={styles.nameSection}>
            <Text style={styles.sectionLabel}>Certificate holder</Text>
            <Text style={styles.studentName}>{data.studentName}</Text>
          </View>

          {/* Details grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCell}>
              <Text style={styles.sectionLabel}>Institution</Text>
              <Text style={styles.detailValue}>{data.schoolName}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.sectionLabel}>Program</Text>
              <Text style={styles.detailValue}>{data.programName}</Text>
            </View>
          </View>

          {/* Verified amount */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Verified amount</Text>
            <Text style={styles.amountValue}>{data.amountFormatted}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>
          </View>

          {/* Sponsor (if applicable) */}
          {data.sponsorName ? (
            <View style={styles.sponsorSection}>
              <Text style={styles.sponsorText}>
                Sponsored by{' '}
                <Text style={styles.sponsorName}>{data.sponsorName}</Text>
                {data.sponsorType ? ` — ${data.sponsorType}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Footer — seal (left) · dates (centre) · QR (right) */}
        <View style={styles.footer}>
          {/* Bottom-left: Doculet seal */}
          <View style={styles.sealContainer}>
            <Image style={styles.sealImage} src={SEAL_PATH} />
            <Text style={styles.sealCaption}>Doculet</Text>
          </View>

          <View style={styles.footerLeft}>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Issued</Text>
                <Text style={styles.dateValue}>{data.issuedDate}</Text>
              </View>
              {data.validUntil ? (
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Valid until</Text>
                  <Text style={styles.dateValue}>{data.validUntil}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.verifyNote}>
              Verify this certificate at:{'\n'}
              <Text style={styles.verifyUrl}>{data.verificationUrl}</Text>
            </Text>
          </View>

          {/* Bottom-right: QR code */}
          <View style={styles.qrContainer}>
            <Image style={styles.qrImage} src={qrDataUri} />
            <Text style={styles.qrCaption}>Scan to verify</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
