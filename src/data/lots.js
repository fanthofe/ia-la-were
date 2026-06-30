export const PHOTO_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCxIlYK0R8-RQ07SWls-H7aCLolu5elhV-vKcWpF8zEUP6-WdBrhhyXksi8mWhHqAZ-aHG9eeR6RsAZhlfS0sTQLbsEljZckS5Z2fZQAjYNmvmerwjX9DhiCTxP9VqgthSnhfPydLiYSnfCLqjZYKI4Q_PkiiwQ9Xb1XfBI7zda1BWyfTUra5h93u4tu2B_7vnWkkL68lPSHmxAGLS4daonkSdgaQ1i3Gk8elQ_yWPdhWS2ofl5rg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDM1nIXKY06a6NpPnPPDmZLjqVHoydHVYqIlG8p-7OEHOKBnHkuAY-8BydVIONFCJzECNZnIYnpuXZ8JkLw4tKtJl2K480zp0q1X4ME6kfo0ucorSNl55FDjQGFEUTIAcTJ8LLrdNfnJcq-zyzniDorckicsNFEbe6YYLBq8Z79oBwhs9FkXsWua3dtc_7Uc3Co_L5eckXNZ2XbhD0sjYHfWcnMF9azRBHnVOBoIWIoZxeCVqM0-g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4t9gAESCo5nPlfoM9QU8fYYiUg50IXpDNR48rzcwX3CIMQgn5gtX286QHPxz0-HLnYd3Q0ayyl6MyJM3XPXcrwXvqWo9qVHDltY73w7an5_PrWmQuOe2oGHKtQ4gdGygV7hq4jx076O6NaNLpPUAvIo__bUrsF7cxXSadkrcUPT7kkQN1wF3XqvlBNSlU5gSfRbysQzCE5V3Xzirb1GhmHwb8_r_BfFD-FQ6QMyQs2bycf62UwQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWikSd5IwnW4KN4CCTuiavptM_55e_ditm4t5vWOrQo-NFFbvriKNwoz4xOpeRxZvDyqAuS3i07kVIkp1kqsRHKSLuQxVle4i4w1fNPFgJ0n_-4gevdiGN7Lw5FdxYJZa_4gBAPCn7nu-2uCCGRuWeHu4LJLjUd8bZ5k0-BeLHIa_fpxNyXHCn3uxmHemkB5teGhFLQuimV63t5Y6MBTu95UGNym5f7Q5bQEdQ1k32oHuFja34Xw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBI8aA0esjpVG-dq-QT2bQ1J_lhr1TdVoTM6Ho99mgD2mjsRyYZO2ullDuKE-dlQNZJbgT6VcpVNIE75ib0WjYw1Gbf8c7wK4ln0dkvfdzEVHjaC8ELahsOeqkJWzUfxzwREMd2nozUS1zetCZClbuRf-YnF-2S9dqnoouOTApSSqFm-hlAhuHL228E0UceKg26jb5A3mPqPihud2m2vtXYWelNXGzT5RIRntnlSbSUtai4miLomw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4fAx02fbPjqr9KUAI7WkfsMyYON-zPgvyhFelCdAUVRwpeDMoAZsHQAr5PLCf69hfUhLT1elTm1Qo-oocjAB2my_5FY7jY7h3_jYqpKokQWdHtAt1flMrZy4SaGISqhiuoDfPHl4asDHhdLx-kefgI-GfkZN5aVMNqLVBxOVieIcUYLbRYVM0erGdnWyLqRIbD1oQCk3ueTniwned2cMJHKuwhDDFu53TA-hDdCuxUgCOWo9MoA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzzY3BjUKifV3X_dOL3HjTNkb7N0td3rBjxxjPIwXCuqk59-7qFczLccEbR-jEETdVMREsY2mwZm2r1xzM4_0HFIzDvxkFJNcScIqYYYWqbfrHfYKCMq4Dh4zYhWWX0VbHdZv0kbE384KyjcKSoBBK4UTjBYNY_zPMRF7JH2ODtj1fmqoEOJVytwlzhr-hb5kphANwl326I84UhnydT6fQAa-d3K3GfOhZn-o5F9vAHB5PX2f1nA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC1BA5-TZs_tVxd6Dhv_JCvlGAwTruRCyrFjkQpNo08hsen-YtCoBM-hfraX6cOOVejPKGUn35f0S7FdE8uT75-8sD5n6on5bm0K2_iQH2sK3xNVrEXYNlgNMmfbrpducojaQ1o5dB_SPW_wV8IHrnpqFKODRnFBm52i90lDgUVicTWnbMqDt4xIn-Lpe0ySGiLMJRis-KCS3s4np72veYAlS83ftA_nD8S6onGmvtiajUuYOB8CQ',
]

export const LOG_SEQUENCE = [
  { delay: 400,  color: 'text-primary',   prefix: 'SYSTEM:', msg: 'Initialisation du pipeline de détection...' },
  { delay: 900,  color: 'text-primary',   prefix: 'SYSTEM:', msg: 'Modèle YOLO11s chargé en mémoire GPU.' },
  { delay: 1400, color: 'text-tertiary',  prefix: 'YOLO:',   msg: 'Traitement image #01 — Étiquette détectée (97.3%)' },
  { delay: 2000, color: 'text-tertiary',  prefix: 'YOLO:',   msg: 'Position verrouillée [X:342, Y:112] — CONFORME' },
  { delay: 2600, color: 'text-secondary', prefix: 'OLLAMA:', msg: 'Vérification scorie image #01...' },
  { delay: 3200, color: 'text-tertiary',  prefix: 'OLLAMA:', msg: 'Surface propre — aucune scorie détectée.' },
  { delay: 3800, color: 'text-primary',   prefix: 'YOLO:',   msg: 'Traitement image #02 — Étiquette détectée (91.8%)' },
  { delay: 4400, color: 'text-tertiary',  prefix: 'YOLO:',   msg: 'CONFORME — image #02 validée.' },
  { delay: 5000, color: 'text-secondary', prefix: 'OLLAMA:', msg: 'Vérification scorie image #02...' },
  { delay: 5600, color: 'text-tertiary',  prefix: 'OLLAMA:', msg: 'Surface propre — 0% contamination.' },
  { delay: 6200, color: 'text-primary',   prefix: 'SYSTEM:', msg: 'Génération du rapport JSON...' },
  { delay: 6800, color: 'text-tertiary',  prefix: 'SYSTEM:', msg: 'Rapport écrit dans output/' },
]

export const LOTS_SEED = [
  {
    id: 'LOT-2026-042', date: '24/05/2024 — 14:32',
    status: 'CONFORME',     photos: 12, scories: 0, duree: '14.2s', confiance: '99.8%',
  },
  {
    id: 'LOT-2026-041', date: '24/05/2024 — 11:15',
    status: 'NON-CONFORME', photos: 8,  scories: 2, duree: '11.8s', confiance: '95.2%',
  },
  {
    id: 'LOT-2026-040', date: '24/05/2024 — 09:45',
    status: 'CONFORME',     photos: 10, scories: 0, duree: '12.1s', confiance: '98.4%',
  },
]
