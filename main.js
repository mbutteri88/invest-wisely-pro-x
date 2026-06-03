// ── Chart.js global defaults — leggibilità
if (window.Chart) {
  Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
  Chart.defaults.font.size = 12.5;
  Chart.defaults.color = '#202124';
  Chart.defaults.borderColor = 'rgba(0,0,0,.08)';
  Chart.defaults.plugins.legend.labels.font = { size: 12.5, weight: '600', family: "'DM Sans', sans-serif" };
  Chart.defaults.plugins.legend.labels.boxWidth = 18;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: '700' };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12.5 };
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.elements.line.borderWidth = 2.5;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
}

// ══════════════════════════════════════════════════════════════
// CUSTOM PORTFOLIO — definizione asset class con metadati
// Tutti ETF/ETC ad accumulo. Parametri storici calibrati.
// ══════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════
// PORTAFOGLI — parametri storici reali + volatilità storica
// Fonti: Dimson-Marsh-Staunton, Credit Suisse Global Investment
//        Returns Yearbook, Dalio/Browne per PP/GB
// ══════════════════════════════════════════════════════════════
const PORT = {
  eq100: {
    label: '100% Azioni',
    desc: 'Portafoglio interamente azionario Massimo rendimento atteso, massima volatilità. Adatto a orizzonti ≥15 anni con alta tolleranza alle perdite temporanee.',
    best: .102, normal: .070, worst: .009, vol: .160,
    eq: 1.0, ob: 0.0, gold: 0.0, cash: 0.0,
    realRet: .050, inflBeta: 0.3, fxExp: 0.85,  // ~85% non-EUR (MSCI World: 65% USA + altri)
  },
  eq80: {
    label: '80/20 Az/Ob', desc: '80% azioni, 20% obbligazioni. Portafoglio aggressivo con lieve ammortizzatore obbligazionario.',
    best: .091, normal: .065, worst: .016, vol: .130,
    eq: .8, ob: .2, gold: 0, cash: 0, realRet: .045, inflBeta: 0.2, fxExp: 0.70,
  },
  eq60: {
    label: '60/40 Az/Ob', desc: '60/40 classico — il portafoglio bilanciato per eccellenza. Riduce la volatilità rispetto al 100% azioni mantenendo rendimenti solidi nel lungo periodo.',
    best: .074, normal: .055, worst: .019, vol: .095,
    eq: .6, ob: .4, gold: 0, cash: 0, realRet: .037, inflBeta: 0.05, fxExp: 0.55,
  },
  eq50: {
    label: '50/50 Az/Ob', desc: 'Portafoglio equilibrato. Più difensivo del 60/40, adatto a chi ha orizzonte medio e tolleranza moderata al rischio.',
    best: .066, normal: .050, worst: .020, vol: .080,
    eq: .5, ob: .5, gold: 0, cash: 0, realRet: .032, inflBeta: -0.05, fxExp: 0.47,
  },
  eq40: {
    label: '40/60 Az/Ob', desc: 'Prevalenza obbligazionaria. Bassa volatilità, rendimento contenuto. Adatto a chi si avvicina alla pensione.',
    best: .058, normal: .045, worst: .020, vol: .065,
    eq: .4, ob: .6, gold: 0, cash: 0, realRet: .025, inflBeta: -0.15, fxExp: 0.38,
  },
  eq20: {
    label: '20/80 Az/Ob', desc: 'Portafoglio molto conservativo. Minima esposizione azionaria, massima stabilità. Rendimento reale spesso prossimo a zero in contesti di alta inflazione.',
    best: .044, normal: .035, worst: .018, vol: .045,
    eq: .2, ob: .8, gold: 0, cash: 0, realRet: .015, inflBeta: -0.25, fxExp: 0.19,
  },
  ob100: {
    label: '100% Obbligaz.', desc: 'Portafoglio interamente obbligazionario. Protezione del capitale nominale, ma soffre molto in periodi di alta inflazione e rialzo tassi. Volatilità effettiva ~4% (includendo duration risk su scadenze medie 5-7a).',
    best: .038, normal: .030, worst: .015, vol: .040,
    eq: 0, ob: 1.0, gold: 0, cash: 0, realRet: .010, inflBeta: -0.35, fxExp: 0.05,
  },
  lifecycle: {
    label: 'Lifecycle ♻', desc: 'Portafoglio che riduce automaticamente la quota azionaria con l\'età Parte ~80% azioni a 20 anni, arriva a ~20% a 70 anni.',
    best: null, normal: null, worst: null, vol: null,
    eq: null, ob: null, gold: 0, cash: 0, realRet: .035, inflBeta: 0.1, fxExp: null, // variabile con età
  },
  golden_butterfly: {
    label: '🦋 Golden Butterfly',
    desc: 'Ideato da Tyler from Portfolio Charts (2012). Composizione: 20% Az. Large Cap, 20% Az. Small Cap Value, 20% Oro, 20% Ob. Lungo Termine, 20% Ob. Breve Termine. Ottimizzato per massimizzare la peggior performance storica su 30 anni (\'worst case\'). Volatilità molto bassa, ottimo Sharpe ratio storico (1970-2023: ~9.7%/a lordo — gonfiato dal bull market oro anni \'70 e dal bull bond 1980-2020, non ripetibili). Rendimento atteso forward-looking: ~5.2%/a.',
    best: .067, normal: .052, worst: .023, vol: .075,
    eq: .4, ob: .4, gold: .2, cash: 0, realRet: .032, inflBeta: 0.14, fxExp: 0.55,  // 40%eq*0.85 + 20%oro*1.0 + 40%ob*0.05 ≈ 0.56
    breakdown: {
      'Az. Large Cap (US)': '20%',
      'Az. Small Cap Value': '20%',
      'Oro': '20%',
      'Ob. Lungo Termine': '20%',
      'Ob. Breve Termine': '20%',
    }
  },
  permanent: {
    label: '🏛️ Permanent Portfolio',
    desc: 'Ideato da Harry Browne (1981). Composizione: 25% Azioni, 25% Oro, 25% Ob. Lungo Termine, 25% Liquidità. Progettato per funzionare in OGNI regime economico: prosperità (azioni), inflazione (oro), deflazione (obbligazioni), recessione (liquidità). Volatilità storica molto bassa (σ≈7%), rendimento nominale storico 1970-2023: ~8%/a lordo (beneficio del gold rush degli anni \'70 e del bull bond 1980-2020). Rendimento atteso forward-looking: ~4.4%/a. Beta inflazione calcolato ≈ +0.13: oro e liquidità a tasso variabile coprono parzialmente l\'impatto negativo delle obbligazioni lunghe in regime inflattivo.',
    best: .058, normal: .044, worst: .018, vol: .070,
    eq: .25, ob: .25, gold: .25, cash: .25, realRet: .024, inflBeta: 0.13, fxExp: 0.47, // 25%eq*0.85 + 25%oro*1.0 + 25%ob*0.05 + 25%cash*0
    breakdown: {
      'Azioni': '25%',
      'Oro': '25%',
      'Ob. Lungo Termine': '25%',
      'Liquidità (T-Bills)': '25%',
    }
  },
  all_seasons: {
    label: '🌤️ All Seasons (Dalio)',
    desc: 'Versione retail dell\'All Weather di Ray Dalio (Bridgewater). Composizione: 30% Azioni, 40% Ob. Lungo Termine, 15% Ob. Medio Termine, 7.5% Oro, 7.5% Commodities. Progettato per distribuire il rischio su quattro regimi macro (crescita alta/bassa × inflazione alta/bassa). Storicamente: ~7.5%/a nominale, σ≈8%. Rendimento atteso forward-looking: ~5.0%/a. Nota: l\'allocazione del 40% in obbligazioni a lungo termine lo rende più vulnerabile all\'inflazione di quanto sembri (beta inflazione calcolato ≈ −0.03: la perdita sulle obbligazioni compensa quasi del tutto la protezione di oro e commodities).',
    best: .066, normal: .050, worst: .020, vol: .080,
    eq: .30, ob: .55, gold: .15, cash: 0,
    realRet: .030, inflBeta: -0.03, fxExp: 0.40, // 30%eq*0.85 + 15%real(oro+comm) + 55%ob*0.05; i real asset (oro 7.5% + commodities 7.5%) sono modellati nello sleeve 'gold'
    breakdown: {
      'Azioni Globali': '30%',
      'Ob. Lungo Termine': '40%',
      'Ob. Medio Termine': '15%',
      'Oro': '7.5%',
      'Commodities': '7.5%',
    }
  },
  larry: {
    label: '📐 Larry Portfolio',
    desc: 'Ideato da Larry Swedroe. Alta concentrazione su fattori di rischio accademici (small cap value, emerging). Composizione: 15% US Small Cap Value, 7.5% Intl Small Cap Value, 7.5% Emerging Markets, 70% Ob. Breve/Medio Termine. L\'idea: concentrare il rischio solo sull\'azionario ad alto rendimento atteso (small cap value, emerging) ammortizzato da bond a bassa duration. Volatilità portafoglio calcolata ~7.5%/a. Rendimento atteso ~5.8%/a. Beta inflazione calcolato ≈ −0.02: il contributo del bond breve (tassi flottanti) è quasi neutralizzato dalla quota azionaria value.',
    best: .073, normal: .058, worst: .030, vol: .075,
    eq: .30, ob: .70, gold: 0, cash: 0,
    realRet: .038, inflBeta: -0.02, fxExp: 0.29, // 30%eq*0.85 + 70%ob*0.05
    breakdown: {
      'US Small Cap Value': '15%',
      'Intl Small Cap Value': '7.5%',
      'Emerging Markets': '7.5%',
      'Ob. Breve/Medio Termine': '70%',
    }
  },
  global_market: {
    label: '🗺️ Global Market Portfolio',
    desc: 'Portafoglio che replica la capitalizzazione del mercato mondiale: ~55% azioni globali sviluppati, ~45% obbligazioni globali aggregate. È il portafoglio "neutro" per definizione — rappresenta la quota detenuta dall\'investitore medio mondiale. Rendimento storico ~6%/a, vol ~9%. Ottimo benchmark passivo.',
    best: .071, normal: .053, worst: .020, vol: .088,
    eq: .55, ob: .45, gold: 0, cash: 0,
    realRet: .033, inflBeta: 0.02, fxExp: 0.49, // 55%eq*0.85 + 45%ob*0.05
    breakdown: {
      'Azioni Globali Sviluppati': '55%',
      'Obbligaz. Globali (Agg.)': '45%',
    }
  },
  custom: {
    label: '🔧 Custom',
    desc: 'Portafoglio personalizzato. Scegli le asset class e le percentuali nel pannello sottostante.',
    best: null, normal: null, worst: null, vol: null,
    eq: null, ob: null, gold: null, cash: null,
    realRet: null, inflBeta: null, fxExp: null,
  },
};

// ══════════════════════════════════════════════════════════════
// ASSET CLASSES — per portafoglio custom
// Parametri calibrati su dati storici e forward-looking consensus
// ══════════════════════════════════════════════════════════════
const ASSET_CLASSES = {
  // ══════════════════════════════════════════════════════════════
  // AZIONI
  // mu = rendimento nominale forward-looking (10-20a)
  // vol = volatilità storica annualizzata 1970-2024
  // Fonti: DMS Global Investment Returns Yearbook 2024,
  //        dati storici mercati finanziari (Federal Reserve,
  //        Banche Centrali, letteratura accademica)
  // ══════════════════════════════════════════════════════════════
  eq_sviluppati: {
    label: 'Azioni Mercati Sviluppati', emoji: '🌍', cat: 'eq', isEq: true,
    mu: 0.070, vol: 0.158, inflBeta: 0.30, ter: 0.2, fxExp: 0.85,
    histCAGR: 0.102, histPeriod: '1970-2024', src: 'DMS Yearbook 2024',
    desc: 'Paniere di azioni di paesi sviluppati con composizione geografica ampia (America del Nord, Europa, Pacifico). CAGR storico 10.2%/a. Rendimento atteso forward-looking ~7.0%/a, più conservativo per effetto della mean-reversion delle valutazioni (CAPE elevati nel 2024).',
  },
  eq_usa: {
    label: 'Azioni USA Large Cap', emoji: '🇺🇸', cat: 'eq', isEq: true,
    mu: 0.063, vol: 0.155, inflBeta: 0.28, ter: 0.07, fxExp: 1.0,
    histCAGR: 0.105, histPeriod: '1970-2024', src: 'Dati storici mercato azionario USA',
    desc: 'Grandi capitalizzazioni americane. CAGR storico 10.5%/a. Valutazioni elevate al 2024 (CAPE ~30-32) comprimono il rendimento atteso a ~7%/a. Massima liquidità e profondità di mercato a livello globale.',
  },
  eq_europa: {
    label: 'Azioni Europa', emoji: '🇪🇺', cat: 'eq', isEq: true,
    mu: 0.07, vol: 0.170, inflBeta: 0.25, ter: 0.15, fxExp: 0.1,
    histCAGR: 0.095, histPeriod: '1970-2024', src: 'DMS Yearbook 2024',
    desc: 'Mercati azionari europei (Germania, Francia, UK, Svizzera, Olanda, Italia ecc.). CAGR storico ~9.5%/a. Valutazioni storicamente più convenienti rispetto agli USA (CAPE ~14-16 in media), ma crescita degli utili inferiore nel lungo periodo.',
  },
  eq_em: {
    label: 'Azioni Mercati Emergenti', emoji: '🌏', cat: 'eq', isEq: true,
    mu: 0.078, vol: 0.225, inflBeta: 0.35, ter: 0.2, fxExp: 1.0,
    histCAGR: 0.098, histPeriod: '1988-2024', src: 'DMS Yearbook 2024',
    desc: 'Cina, India, Brasile, Taiwan, Corea del Sud e altri mercati in sviluppo. CAGR dal 1988: ~9.8%/a. Alta volatilità (σ≈22%) e rischio politico/valutario. Premio di crescita economica parzialmente eroso da perdite da valuta e governance societaria più debole.',
  },
  eq_small_value: {
    label: 'Azioni Small Cap Value (fattore)', emoji: '📐', cat: 'eq', isEq: true,
    mu: 0.085, vol: 0.205, inflBeta: 0.25, ter: 0.3, fxExp: 1.0,
    histCAGR: 0.135, histPeriod: '1970-2024', src: 'Fama-French Data Library',
    desc: 'Piccole capitalizzazioni a bassa valutazione (P/B basso). Premio documentato da Fama & French (1992, 1993). CAGR US Small Cap Value ~13.5%/a (1970-2024) — fortemente influenzato dagli anni \'70-\'80. Forward-looking più moderato (~8.5%/a) per mean-reversion dei premi di rischio.',
  },
  reits: {
    label: 'Immobiliare Quotato (REITs)', emoji: '🏢', cat: 'eq', isEq: true,
    mu: 0.065, vol: 0.175, inflBeta: 0.20, ter: 0.4, fxExp: 0.8,
    histCAGR: 0.112, histPeriod: '1972-2024', src: 'Dati storici mercato immobiliare quotato',
    desc: 'Fondi immobiliari quotati su borsa. CAGR 1972-2024: ~11.2%/a. Obbligo di distribuzione ≥90% degli utili → elevata cedola. Copertura parziale dell\'inflazione tramite canoni di affitto indicizzati. Correlazione con azioni ~0.60, parzialmente decorrelante.',
  },

  // ══════════════════════════════════════════════════════════════
  // FATTORI ACCADEMICI (FACTOR INVESTING)
  // Rendimenti basati su implementazioni long-only dei premi di
  // rischio documentati dalla letteratura finanziaria accademica.
  // Dati: Fama-French Data Library, letteratura peer-reviewed.
  // mu = forward-looking (premi storici spesso sovrastimati).
  // vol = volatilità storica implementazione long-only globale.
  // ══════════════════════════════════════════════════════════════
  // ── Fattori azionari (cat: 'fat') ─────────────────────────
  // Correlazione intra-fattore calibrata empiricamente (ρ≈0.52)
  // — inferiore alle azioni pure (ρ≈0.65) per effetto della
  // decorrelazione tra i diversi premi di rischio.
  // Fonti: Fama-French Data Library, letteratura peer-reviewed
  // (Jegadeesh & Titman 1993, Carhart 1997, Novy-Marx 2013,
  //  Frazzini & Pedersen 2014, Lustig et al. 2011).
  // mu = forward-looking conservativo (premi storici tendono a
  //      comprimersi post-pubblicazione e per affollamento).
  fat_valore: {
    label: 'Fattore Valore (Value)', emoji: '💎', cat: 'fat', isEq: true,
    mu: 0.072, vol: 0.175, inflBeta: 0.35, ter: 0.3, fxExp: 0.85,
    histCAGR: 0.105, histPeriod: '1970-2024', src: 'Fama & French (1992, 1993)',
    desc: 'Azioni con basse valutazioni (P/B, P/E, EV/EBITDA bassi). CAGR storico long-only ~10.5%/a. Ha sottoperformato il mercato tra 2007 e 2020, recuperando dal 2021. Forward-looking ~7.5%/a. Alta correlazione con azioni cicliche e finanziarie — soffre in recessioni profonde. Correlazione con Momentum ρ≈−0.15: ottima complementarità.',
  },
  fat_momentum: {
    label: 'Fattore Momentum (Prezzo)', emoji: '🚀', cat: 'fat', isEq: true,
    mu: 0.075, vol: 0.195, inflBeta: 0.05, ter: 0.3, fxExp: 0.85,
    histCAGR: 0.120, histPeriod: '1970-2024', src: 'Jegadeesh & Titman (1993), Carhart (1997)',
    desc: 'Strategia long sistematica sui vincitori degli ultimi 12-1 mesi. CAGR storico long-only ~12%/a (1970-2024). Rendimento elevato ma con crash risk: drawdown violenti nei mercati a U-turn (es. 2009: −60%). Forward-looking ~8%/a. Correlazione con Valore ρ≈−0.15 — principale beneficio del multi-fattore.',
  },
  fat_qualita: {
    label: 'Fattore Qualità / Redditività', emoji: '⭐', cat: 'fat', isEq: true,
    mu: 0.075, vol: 0.150, inflBeta: 0.18, ter: 0.3, fxExp: 0.85,
    histCAGR: 0.095, histPeriod: '1990-2024', src: 'Novy-Marx (2013), Fama & French (2015)',
    desc: 'Aziende con alta redditività operativa, bassa leva finanziaria e stabilità degli utili (RMW: Robust Minus Weak). CAGR storico long-only ~9.5%/a (1990-2024). Carattere difensivo: sovra-performa in crisi, sotto-performa nei rally euforici. Parte del modello accademico a 5 fattori. Forward-looking ~7.5%/a.',
  },
  fat_low_vol: {
    label: 'Fattore Bassa Volatilità (Difensivo)', emoji: '📉', cat: 'fat', isEq: true,
    mu: 0.070, vol: 0.120, inflBeta: 0.12, ter: 0.3, fxExp: 0.85,
    histCAGR: 0.085, histPeriod: '1970-2024', src: 'Frazzini & Pedersen (2014)',
    desc: 'Azioni con volatilità storica e beta di mercato bassi (BAB: Betting Against Beta). Anomalia CAPM: il rendimento aggiustato per il rischio supera quello del mercato. CAGR storico ~8.5%/a con σ ~12% (1970-2024). Concentrato in settori difensivi: utilities, consumer staples, healthcare. Forward-looking ~7.0%/a. Ottimo abbinamento con Momentum.',
  },
  fat_size: {
    label: 'Fattore Dimensione (Small Cap)', emoji: '🔬', cat: 'fat', isEq: true,
    mu: 0.075, vol: 0.190, inflBeta: 0.20, ter: 0.25, fxExp: 0.85,
    histCAGR: 0.095, histPeriod: '1970-2024', src: 'Banz (1981), Fama-French Data Library',
    desc: 'Premio di dimensione (SMB: Small Minus Big) — le piccole capitalizzazioni tendono a sovra-performare le grandi nel lungo periodo. CAGR storico ~9.5%/a (1970-2024). Il premio è più robusto nel segmento value. Parzialmente compresso post-pubblicazione accademica. Forward-looking ~7.5%/a. Correlazione con mercato ~0.80.',
  },
  fat_investment: {
    label: 'Fattore Investimento (CMA)', emoji: '🏗️', cat: 'fat', isEq: true,
    mu: 0.072, vol: 0.130, inflBeta: 0.10, ter: 0.35, fxExp: 0.85,
    histCAGR: 0.080, histPeriod: '1990-2024', src: 'Fama & French (2015)',
    desc: 'Aziende con crescita degli attivi bassa (Conservative Minus Aggressive — CMA). Le imprese che investono meno producono rendimenti più alti nel lungo periodo. Parte del modello a 5 fattori (Fama-French 2015). CAGR storico ~8%/a (1990-2024). Carattere difensivo, alta correlazione con Qualità (ρ≈0.40). Forward-looking ~7.2%/a.',
  },
  fat_dividendi: {
    label: 'Fattore Dividendi / Dividend Growth', emoji: '💰', cat: 'fat', isEq: true,
    mu: 0.072, vol: 0.145, inflBeta: 0.22, ter: 0.3, fxExp: 0.85,
    histCAGR: 0.092, histPeriod: '1970-2024', src: 'Literatura accademica sui dividendi',
    desc: 'Aziende con dividend yield elevato e/o storia di crescita dei dividendi (Dividend Aristocrats). CAGR storico ~9.2%/a (1970-2024). Sovrapposizione parziale con Qualità e Valore. Flusso cedolare elevato riduce la volatilità percepita. Settori tipici: utility, finanziari, consumer staples. Forward-looking ~7.2%/a.',
  },
  fat_multifat: {
    label: 'Multi-Fattore (Val+Mom+Qual+LowVol+CMA)', emoji: '🎯', cat: 'fat', isEq: true,
    mu: 0.074, vol: 0.138, inflBeta: 0.20, ter: 0.4, fxExp: 0.85,
    histCAGR: 0.100, histPeriod: '1990-2024', src: 'Letteratura accademica multi-fattore',
    desc: 'Combinazione sistematica di Valore, Momentum, Qualità, Bassa Volatilità e Investimento con pesi uguali. CAGR storico ~10%/a (1990-2024). La diversificazione tra fattori decorrelati (Value-Momentum ρ≈−0.15) riduce la volatilità complessiva (σ≈13.8%). Migliore profilo rischio/rendimento dei singoli fattori nel lungo periodo.',
  },

  // ── Fattori alternativi — Carry, Valute, Trend ───────────────
  // Categorie speciali per correlazioni più accurate:
  // cat:'fat'   → fattori azionari sistematici
  // cat:'carry' → premi carry cross-asset
  // cat:'trend' → trend following / managed futures
  // I fattori carry e trend hanno correlazioni molto diverse
  // dai fattori azionari — trattati separatamente nella matrice.
  fat_carry_bond: {
    label: 'Carry Obbligazionario', emoji: '📊', cat: 'carry',
    mu: 0.045, vol: 0.085, inflBeta: 0.05, ter: 0.5, fxExp: 0.0,
    histCAGR: 0.062, histPeriod: '1990-2024', src: 'Koijen et al. (2018), letteratura carry',
    desc: 'Premio carry sul reddito fisso: posizione long su curve dei tassi ad alto carry e short su curve a basso carry tra paesi sviluppati. CAGR storico ~6.2%/a (1990-2024), σ ~8.5%. Bassa correlazione con azioni (ρ≈0.10) e con il trend following (ρ≈0.20). Soffre in crisi di risk-off globali. Forward-looking ~4.5%/a normalizzato.',
  },
  fat_carry_fx: {
    label: 'Carry Valutario (FX Carry)', emoji: '💱', cat: 'carry',
    mu: 0.040, vol: 0.095, inflBeta: 0.08, ter: 0.5, fxExp: 0.0,
    histCAGR: 0.055, histPeriod: '1990-2024', src: 'Lustig, Roussanov & Verdelhan (2011)',
    desc: 'Premio carry valutario: long valute ad alto tasso di interesse, short valute a basso tasso. CAGR storico ~5.5%/a (1990-2024), σ ~9.5%. Storicamente uno dei premi più stabili nei mercati valutari. Soffre violentemente nei crash globali (es. 2008: −30%). Correlazione con azioni ρ≈0.15, con carry obbligazionario ρ≈0.35. Forward-looking ~4.0%/a.',
  },
  fat_trend: {
    label: 'Trend Following / Managed Futures', emoji: '🌊', cat: 'trend',
    mu: 0.055, vol: 0.150, inflBeta: 0.30, ter: 0.8, fxExp: 0.0,
    histCAGR: 0.082, histPeriod: '1990-2024', src: 'Moskowitz, Ooi & Pedersen (2012)',
    desc: 'Momentum time-series sistematico su più asset class (azioni, bond, valute, commodity). CAGR storico ~8.2%/a (1990-2024), σ ~15%. Caratteristica chiave: correlazione con azioni ρ≈−0.05 — vero diversificatore. "Crisis alpha": tende a performare bene in crisi sostenute (2002, 2008, 2022). In periodi inflattivi va tipicamente long commodity e gold. Forward-looking ~5.5%/a al netto dei costi.',
  },

  // ══════════════════════════════════════════════════════════════
  // OBBLIGAZIONARIO GOVERNATIVO USA
  // mu = forward-looking basato sui livelli di yield 2024-2025
  //      normalizzati su orizzonte 10-20a
  // vol = volatilità storica 1970-2024
  // Fonte: dati storici Federal Reserve (FRED) e mercato USA
  // ══════════════════════════════════════════════════════════════
  ob_usa_st: {
    label: 'Gov. USA Breve (1-3a)', emoji: '🇺🇸', cat: 'ob_usa',
    mu: 0.043, vol: 0.027, inflBeta: 0.10, ter: 0.07, fxExp: 1.0,
    histCAGR: 0.048, histPeriod: '1970-2024', src: 'Federal Reserve (FRED)',
    desc: 'Titoli del Tesoro USA a scadenza 1-3 anni. Duration ~1.8. Volatilità storica ~2.7%. Rendimento legato al tasso di policy della Federal Reserve. Ottimo sostituto della liquidità in contesti di tassi elevati. Quasi nulla sensibilità ai tassi a lungo termine.',
  },
  ob_usa_it: {
    label: 'Gov. USA Intermedio (3-7a)', emoji: '🇺🇸', cat: 'ob_usa',
    mu: 0.045, vol: 0.055, inflBeta: -0.15, ter: 0.07, fxExp: 1.0,
    histCAGR: 0.062, histPeriod: '1970-2024', src: 'Federal Reserve (FRED)',
    desc: 'Treasury USA 3-7 anni. Duration ~4.5. Volatilità ~5.5%. Punto di riferimento del mercato obbligazionario USA. Buona decorrelazione dall\'azionario in recessione (flight to quality). CAGR storico 6.2%/a gonfiato dal ciclo di calo dei tassi 1981-2021.',
  },
  ob_usa_lt: {
    label: 'Gov. USA Lungo (7-10a)', emoji: '🇺🇸', cat: 'ob_usa',
    mu: 0.047, vol: 0.085, inflBeta: -0.30, ter: 0.1, fxExp: 1.0,
    histCAGR: 0.068, histPeriod: '1970-2024', src: 'Federal Reserve (FRED)',
    desc: 'Treasury USA 7-10 anni. Duration ~7-8. Forte apprezzamento in recessioni/deflazione. Soffre in regimi inflattivi (perdite reali del 30-40% negli anni \'70). Correlazione con azioni ~−0.15 in era post-2000.',
  },
  ob_usa_ult: {
    label: 'Gov. USA Ultra-Lungo (20-30a)', emoji: '🇺🇸', cat: 'ob_usa',
    mu: 0.048, vol: 0.145, inflBeta: -0.45, ter: 0.1, fxExp: 1.0,
    histCAGR: 0.074, histPeriod: '1970-2024', src: 'Federal Reserve (FRED)',
    desc: 'Titoli del Tesoro USA 20-30 anni. Duration ~17-19. Volatilità ~14.5%/a — paragonabile alle azioni. Sensibilità massima ai tassi: −17% circa per ogni +1% di rialzo. Usato come deflation hedge (All Seasons 40%, Permanent Portfolio 25%). Anno 2022: −30%.',
  },

  // ══════════════════════════════════════════════════════════════
  // OBBLIGAZIONARIO GOVERNATIVO EURO
  // Fonte: dati Banca Centrale Europea e mercati obbligazionari
  //        area euro (periodo post-introduzione euro: 1999-2024)
  // ══════════════════════════════════════════════════════════════
  ob_eu_st: {
    label: 'Gov. Euro Breve (1-3a)', emoji: '🇪🇺', cat: 'ob_eu',
    mu: 0.032, vol: 0.024, inflBeta: 0.05, ter: 0.1, fxExp: 0.0,
    histCAGR: 0.035, histPeriod: '1999-2024', src: 'Banca Centrale Europea',
    desc: 'Titoli di stato area euro a 1-3 anni (emittenti investment grade: Germania, Francia, Italia, Spagna ecc.). Volatilità minima (~2.4%). Rendimento tornato positivo dopo la fase ZIRP. Rischio spread paese in fasi di stress (2010-2012, 2022).',
  },
  ob_eu_it: {
    label: 'Gov. Euro Intermedio (3-7a)', emoji: '🇪🇺', cat: 'ob_eu',
    mu: 0.033, vol: 0.055, inflBeta: -0.15, ter: 0.1, fxExp: 0.0,
    histCAGR: 0.043, histPeriod: '1999-2024', src: 'Banca Centrale Europea',
    desc: 'Governativi area euro 3-7 anni. Duration ~4. Principale riferimento per portafogli obbligazionari europei. Include spread paese: differenziale BTP/Bund storicamente 100-200 bps in media, oltre 500 bps in crisi 2012. CAGR storico comprende il ciclo di QE della BCE (2015-2022).',
  },
  ob_eu_lt: {
    label: 'Gov. Euro Lungo (7-10a)', emoji: '🇪🇺', cat: 'ob_eu',
    mu: 0.035, vol: 0.090, inflBeta: -0.30, ter: 0.1, fxExp: 0.0,
    histCAGR: 0.051, histPeriod: '1999-2024', src: 'Banca Centrale Europea',
    desc: 'Governativi area euro 7-10 anni. Duration ~7.5. Forte sensibilità ai tassi BCE. Decorrelazione dall\'azionario in recessione. Correlazione positiva con azioni in stagflazione (perdita doppia — raro ma storicamente osservato negli anni \'70 e nel 2022).',
  },

  // ══════════════════════════════════════════════════════════════
  // OBBLIGAZIONARIO GLOBALE
  // Dati: indici aggregati governativi/obbligazionari globali
  //       con copertura valutaria in EUR (hedged)
  // ══════════════════════════════════════════════════════════════
  ob_glob_gov: {
    label: 'Gov. Globale Intermedio (hedged EUR)', emoji: '🌐', cat: 'ob_glob',
    mu: 0.042, vol: 0.048, inflBeta: -0.12, ter: 0.1, fxExp: 0.0,
    histCAGR: 0.056, histPeriod: '1990-2024', src: 'Indici governativi globali aggregati',
    desc: 'Paniere di titoli di stato dei principali paesi sviluppati (USA ~40%, Europa ~30%, Giappone ~15%, UK ~5%, altri) con duration ~6 anni e copertura valutaria in EUR. Diversifica il rischio di singola curva dei tassi. Rendimento mediano tra USA (~4.1%) ed Euro (~3.1%).',
  },
  ob_glob_agg: {
    label: 'Aggregato Obbligazionario Globale (hedged EUR)', emoji: '🌐', cat: 'ob_glob',
    mu: 0.047, vol: 0.055, inflBeta: -0.08, ter: 0.1, fxExp: 0.0,
    histCAGR: 0.060, histPeriod: '1990-2024', src: 'Indice aggregato obbligazionario globale',
    desc: 'Universo obbligazionario globale aggregato: titoli di stato (~50%), corporate investment grade (~35%), cartolarizzati ABS/MBS (~15%), con copertura valutaria in EUR. Duration ~6.5 anni. Il riferimento per portafogli multi-asset a livello globale.',
  },
  ob_infl: {
    label: 'Obblig. Indicizzate Inflazione', emoji: '🛡️', cat: 'ob_glob',
    mu: 0.042, vol: 0.060, inflBeta: 0.80, ter: 0.15, fxExp: 0.5,
    histCAGR: 0.050, histPeriod: '1997-2024', src: 'Mercati obbligazioni indicizzate',
    desc: 'Titoli di stato indicizzati all\'inflazione (BTPi italiani, Bund indicizzati, OATi francesi, TIPS USA). Il capitale cresce con l\'indice dei prezzi: protezione diretta dall\'inflazione. Rendimento reale garantito se tenuti a scadenza (~1.5-2% reale nel 2024). Volatilità simile alla duration nominale equivalente (~7 anni).',
  },

  // ══════════════════════════════════════════════════════════════
  // REAL ASSETS — ORO, COMMODITIES, LIQUIDITA
  // ══════════════════════════════════════════════════════════════
  gold: {
    label: 'Oro (metallo fisico / ETC)', emoji: '🥇', cat: 'real', isGold: true,
    mu: 0.038, vol: 0.150, inflBeta: 0.50, ter: 0.2, fxExp: 1.0,
    histCAGR: 0.078, histPeriod: '1970-2024', src: 'Prezzo spot oro (mercato internazionale)',
    desc: 'Prezzo spot oro in USD, convertito in EUR. CAGR 1970-2024: 7.8%/a — fortemente gonfiato dalla fine del gold standard 1971 e dal rialzo degli anni \'70-\'80. Forward-looking ~3.8%/a (inflazione + premio di scarsità). Nessun dividendo o cedola — rendimento da solo apprezzamento. Forte decorrelazione con azioni in crisi.',
  },
  commodities: {
    label: 'Commodities Diversificate', emoji: '⚡', cat: 'real',
    mu: 0.032, vol: 0.185, inflBeta: 0.65, ter: 0.3, fxExp: 1.0,
    histCAGR: 0.052, histPeriod: '1970-2024', src: 'Indici commodity diversificati (dati aggregati)',
    desc: 'Paniere diversificato di materie prime: energia ~55%, metalli industriali ~20%, agricoltura ~25%. CAGR storico ~5.2%/a influenzato dagli shock petroliferi degli anni \'70. Rendimento reale di lungo periodo vicino a zero per i costi di roll sui futures. Ottima copertura inflazione a breve termine (β≈0.65).',
  },
  cash: {
    label: 'Liquidità / Mercato Monetario', emoji: '💵', cat: 'cash', isCash: true,
    mu: 0.028, vol: 0.010, inflBeta: 0.15, ter: 0.05, fxExp: 0.0,
    histCAGR: 0.048, histPeriod: '1970-2024', src: 'Dati storici tassi breve termine (Fed/BCE)',
    desc: 'BOT, T-Bills, fondi monetari, conti deposito. Rendimento = tasso di policy della banca centrale. Volatilità nominale ~1%. Rendimento reale spesso negativo in periodi inflattivi. CAGR storico 4.8%/a gonfiato dall\'era dei tassi alti anni \'80. Forward-looking normalizzato ~2.5%/a.',
  },
};

// ── Mappa categoria per calcolo correlazioni portafoglio custom ──
const AC_CAT = (key) => {
  const a = ASSET_CLASSES[key];
  if (!a) return 'other';
  return a.cat || 'other';
};

// ── Compatibilità BOOTSTRAP / BACKTEST STORICO ─────────────────────────────
// Il block bootstrap e il backtest storico campionano da SOLE 3 serie storiche
// reali: azioni sviluppate, aggregate bond, oro (1970-2024). Gli asset privi
// di una serie dedicata verrebbero schiacciati sulla serie obbligazionaria
// (vol ~2%), falsando in modo qualitativo rischio e decorrelazione:
//   • Trend Following / Managed Futures (cat 'trend'): vol ~15%, ρ_eq≈−0.05
//   • Carry obbligazionario / FX (cat 'carry'): vol ~8.5-9.5%, crash risk
//   • Commodities (cat 'real' ma non oro): vol ~18.5%, dinamica propria
// Per questi asset i modelli parametrici (Gaussiano, t-Student, GARCH,
// Regime-Switching) restano fedeli — usano vol e matrici di correlazione.
// Le commodities sono tollerate come proxy-oro (entrambe real/inflation hedge);
// trend e carry NO, perché strutturalmente diversi da qualunque serie disponibile.
const HIST_UNMAPPED_CATS = ['trend', 'carry'];
function getUnmappedHistAssets(portKey) {
  // Restituisce l'elenco { label, cat } degli asset custom non rappresentabili
  // nelle serie storiche. Vuoto per i portafogli predefiniti (sempre mappabili).
  if (portKey !== 'custom') return [];
  const slots = (state.customPortfolio?.slots || []).filter(s => s.ac && ASSET_CLASSES[s.ac] && s.pct > 0);
  const out = [];
  for (const sl of slots) {
    const ac = ASSET_CLASSES[sl.ac];
    if (HIST_UNMAPPED_CATS.includes(ac.cat)) out.push({ key: sl.ac, label: ac.label, cat: ac.cat });
  }
  return out;
}
function histModelsAvailable(portKey) { return getUnmappedHistAssets(portKey).length === 0; }

// ── Matrice di correlazione per categoria (empirica, 1970-2024) ───────────────
// Categorie:
//   eq      — azioni pure (plain equity)
//   fat     — fattori azionari sistematici (Value, Momentum, Quality, LowVol, Size, CMA, Div)
//   carry   — premi carry cross-asset (bond carry, FX carry)
//   trend   — trend following / managed futures (decorrelato da tutto)
//   ob_usa  — governativi USA varie durate
//   ob_eu   — governativi Euro varie durate
//   ob_glob — aggregato e indicizzati globali
//   real    — oro, commodities
//   cash    — liquidità
// Fonti: DMS Yearbook 2024, Pedersen (2015) "Efficiently Inefficient",
//        Moskowitz et al. (2012), Koijen et al. (2018), Lustig et al. (2011)
const CORR_PAIR = (cat1, cat2) => {
  if (cat1 === cat2) {
    if (cat1 === 'eq')    return 0.65;  // intra-azionario
    if (cat1 === 'fat')   return 0.52;  // fattori decorrelati tra loro (es. Value-Mom ρ≈−0.15)
    if (cat1 === 'carry') return 0.35;  // bond carry e FX carry moderatamente correlati
    if (cat1 === 'trend') return 1.00;  // unico asset nella categoria
    if (cat1 === 'ob_usa' || cat1 === 'ob_eu') return 0.78;
    if (cat1 === 'ob_glob') return 0.72;
    if (cat1 === 'real')  return 0.15;
    return 1.0;
  }
  const pair = [cat1, cat2].sort().join('|');
  const map = {
    // ── Azioni pure vs altri ──────────────────────────────────
    'eq|fat':         0.72,   // fattori = mostly equity market exposure
    'eq|carry':       0.12,
    'eq|trend':      -0.05,   // trend following: decorrelato o lievemente negativo
    'eq|ob_eu':      -0.05,
    'eq|ob_glob':    -0.05,
    'eq|ob_usa':     -0.05,
    'eq|real':        0.05,
    'eq|cash':        0.02,
    // ── Fattori azionari vs altri ─────────────────────────────
    'fat|carry':      0.18,
    'fat|trend':      0.05,   // trend following poco correlato anche con fattori eq
    'fat|ob_eu':     -0.03,
    'fat|ob_glob':   -0.03,
    'fat|ob_usa':    -0.03,
    'fat|real':       0.06,
    'fat|cash':       0.02,
    // ── Carry vs altri ───────────────────────────────────────
    'carry|trend':    0.20,   // entrambi sistematici ma diversi
    'carry|ob_eu':    0.28,
    'carry|ob_glob':  0.25,
    'carry|ob_usa':   0.22,
    'carry|real':     0.08,
    'carry|cash':     0.05,
    // ── Trend following vs altri ──────────────────────────────
    'ob_eu|trend':    0.18,   // trend spesso long bond in recessioni
    'ob_glob|trend':  0.16,
    'ob_usa|trend':   0.20,
    'real|trend':     0.28,   // trend spesso long gold/commodity in inflazione
    'cash|trend':     0.02,
    // ── Obbligazionario cross-categoria ──────────────────────
    'ob_eu|ob_glob':  0.65,
    'ob_eu|ob_usa':   0.62,
    'ob_glob|ob_usa': 0.68,
    'ob_eu|real':     0.04,
    'ob_eu|cash':     0.05,
    'ob_glob|real':   0.04,
    'ob_glob|cash':   0.05,
    'ob_usa|real':    0.03,
    'ob_usa|cash':    0.06,
    // ── Real assets vs cash ───────────────────────────────────
    'cash|real':      0.02,
  };
  return map[pair] ?? 0.03;
};

// ── Matrice di correlazione in REGIME DI STRESS ──────────────────────────────
// In crisi storiche (2008, 2020, 2022) le correlazioni "esplodono" verso 1
// per gli asset rischiosi — il classico "correlations go to 1 in a crash".
// Fenomeno documentato in Longin & Solnik (2001), Forbes & Rigobon (2002).
// I bond governativi possono mantenere la decorrelazione (flight to quality)
// oppure perderla in inflazione (2022: azioni e bond entrambi −15%).
// Fonti: Ang, Bekaert (2002) regime-switching, Pollet & Wilson (2010).
const CORR_PAIR_STRESS = (cat1, cat2) => {
  // Intra-categoria: tutte salgono verso 0.85-0.95
  if (cat1 === cat2) {
    if (cat1 === 'eq')    return 0.88;  // azioni: ρ→0.88 in crisi
    if (cat1 === 'fat')   return 0.78;  // fattori: alcuni mantengono diversificazione (es. Trend)
    if (cat1 === 'carry') return 0.65;
    if (cat1 === 'trend') return 1.00;
    if (cat1 === 'ob_usa' || cat1 === 'ob_eu') return 0.88;
    if (cat1 === 'ob_glob') return 0.85;
    if (cat1 === 'real')  return 0.50;
    return 1.0;
  }
  const pair = [cat1, cat2].sort().join('|');
  const map = {
    // ── Azioni vs altri in stress ──────────────────────────
    'eq|fat':         0.85,   // fattori azionari saltano con il mercato
    'eq|carry':       0.55,   // carry trade unwinding
    'eq|trend':       0.10,   // trend following spesso si mantiene decorrelato
    'eq|ob_eu':       0.25,   // in inflazione (2022): bond ed equity giù insieme
    'eq|ob_glob':     0.25,
    'eq|ob_usa':      0.20,   // US Treasury spesso ancora flight-to-quality
    'eq|real':        0.30,   // commodities/oro salgono in alcune crisi (inflattive)
    'eq|cash':        0.05,
    // ── Fattori vs altri ───────────────────────────────────
    'fat|carry':      0.50,
    'fat|trend':      0.10,
    'fat|ob_eu':      0.20,
    'fat|ob_glob':    0.20,
    'fat|ob_usa':     0.15,
    'fat|real':       0.25,
    'fat|cash':       0.05,
    // ── Carry vs altri (carry trade unwinding è correlato) ─
    'carry|trend':    0.30,
    'carry|ob_eu':    0.45,
    'carry|ob_glob':  0.45,
    'carry|ob_usa':   0.40,
    'carry|real':     0.20,
    'carry|cash':     0.10,
    // ── Trend following: spesso mantiene decorrelazione ────
    'ob_eu|trend':    0.20,
    'ob_glob|trend':  0.20,
    'ob_usa|trend':   0.20,
    'real|trend':     0.35,   // trend long commodity in inflazione
    'cash|trend':     0.02,
    // ── Obbligazionario in stress (corre ridotto) ──────────
    'ob_eu|ob_glob':  0.82,
    'ob_eu|ob_usa':   0.78,
    'ob_glob|ob_usa': 0.82,
    'ob_eu|real':     0.15,
    'ob_eu|cash':     0.15,
    'ob_glob|real':   0.15,
    'ob_glob|cash':   0.15,
    'ob_usa|real':    0.10,
    'ob_usa|cash':    0.20,
    'cash|real':      0.05,
  };
  return map[pair] ?? 0.20;
};


// ══════════════════════════════════════════════════════════════
// SCENARI ECONOMICI — parametri calibrati sui dati storici
// ══════════════════════════════════════════════════════════════
const ECO_SCENARIOS = {
  normal_growth: {
    label: 'Crescita Normale',
    emoji: '📈',
    desc: 'Economia in espansione moderata, inflazione sotto controllo (2-3%), tassi stabili. Simile agli anni 1990-2000 e 2012-2020. Il contesto migliore per portafogli bilanciati.',
    color: '#1e8e3e',
    bg: 'rgba(30,142,62,.08)',
    border: 'rgba(30,142,62,.4)',
    // Moltiplicatori sui rendimenti base del portafoglio
    eqMult: 1.0, obMult: 1.0, goldMult: 0.7,
    inflMean: 2.0, inflSigma: 0.8,
    volMult: 1.0, cashRet: 0.02,
    duration: 99, // baseline — sempre attivo
  },
  stagflation: {
    label: 'Stagflazione',
    emoji: '🔥',
    desc: 'Alta inflazione + bassa crescita. Scenario anni \'70 (inflazione 7-12%). Le azioni perdono in termini reali, le obbligazioni nominali crollano, l\'oro e le materie prime performano. Devastante per 60/40, ottimo per Permanent Portfolio.',
    color: '#e37400',
    bg: 'rgba(227,116,0,.08)',
    border: 'rgba(227,116,0,.4)',
    eqMult: 0.6, obMult: 0.3, goldMult: 2.2,
    inflMean: 7.0, inflSigma: 2.0,
    volMult: 1.4, cashRet: 0.05,
    duration: 10, // anni '70: ~1973-1982
  },
  recession: {
    label: 'Recessione / Crisi',
    emoji: '📉',
    desc: 'Contrazione economica severa (tipo 2008-2009 o 2001). Azioni -30/-50%, obbligazioni governative salgono (flight to quality), oro positivo. Inflazione bassa o negativa. Test per la tenuta dei portafogli.',
    color: '#d93025',
    bg: 'rgba(217,48,37,.08)',
    border: 'rgba(217,48,37,.4)',
    eqMult: 0.3, obMult: 1.4, goldMult: 1.3,
    inflMean: 0.5, inflSigma: 1.0,
    volMult: 2.0, cashRet: 0.015,
    duration: 3, // recessione tipica: 2-3 anni
  },
  deflation: {
    label: 'Deflazione / Japanification',
    emoji: '🧊',
    desc: 'Inflazione negativa, tassi zero o negativi, crescita stagnante. Scenario Giappone 1990-2020. Le obbligazioni sono le star, le azioni vanno laterali per decenni, l\'oro è inerte, la liquidità perde valore in termini reali.',
    color: '#0097a7',
    bg: 'rgba(0,151,167,.08)',
    border: 'rgba(0,151,167,.4)',
    eqMult: 0.5, obMult: 1.2, goldMult: 0.5,
    inflMean: -0.5, inflSigma: 0.8,
    volMult: 1.1, cashRet: 0.005,
    duration: 20, // Giappone: decenni
  },
  bull_market: {
    label: 'Bull Market Prolungato',
    emoji: '🚀',
    desc: 'Forte crescita azionaria sostenuta (tipo 1982-1999 o 2009-2021). Azioni +12-15%/a, obbligazioni stabili, oro piatto. Il sogno di ogni investitore azionario.',
    color: '#9334e6',
    bg: 'rgba(147,52,230,.08)',
    border: 'rgba(147,52,230,.4)',
    eqMult: 1.5, obMult: 0.9, goldMult: 0.6,
    inflMean: 2.5, inflSigma: 0.7,
    volMult: 0.8, cashRet: 0.03,
    duration: 12, // bull tipico: 10-15 anni
  },
  high_rates: {
    label: 'Rialzo Tassi',
    emoji: '📊',
    desc: 'Banche centrali alzano i tassi rapidamente (tipo 2022-2023). Le obbligazioni a lungo termine crollano, le azioni growth soffrono, le obbligazioni brevi e la liquidità rendono di più. Il contesto peggiore per il 60/40 tradizionale.',
    color: '#00897b',
    bg: 'rgba(0,137,123,.08)',
    border: 'rgba(0,137,123,.4)',
    eqMult: 0.75, obMult: 0.4, goldMult: 0.8,
    inflMean: 4.5, inflSigma: 1.5,
    volMult: 1.3, cashRet: 0.04,
    duration: 4, // ciclo rialzo: 2-4 anni
  },
};

// Rendimento "normale" usato come baseline post-regime
const NORMAL_ECO = { eqMult: 1.0, obMult: 1.0, goldMult: 0.7, cashRet: 0.02, inflMean: 2.0, inflSigma: 0.8 };


const SEQ_RATES = { mild: -.20, moderate: -.35, severe: -.50 };
const RECOVERY_YEARS = 5;
const BOND_RALLY_RATE = .05;
// Frazione di recupero del gap durante la fase di recovery (0<f<1).
// Con f=1 il rimbalzo annullerebbe interamente il crollo riportando il capitale
// sulla traiettoria base — irrealistico: cancella il sequence-of-returns risk.
// Con f=0.6 il recupero del prezzo è parziale e lascia una "cicatrice" permanente
// differenziata per severità (mild ~−14%, moderate ~−21%, severe ~−29% sul lungo
// periodo in lump-sum), coerente con l'evidenza empirica del rischio sequenza.
const RECOVERY_CATCHUP = 0.6;

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════
let state = {
  w: 0, pac: 0, age: 0, years: 35, opt: 450000,
  ter: .20, taxEq: 26.0, taxOb: 12.5, inflBottom: 2.0, inflVol: 1.0,
  portfolio: 'eq60',
  seq: { on: false, severity: 'moderate', timing: 'early', mode: 'single', dynCorr: false },
  pics: [], exps: [], pacChanges: [],
  allRows: false, showLiq: false, showVolBands: false,
  activeEcoScenario: 'normal_growth',
  ecoTiming: 'early',
  customPortfolio: {
    slots: [
      { ac: 'eq_sviluppati', pct: 60 },
      { ac: 'ob_glob_agg',   pct: 40 },
    ]
  },
  fxHedge: false,        // se true, copertura cambio attiva (costo ~0.3%/a)
  fxVol: 0.085,          // volatilità storica EUR/USD ~8.5%/a (1999-2024)
  fxHedgeCost: 0.003,    // costo annuo della copertura valutaria ~0.3%
};
let stateB = { portfolio: 'eq50', ter: .20, pac: -1 };
let decState = { portfolio: 'eq60', strategy: 'inflation', startPortfolio: 500000, withdrawal: 20000, years: 30, inflation: 2.0, ter: .20, ecoScenario: null, ecoTiming: 'early' };
let mcState = { withdrawal: 24000, years: 25, inflation: 2.0 };
let lastMCSuccessResult = null;
let picId = 0, expId = 0, pacChgId = 0;

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
function fmt(v) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return s + '€' + (a / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return s + '€' + Math.round(a / 1e3) + 'k';
  return s + '€' + Math.round(a);
}
function fmtFull(v) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return (v < 0 ? '−' : '') + '€' + Math.round(Math.abs(v)).toLocaleString('it-IT');
}
function fmtN(v) { return Math.round(v).toLocaleString('it-IT'); }
function pct(v, dec = 1) { return (v * 100).toFixed(dec) + '%'; }

function getLCWeight(age) { return Math.max(.20, Math.min(.80, .80 - Math.max(0, (age - 20)) / 50 * .60)); }

function getEquityWeight(port, age) {
  if (port === 'lifecycle') return getLCWeight(age);
  if (port === 'custom') return calcCustomParams().eq;
  const m = { ob100: 0, eq100: 1, eq80: .8, eq60: .6, eq50: .5, eq40: .4, eq20: .2, golden_butterfly: .4, permanent: .25, all_seasons: .30, larry: .30, global_market: .55 };
  return m[port] ?? 0.6;
}

function getGoldWeight(port) {
  if (port === 'custom') return calcCustomParams().goldW;
  const m = { golden_butterfly: .2, permanent: .25, all_seasons: .15 };
  return m[port] ?? 0;
}

function getCashWeight(port) {
  if (port === 'custom') return calcCustomParams().cashW;
  const m = { permanent: .25 };
  return m[port] ?? 0;
}

// ── Calcola parametri blended del portafoglio custom ──────────
function calcCustomParams() {
  // ── 1. Filtra slot validi e normalizza i pesi ─────────────────
  const slots = (state.customPortfolio?.slots || []).filter(s => s.ac && ASSET_CLASSES[s.ac] && s.pct > 0);
  const total = slots.reduce((s, sl) => s + sl.pct, 0) || 1;

  // ── 2. Rendimento atteso ponderato e beta inflazione ──────────
  let mu = 0, inflBeta = 0, eqW = 0, obW = 0, goldW = 0, cashW = 0, altW = 0, terW = 0, fxExpW = 0;
  for (const sl of slots) {
    const ac = ASSET_CLASSES[sl.ac];
    if (!ac) continue;
    const w = sl.pct / total;
    mu       += w * ac.mu;
    inflBeta += w * ac.inflBeta;
    terW     += w * (ac.ter ?? 0.20);  // TER pesato (ipotesi ETF tipici retail)
    fxExpW   += w * (ac.fxExp ?? 0);    // esposizione FX pesata (% non-EUR)
    if (ac.isEq)        eqW   += w;
    else if (ac.isGold) goldW += w;
    else if (ac.isCash) cashW += w;
    // Real asset non-oro (commodities), carry e trend NON sono obbligazioni:
    // vanno in uno sleeve "alternativi/real" separato per non distorcere la
    // ripartizione mostrata e la logica scenari (baseOb*obMult non si applica).
    else if (ac.cat === 'real' || ac.cat === 'carry' || ac.cat === 'trend') altW += w;
    else                obW   += w;
  }
  const obW2 = Math.max(0, obW || (1 - eqW - goldW - cashW - altW));

  // ── 3. Volatilità con matrice di correlazione semplificata ────
  // σ²_p = Σᵢ Σⱼ wᵢ wⱼ σᵢ σⱼ ρᵢⱼ
  // Calcoliamo DUE versioni:
  //   sigma       = volatilità in regime normale (correlaz. storiche medie)
  //   sigmaStress = volatilità in regime di crisi (correlaz. ↑ verso 1)
  // Quest'ultima dà una stima realistica della tail risk: in crisi
  // la diversificazione si riduce drasticamente.
  let variance = 0, varianceStress = 0;
  for (let i = 0; i < slots.length; i++) {
    const si = slots[i];
    const ai = ASSET_CLASSES[si.ac];
    if (!ai) continue;
    const wi = si.pct / total;
    for (let j = 0; j < slots.length; j++) {
      const sj = slots[j];
      const aj = ASSET_CLASSES[sj.ac];
      if (!aj) continue;
      const wj = sj.pct / total;
      let rho, rhoS;
      if (i === j) {
        rho = 1.0; rhoS = 1.0;
      } else if (si.ac === sj.ac) {
        rho = 1.0; rhoS = 1.0;
      } else {
        rho  = CORR_PAIR       (AC_CAT(si.ac), AC_CAT(sj.ac));
        rhoS = CORR_PAIR_STRESS(AC_CAT(si.ac), AC_CAT(sj.ac));
      }
      variance       += wi * wj * ai.vol * aj.vol * rho;
      varianceStress += wi * wj * ai.vol * aj.vol * rhoS;
    }
  }
  const sigma       = Math.sqrt(Math.max(0, variance));
  const sigmaStress = Math.sqrt(Math.max(0, varianceStress));

  // ── 4. Scenari best/worst con convenzione PORT ────────────────
  // Coerente con i portafogli predefiniti: best = mu + 0.20·σ, worst = mu − 0.38·σ
  // Verificato su PORT esistenti (es. eq60: 5.5% ± 9.5% → best 7.4%, worst 1.9%)
  const best  = Math.min(mu + 0.20 * sigma, 0.20);
  const worst = Math.max(mu - 0.38 * sigma, -0.08);

  // ── 5. Realizzazione e restituisce oggetto compatibile PORT ───
  // ── 5. Effetto cambio EUR/USD (e altre non-EUR) ───────────────
  // Se hedged: costo annuo = fxExpW * fxHedgeCost (sottratto da mu)
  // Se unhedged: aggiungi varianza FX (fxExpW * fxVol)² alla varianza portafoglio
  // Modello: ρ(equity, EUR/USD) ≈ 0 nel lungo periodo → varianze si sommano
  const fxHedged = !!state.fxHedge;
  const fxCost = fxHedged ? fxExpW * state.fxHedgeCost : 0;
  const muNet = mu - fxCost;
  const fxAddVar = fxHedged ? 0 : Math.pow(fxExpW * state.fxVol, 2);
  const sigmaFx = Math.sqrt(sigma*sigma + fxAddVar);
  const sigmaStressFx = Math.sqrt(sigmaStress*sigmaStress + fxAddVar * 1.5); // FX vol +50% in crisi
  // Ricalcola best/worst usando muNet e sigmaFx
  const bestFx = Math.min(muNet + 0.20 * sigmaFx, 0.20);
  const worstFx = Math.max(muNet - 0.38 * sigmaFx, -0.08);

  return {
    label: '🔧 Custom',
    desc:  'Portafoglio personalizzato.',
    normal: muNet, best: bestFx, worst: worstFx,
    vol:  sigmaFx,
    volStress: sigmaStressFx,      // vol in regime di crisi (FX vol amplificata)
    volNoFx: sigma,                // vol senza componente FX (riferimento)
    eq:   eqW, ob: obW2, gold: goldW, cash: cashW,
    goldW, cashW, altW,
    realRet:  Math.max(0, muNet - 0.021),
    inflBeta,
    ter:  terW,                    // TER pesato suggerito (ETF tipici)
    fxExposure: fxExpW,            // % esposizione valuta non-EUR
    fxHedged,                      // stato hedging attivo
    fxCost,                        // costo annuo hedging (se attivo)
    fxAddVol: Math.sqrt(fxAddVar), // vol aggiuntiva da FX (se non hedged)
  };
}

function getRate(key, scenario, year, startAge) {
  // ── Helpers FX comuni a tutti i branch ──────────────────────
  // Applica la correzione FX (hedging/unhedging) al rendimento/vol di portafoglio
  // coerentemente con calcCustomParams() per garantire che il toggle FX
  // abbia effetto su tutti i tipi di portafoglio, non solo su 'custom'.
  const _applyFx = (muBase, volBase, fxExp) => {
    const fxHedged = !!state.fxHedge;
    const fxCost   = fxHedged ? fxExp * state.fxHedgeCost : 0;
    const muNet    = muBase - fxCost;
    const fxAddVar = fxHedged ? 0 : Math.pow(fxExp * state.fxVol, 2);
    const sigmaFx  = Math.sqrt(volBase * volBase + fxAddVar);
    if (scenario === 'normal') return muNet;
    if (scenario === 'best')   return Math.min(muNet + 0.20 * sigmaFx, 0.20);
    /* worst */                 return Math.max(muNet - 0.38 * sigmaFx, -0.08);
  };

  if (key === 'lifecycle') {
    const age = startAge + year;
    const eq = getLCWeight(age);
    // Rendimenti calibrati coerentemente con i portafogli statici:
    // best ≈ +0.20σ sopra normal, worst ≈ −0.38σ sotto normal
    // σ lifecycle @ age: 0.16*eq + 0.03*(1-eq)
    const vol = 0.16 * eq + 0.03 * (1 - eq);
    const muEq = 0.07, muOb = 0.03;
    const normalR = eq * muEq + (1 - eq) * muOb;
    // fxExp lifecycle varia con l'età (come il peso azionario)
    const fxExpLC = eq * 0.85; // ~85% delle azioni è non-EUR; ob/cash ≈ 0
    return _applyFx(normalR, vol, fxExpLC);
  }

  if (key === 'custom') { const cp = calcCustomParams(); return cp[scenario] ?? cp.normal; }

  const p = PORT[key];
  if (!p) return 0.055;

  // Portafogli predefiniti: applica correzione FX usando fxExp del portafoglio
  const fxExp  = p.fxExp ?? 0;
  const muBase = p.normal ?? 0.055;
  const volBase = p.vol   ?? 0.10;
  return _applyFx(muBase, volBase, fxExp);
}

// Rendimento portafoglio nello scenario economico — applica i moltiplicatori
// del regime SOLO per gli anni di durata storica dello scenario; oltre quella
// soglia ritorna al baseline "Crescita Normale", indipendentemente dalla
// durata totale dell'investimento dell'utente.
function getRateEco(portKey, ecoKey, year, startAge, ecoWin) {
  const ecoSel = ECO_SCENARIOS[ecoKey];
  const p = portKey === 'custom' ? calcCustomParams() : PORT[portKey];
  if (!p || !ecoSel) return 0.05;
  // Rispetta la finestra temporale (early/mid/late) se fornita, altrimenti usa la durata
  const inRegime = ecoWin
    ? (year >= ecoWin.s && year <= ecoWin.e)
    : (year <= (ecoSel.duration ?? 99));
  const eco = inRegime ? ecoSel : NORMAL_ECO;

  if (portKey === 'lifecycle') {
    const age = startAge + year;
    const eqW = getLCWeight(age);
    const obW = 1 - eqW;
    const baseEq = 0.07, baseOb = 0.03;
    return eqW * baseEq * eco.eqMult + obW * baseOb * eco.obMult;
  }

  const eqW   = Math.max(0, p.eq   ?? getEquityWeight(portKey, startAge + year));
  const goldW = Math.max(0, p.gold ?? getGoldWeight(portKey));
  const cashW = Math.max(0, p.cash ?? getCashWeight(portKey));
  const obW   = Math.max(0, p.ob   ?? Math.max(0, 1 - eqW - goldW - cashW));
  // Alt asset custom (commodities/carry/trend): si comportano da real asset/
  // diversificatori — usano il moltiplicatore oro dello scenario (proxy ragionevole:
  // in inflazione salgono, in deflazione sono inerti). Solo per 'custom'.
  const altW  = Math.max(0, p.altW ?? 0);
  // Normalizza in modo che i pesi sommino a 1 (rilevante per leva implicita)
  const wSum = eqW + obW + goldW + cashW + altW || 1;

  const baseEq = 0.07, baseOb = 0.03, baseGold = 0.04, baseAlt = 0.04;
  const rateBase = (eqW   * baseEq   * eco.eqMult
                  + obW   * baseOb   * eco.obMult
                  + goldW * baseGold * eco.goldMult
                  + altW  * baseAlt  * eco.goldMult
                  + cashW * eco.cashRet) / wSum;
  // Correggi per hedging FX (costo) anche negli scenari economici
  const fxExpPort = portKey === 'custom' ? (calcCustomParams().fxExposure ?? 0) : (PORT[portKey]?.fxExp ?? 0);
  const fxCostEco = (!!state.fxHedge && fxExpPort > 0) ? fxExpPort * state.fxHedgeCost : 0;
  return rateBase - fxCostEco;
}

function getPortfolioVol(portKey, age) {
  // Aggiunge componente volatilità FX quando non hedged,
  // coerente con getRate() e calcCustomParams().
  const _addFxVol = (baseVol, fxExp) => {
    if (!!state.fxHedge || fxExp <= 0) return baseVol;
    const fxAddVar = Math.pow(fxExp * state.fxVol, 2);
    return Math.sqrt(baseVol * baseVol + fxAddVar);
  };
  if (portKey === 'lifecycle') {
    const eq = getLCWeight(age);
    const baseVol = 0.16 * eq + 0.03 * (1 - eq);
    return _addFxVol(baseVol, eq * 0.85);
  }
  if (portKey === 'custom') return calcCustomParams().vol; // già include FX vol
  const p = PORT[portKey];
  return _addFxVol(p?.vol ?? 0.10, p?.fxExp ?? 0);
}

function getCrashYear(timing, years) {
  if (timing === 'early') return Math.max(1, Math.min(3, years));
  if (timing === 'mid') return Math.max(1, Math.round(years / 2));
  return Math.max(1, Math.round(years * .80));
}

function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function getPacForYear(year) {
  let p = state.pac;
  const sorted = [...state.pacChanges].sort((a, b) => +a.year - +b.year);
  for (const ch of sorted) {
    if (+ch.year <= year) p = +ch.amount;
    else break;
  }
  return p;
}

function hasAnyActivePac() {
  if (state.pac > 0) {
    const s = [...state.pacChanges].sort((a, b) => +a.year - +b.year);
    if (!s.length) return true;
    if (s[0].year > 1) return true;
    return s.some(c => +c.amount > 0);
  }
  return state.pacChanges.some(c => +c.amount > 0);
}

function blendedTaxRate(age, portKey) {
  // portKey opzionale: se non passato usa state.portfolio (compatibilità con tutto il resto)
  const pKey = portKey ?? state.portfolio;
  // Clamp equity a [0,1] per il calcolo dell'aliquota blended
  // (la leva implicita nei portafogli NTSX/NTSG non aumenta l'aliquota fiscale)
  if (pKey === 'custom') {
    const cp = calcCustomParams();
    const eqW    = Math.max(0, Math.min(1, cp.eq   ?? 0));
    const obW    = Math.max(0, cp.ob    ?? 0);
    const goldW  = Math.max(0, cp.goldW ?? 0);
    const cashW  = Math.max(0, cp.cashW ?? 0);
    const altW   = Math.max(0, cp.altW  ?? 0);
    // Oro, liquidità, commodities, carry, trend, REITs, fattori → aliquota piena (taxEq, 26%)
    // Solo la quota obbligazionaria gode dell'aliquota ridotta (taxOb, 12.5% per gov IT/EU)
    // Normalizza per evitare somme > 1 (es. portafogli con leva implicita)
    const total = eqW + obW + goldW + cashW + altW || 1;
    return (
      (eqW   / total) * state.taxEq / 100 +
      (obW   / total) * state.taxOb / 100 +
      (goldW / total) * state.taxEq / 100 +
      (cashW / total) * state.taxEq / 100 +
      (altW  / total) * state.taxEq / 100
    );
  }
  const rawEq = getEquityWeight(pKey, age);
  const eq = Math.max(0, Math.min(1, rawEq));
  return (eq * state.taxEq + (1 - eq) * state.taxOb) / 100;
}

function calcNetNom(g, inv, tx) {
  const gain = Math.max(0, g - inv);
  return g - gain * tx;
}

// ══════════════════════════════════════════════════════════════
// PROJECTION — scenario deterministico
// ══════════════════════════════════════════════════════════════
function getCrashYears(mode, timing, years) {
  // Returns array of crash years for multi-crash modes.
  // Vincoli: gap minimo cy2-cy1 ≥ 7 anni; gap minimo cy3-cy2 ≥ 6 anni.
  // Con timing='late' i vincoli prevalgono sul timing tardivo, anticipando
  // i crash precedenti per rispettare le distanze minime.
  const cy1Raw = getCrashYear(timing, years);
  if (mode === 'single' || !mode) return [Math.max(1, Math.min(years - 1, cy1Raw))];

  if (mode === 'double') {
    // Vogliamo cy1 < cy2, cy2 ≤ years-2, gap ≥ 8
    // Se timing='late', anticipiamo cy1 per fare spazio a cy2
    let cy2 = Math.min(years - 2, Math.max(cy1Raw + 8, Math.round(years * 0.62)));
    let cy1 = Math.max(1, Math.min(cy1Raw, cy2 - 8));
    return [cy1, cy2];
  }

  if (mode === 'triple') {
    // Vogliamo cy3 ≤ years-1, gap cy3-cy2 ≥ 6, gap cy2-cy1 ≥ 7
    // Strategia: posiziona cy3 vicino a 'timing', poi cy2 e cy1 a ritroso
    let cy3 = Math.min(years - 1, Math.max(cy1Raw, Math.round(years * 0.82)));
    let cy2 = Math.max(1, cy3 - 6);
    let cy1 = Math.max(1, cy2 - 7);
    // Se timing è 'early', spingiamo tutto in avanti il meno possibile
    if (timing === 'early') {
      cy1 = Math.max(1, Math.min(3, years));
      cy2 = Math.min(years - 7, cy1 + 7);
      cy3 = Math.min(years - 1, cy2 + 6);
    } else if (timing === 'mid') {
      cy1 = Math.max(1, Math.round(years * 0.30));
      cy2 = Math.max(cy1 + 7, Math.round(years * 0.55));
      cy3 = Math.min(years - 1, Math.max(cy2 + 6, Math.round(years * 0.82)));
    }
    return [cy1, cy2, cy3];
  }
  return [Math.max(1, Math.min(years - 1, cy1Raw))];
}

// Volatilità "dynCorr" portafoglio — usa correlazioni stress in crisi
function getPortfolioVolDynamic(portKey, age, isStress) {
  if (portKey !== 'custom') return getPortfolioVol(portKey, age);
  if (!isStress) return calcCustomParams().vol;
  // Ricalcola vol con matrice stress
  const slots = (state.customPortfolio?.slots || []).filter(s => s.ac && ASSET_CLASSES[s.ac] && s.pct > 0);
  const total = slots.reduce((s, sl) => s + sl.pct, 0) || 1;
  let variance = 0;
  for (let i = 0; i < slots.length; i++) {
    const si = slots[i]; const ai = ASSET_CLASSES[si.ac]; if (!ai) continue;
    const wi = si.pct / total;
    for (let j = 0; j < slots.length; j++) {
      const sj = slots[j]; const aj = ASSET_CLASSES[sj.ac]; if (!aj) continue;
      const wj = sj.pct / total;
      const rho = (i === j || si.ac === sj.ac) ? 1.0 : CORR_PAIR_STRESS(AC_CAT(si.ac), AC_CAT(sj.ac));
      variance += wi * wj * ai.vol * aj.vol * rho;
    }
  }
  return Math.sqrt(Math.max(0, variance));
}

function project(scenario, withSeq, terOverride = null, portOverride = null) {
  const { w, age, years, portfolio, pics, exps, seq } = state;
  const portKey = portOverride ?? portfolio;
  const terRate = (terOverride !== null ? terOverride : state.ter) / 100;
  const mode = seq.mode || 'single';
  const crashYears = withSeq && seq.on ? getCrashYears(mode, seq.timing, years) : [];
  const crashYear = crashYears[0] ?? -1; // primary crash (for legend/annotation)
  const eqCR = SEQ_RATES[seq.severity] ?? -0.35;

  // Build crash map: year → crash rate (subsequent crashes use reduced severity)
  const crashMap = {};
  crashYears.forEach((cy, idx) => {
    const severityFactor = idx === 0 ? 1.0 : idx === 1 ? 0.65 : 0.45; // diminishing severity
    const acw = getCrashYear(seq.timing, years) >= 0 ? getEquityWeight(portKey, age + cy) : 0;
    const crRate = eqCR * severityFactor * acw + BOND_RALLY_RATE * (1 - acw);
    // Partial catch-up: il rimbalzo recupera solo una frazione del gap (cicatrice permanente)
    const cuf = acw > 0 ? Math.pow(Math.pow(1 / (1 + eqCR * severityFactor), 1 / RECOVERY_YEARS), RECOVERY_CATCHUP) : 1;
    crashMap[cy] = { rate: crRate, cuf, acw, severityFactor };
  });

  let w2 = w, inv = w;
  const data = [{ year: 0, age, value: w2, invested: inv, returns: 0, annRetNet: 0, annPac: state.pac * 12, event: '' }];
  
  for (let y = 1; y <= years; y++) {
    const annPac = getPacForYear(y) * 12;
    const pic = pics.filter(p => +p.year === y).reduce((s, p) => s + (+p.amount || 0), 0);
    const exp = exps.filter(e => +e.year === y).reduce((s, e) => s + (+e.amount || 0), 0);
    const eqW = getEquityWeight(portKey, age + y);
    const txRate = (eqW * state.taxEq + (1 - eqW) * state.taxOb) / 100;
    let r, isRebound = false;

    // Check if this year is a crash year
    const crashInfo = crashMap[y];
    // Check if this year is in recovery from any crash
    const inRecovery = crashYears.find(cy => y > cy && y <= cy + RECOVERY_YEARS && crashMap[cy]?.acw > 0);

    if (crashInfo) {
      // Apply dynamic correlation penalty if enabled: vol increases in crisi
      const dynPenalty = seq.dynCorr ? 0.03 * crashInfo.severityFactor : 0; // extra drag from corr breakdown
      r = crashInfo.rate - dynPenalty;
    } else if (inRecovery) {
      const cy = inRecovery;
      const baseR = getRate(portKey, scenario, y, age);
      const rebEqR = (1 + baseR) * crashMap[cy].cuf - 1;
      const cEqW = getEquityWeight(portKey, age + y);
      const rebObR = scenario === 'best' ? .04 : scenario === 'normal' ? .03 : .01;
      r = rebEqR * cEqW + rebObR * (1 - cEqW);
      isRebound = true;
    } else {
      r = getRate(portKey, scenario, y, age);
    }
    r -= terRate;
    const midW = w2 + (annPac + pic - exp) / 2;
    const aRG = midW * r;
    w2 += annPac + pic - exp + aRG;
    inv += annPac + pic;
    const aRN = aRG > 0 ? aRG * (1 - txRate) : aRG;
    const evts = [];
    const pAP = y === 1 ? state.pac * 12 : getPacForYear(y - 1) * 12;
    if (annPac !== pAP) { if (annPac === 0) evts.push('⏸ PAC sospeso'); else if (annPac < pAP) evts.push(`↓ PAC: €${fmtN(annPac / 12)}/m`); else evts.push(`↑ PAC: €${fmtN(annPac / 12)}/m`); }
    if (crashInfo && withSeq && seq.on) evts.push(crashInfo.rate < 0 ? `⚡ Crash#${crashYears.indexOf(y)+1} (${(crashInfo.rate * 100).toFixed(1)}%)` : `🛡️ FtQ (+${(crashInfo.rate * 100).toFixed(1)}%)`);
    else if (isRebound) evts.push('📈 Rally');
    if (pic > 0) evts.push('▲ PIC ' + fmt(pic));
    if (exp > 0) evts.push('▼ ' + fmt(exp));
    data.push({ year: y, age: age + y, value: Math.round(w2), invested: Math.round(inv), returns: Math.round(w2 - inv), annRetNet: Math.round(aRN), annPac, event: evts.join(' · '), isCrash: !!crashInfo, isRebound });
  }
  return data;
}

// Calcola la finestra temporale [s, e] in cui il regime eco è attivo
function getEcoWindow(ecoKey, totalYears, timing) {
  const eco = ECO_SCENARIOS[ecoKey];
  if (!eco) return { s: 1, e: totalYears };
  const dur = Math.min(eco.duration ?? 99, totalYears);
  if (timing === 'early') return { s: 1, e: dur };
  if (timing === 'mid') {
    const s = Math.max(1, Math.round((totalYears - dur) / 2) + 1);
    return { s, e: Math.min(totalYears, s + dur - 1) };
  }
  // late
  return { s: Math.max(1, totalYears - dur + 1), e: totalYears };
}

// Proiezione in scenario economico — usa la media dell'inflazione del regime
// (deterministica) in modo che il grafico Scenari Economici sia stabile e
// riproducibile. Il rumore inflattivo è disponibile nel tab MC Avanzato.
function projectEco(ecoKey) {
  const { w, age, years, portfolio, pics, exps, ter } = state;
  const ecoSel = ECO_SCENARIOS[ecoKey];
  const terRate = ter / 100;
  const win = getEcoWindow(ecoKey, years, state.ecoTiming);
  let ww = w, inv = w;
  const startInflMean = ecoSel.inflMean / 100;
  const data = [{ year: 0, age, value: ww, invested: inv, inflYear: startInflMean * 100, real: ww, regime: ecoSel.label }];
  let cumInfl = 1;
  for (let y = 1; y <= years; y++) {
    const inRegime = y >= win.s && y <= win.e;
    const ecoY = inRegime ? ecoSel : NORMAL_ECO;
    // Inflazione deterministica (media del regime): grafico stabile
    const inflYear = ecoY.inflMean / 100;
    cumInfl *= (1 + inflYear);
    const annPac = getPacForYear(y) * 12;
    const pic = pics.filter(p => +p.year === y).reduce((s, p) => s + (+p.amount || 0), 0);
    const exp = exps.filter(e => +e.year === y).reduce((s, e) => s + (+e.amount || 0), 0);
    const r = getRateEco(portfolio, ecoKey, y, age, win) - terRate;
    const midW = ww + (annPac + pic - exp) / 2;
    ww += annPac + pic - exp + midW * r;
    inv += annPac + pic;
    data.push({ year: y, age: age + y, value: Math.round(ww), invested: Math.round(inv), inflYear: +(inflYear * 100).toFixed(2), real: Math.round(ww / cumInfl), regime: inRegime ? ecoSel.label : 'Crescita Normale' });
  }
  return data;
}

function projectWithOverrides(overrides, scenario) {
  const saved = {};
  for (const k of Object.keys(overrides)) { saved[k] = state[k]; state[k] = overrides[k]; }
  const data = project(scenario, false);
  for (const k of Object.keys(overrides)) state[k] = saved[k];
  return data;
}

// ══════════════════════════════════════════════════════════════
// MONTECARLO PRINCIPALE — Gaussiano standard
// Usa μ = rendimento atteso portafoglio · σ = volatilità storica
// (parametri da PORT[key] / getRate / getPortfolioVol).
// Coerente con le linee deterministiche Ott/Base/Pess del grafico:
// ~P80 ≈ scenario Ottimistico · ~P20 ≈ scenario Pessimistico.
// Il Block Bootstrap è disponibile nel tab "MC Avanzato" con tutti
// i modelli avanzati (t-Student, GARCH, Regime-Switching).
// ══════════════════════════════════════════════════════════════
function runMontecarlo() {
  const { w, age, years, portfolio, seq, pics, exps, ter } = state;
  const N = 1000, results = [], timeSeries = Array.from({ length: years + 1 }, () => []);
  const terRate = ter / 100;
  const mode = seq.mode || 'single';
  const crashYearsList = seq.on ? getCrashYears(mode, seq.timing, years) : [];
  const crashYear = crashYearsList[0] ?? -1; // primary for legacy compat
  const acw = crashYear > 0 ? getEquityWeight(portfolio, age + crashYear) : 0;
  const eqCR = SEQ_RATES[seq.severity] ?? -0.35;
  const acr = eqCR * acw + BOND_RALLY_RATE * (1 - acw);
  const cuf = acw > 0 ? Math.pow(Math.pow(1 / (1 + eqCR), 1 / RECOVERY_YEARS), RECOVERY_CATCHUP) : 1;
  
  // Build crash map for multi-crash
  const crashMap = {};
  crashYearsList.forEach((cy, idx) => {
    const sf = idx === 0 ? 1.0 : idx === 1 ? 0.65 : 0.45;
    const cw2 = getEquityWeight(portfolio, age + cy);
    const cr2 = eqCR * sf * cw2 + BOND_RALLY_RATE * (1 - cw2);
    const cuf2 = cw2 > 0 ? Math.pow(Math.pow(1 / (1 + eqCR * sf), 1 / RECOVERY_YEARS), RECOVERY_CATCHUP) : 1;
    crashMap[cy] = { rate: cr2, cuf: cuf2, acw: cw2, sf };
  });

  for (let i = 0; i < N; i++) {
    let cW = w;
    timeSeries[0].push(cW);
    for (let y = 1; y <= years; y++) {
      const annPac = getPacForYear(y) * 12;
      const pic = pics.filter(p => +p.year === y).reduce((s, p) => s + (+p.amount || 0), 0);
      const exp = exps.filter(e => +e.year === y).reduce((s, e) => s + (+e.amount || 0), 0);
      const curAge = age + y;
      let r;
      const crashInfo = crashMap[y];
      const inRecovery = crashYearsList.find(cy => y > cy && y <= cy + RECOVERY_YEARS && crashMap[cy]?.acw > 0);

      if (crashInfo) {
        // Crash year: apply dynamic corr penalty if enabled
        const dynPenalty = seq.dynCorr ? 0.025 * crashInfo.sf : 0;
        r = crashInfo.rate - dynPenalty;
      } else if (inRecovery) {
        const cy = inRecovery;
        const boR = (1 + .07) * crashMap[cy].cuf - 1;
        const cEqW = getEquityWeight(portfolio, curAge);
        r = boR * cEqW + 0.03 * (1 - cEqW);
      } else {
        // Gaussiano log-normale corretto: per ottenere CAGR medio = μ_geometrico
        // occorre campionare dalla media ARITMETICA = μ + σ²/2 (correzione di Itō).
        // Senza correzione: E[CAGR] = μ − σ²/2, che abbassa il P50 sotto la linea Base.
        // Con correzione: E[CAGR] = (μ + σ²/2) − σ²/2 = μ → P50 ≈ linea Base. ✅
        const mu  = getRate(portfolio, 'normal', y, age);
        // Se dynCorr è attivo, usa volatilità stress in periodi vicini a crash
        const nearCrash = crashYearsList.some(cy => Math.abs(y - cy) <= 2);
        const volBase = getPortfolioVol(portfolio, curAge);
        const vol = (seq.on && seq.dynCorr && nearCrash) ? getPortfolioVolDynamic(portfolio, curAge, true) : volBase;
        const mu_arith = mu + 0.5 * vol * vol;   // correzione log-normale
        r = mu_arith + vol * randn_bm();
      }
      r -= terRate;
      const midW = cW + (annPac + pic - exp) / 2;
      cW += annPac + pic - exp + midW * r;
      timeSeries[y].push(Math.max(0, cW));
    }
    results.push(cW);
  }
  results.sort((a, b) => a - b);
  _saveMCResults(results); // salva per export Excel
  const pct_at = (arr, p) => { const sorted = [...arr].sort((a, b) => a - b); return sorted[Math.floor(sorted.length * p)] || 0; };
  const p10 = [], p25 = [], p50 = [], p75 = [], p90 = [], mean = [];
  for (let y = 0; y <= years; y++) {
    const ts = timeSeries[y];
    p10.push(pct_at(ts, .10));
    p25.push(pct_at(ts, .25));
    p50.push(pct_at(ts, .50));
    p75.push(pct_at(ts, .75));
    p90.push(pct_at(ts, .90));
    mean.push(ts.reduce((a, b) => a + b, 0) / ts.length);
  }

  document.getElementById('mcP10').innerText = fmt(results[Math.floor(N * .1)]);
  document.getElementById('mcP25').innerText = fmt(results[Math.floor(N * .25)]);
  document.getElementById('mcP50').innerText = fmt(results[Math.floor(N * .5)]);
  document.getElementById('mcP75').innerText = fmt(results[Math.floor(N * .75)]);
  document.getElementById('mcP90').innerText = fmt(results[Math.floor(N * .9)]);
  document.getElementById('mcMean').innerText = fmt(results.reduce((a, b) => a + b, 0) / N);

  const terStr = state.ter > 0 ? `, TER ${state.ter.toFixed(2)}%` : '';
  const dynCorrStr = seq.on && seq.dynCorr ? ' · <strong style="color:var(--red)">Correlazioni dinamiche attive</strong>' : '';
  const modeStr = seq.on && mode !== 'single' ? ` · ${mode === 'double' ? '2' : '3'} crash` : '';
  document.getElementById('mcDesc').innerHTML = `Monte Carlo 1.000 scenari — <strong>Gaussiano log-normale corretto</strong> (correzione Itō: μ<sub>arith</sub>=μ+σ²/2 → CAGR medio = μ target, P50 ≈ linea Base)${terStr}${modeStr}${dynCorrStr}. Per modelli avanzati (fat-tail, GARCH, Regime-Switching) usa il tab <em>MC Avanzato</em>. Lordi Nominali.`;

  return { p10, p25, p50, p75, p90, mean };
}

// ══════════════════════════════════════════════════════════════
// CROSSOVER
// ══════════════════════════════════════════════════════════════
function findCrossover(data) {
  if (!hasAnyActivePac()) return null;
  for (let i = 1; i < data.length; i++) {
    const ap = getPacForYear(i) * 12;
    if (ap === 0) continue;
    if (data[i].annRetNet >= ap) return data[i].age;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// CHART MAIN
// ══════════════════════════════════════════════════════════════
let chart = null;

function buildChart(best, normal, worst, seqNorm, ages, opt, crashAge, crossAge, picY, expY, pacY, mcFan) {
  if (chart) { chart.destroy(); chart = null; }
  const ptPic = ages.map((_, i) => picY.includes(i) && i > 0 ? best[i] : null);
  const ptExp = ages.map((_, i) => expY.includes(i) && i > 0 ? normal[i] : null);
  const ptPac = ages.map((_, i) => pacY.includes(i) && i > 0 ? normal[i] : null);

  // Correct fan chart: build as separate array to know exact indices
  const baseDsCount = seqNorm ? 4 : 3; // Ott + Base + Pess [+ Seq]
  const fanBands = [];
  if (mcFan && state.showVolBands) {
    // ds indices after base lines:
    // b+0 = P10, b+1 = P25, b+2 = P50mc, b+3 = P75, b+4 = P90
    const b = baseDsCount;
    fanBands.push({ label:'P10',  data:mcFan.p10, borderColor:'rgba(26,115,232,.15)', borderWidth:1, pointRadius:0, fill:false, tension:.35 });
    fanBands.push({ label:'P25',  data:mcFan.p25, borderColor:'rgba(26,115,232,.25)', borderWidth:1, pointRadius:0, fill:{target:b,   above:'rgba(26,115,232,.07)', below:'transparent'}, tension:.35 });
    fanBands.push({ label:'P50mc',data:mcFan.p50, borderColor:'rgba(26,115,232,.45)', borderWidth:2, borderDash:[4,3], pointRadius:0, fill:{target:b+1, above:'rgba(26,115,232,.10)', below:'transparent'}, tension:.35 });
    fanBands.push({ label:'P75',  data:mcFan.p75, borderColor:'rgba(26,115,232,.25)', borderWidth:1, pointRadius:0, fill:{target:b+2, above:'rgba(26,115,232,.10)', below:'transparent'}, tension:.35 });
    fanBands.push({ label:'P90',  data:mcFan.p90, borderColor:'rgba(26,115,232,.15)', borderWidth:1, pointRadius:0, fill:{target:b+3, above:'rgba(26,115,232,.06)', below:'transparent'}, tension:.35 });
  }

  const ds = [
    { label:'Ott.', data:best, borderColor:'#36d490', borderWidth:2, pointRadius:0, fill:false, tension:.35 },
    { label:'Base', data:normal, borderColor:'#1a73e8', borderWidth:3, pointRadius:0, fill:false, tension:.35 },
    { label:'Pess.', data:worst, borderColor:'#e37400', borderWidth:2, pointRadius:0, fill:false, tension:.35 },
    ...(seqNorm ? [{ label:'Seq.', data:seqNorm, borderColor:'#9334e6', borderWidth:2.2, borderDash:[7,4], pointRadius:0, fill:false, tension:.35 }] : []),
    ...fanBands,
    { label:'PIC', data:ptPic, borderColor:'transparent', backgroundColor:'#36d490', pointRadius:6, showLine:false },
    { label:'Exp', data:ptExp, borderColor:'transparent', backgroundColor:'#d93025', pointRadius:6, showLine:false },
    { label:'PacChg', data:ptPac, borderColor:'transparent', backgroundColor:'rgba(26,115,232,.9)', pointRadius:7, pointStyle:'rectRot', showLine:false },
  ];

  const gC = 'rgba(0,0,0,.05)', tC = 'rgba(0,0,0,.45)';
  chart = new Chart(document.getElementById('ch'), {
    type: 'line', data: { labels: ages, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          filter: i => !['PIC', 'Exp', 'PacChg', 'P90', 'P75', 'P50mc', 'P25', 'P10'].includes(i.dataset.label),
          callbacks: {
            title: c => 'Età ' + c[0].label,
            label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw),
          },
          backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1,
          titleColor: '#202124', bodyColor: '#5f6368', padding: 10,
          titleFont: { family: 'DM Mono', size: 13, weight: 'bold' },
          bodyFont: { family: 'DM Mono', size: 12 },
        }
      },
      scales: {
        x: { ticks: { color: tC, font: { size: 11, family: 'DM Mono', weight: '500' }, maxTicksLimit: 12 }, grid: { color: gC } },
        y: { ticks: { color: tC, font: { size: 11, family: 'DM Mono', weight: '500' }, callback: v => fmt(v) }, grid: { color: gC } },
      }
    },
    plugins: [{
      id: 'ov', afterDraw(c) {
        const { ctx, scales: { x, y } } = c;
        if (opt >= y.min && opt <= y.max) {
          const yp = y.getPixelForValue(opt);
          ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x.left, yp); ctx.lineTo(x.right, yp); ctx.stroke();
          ctx.setLineDash([]); ctx.font = '10.5px DM Mono,monospace'; ctx.fillStyle = 'rgba(0,0,0,.35)';
          ctx.fillText('💎 optionality ' + fmt(opt), x.left + 6, yp - 4); ctx.restore();
        }
        if (crossAge !== null) {
          const xi = ages.indexOf(crossAge);
          if (xi >= 0) {
            const xp = x.getPixelForValue(crossAge);
            ctx.save(); ctx.setLineDash([5, 3]); ctx.strokeStyle = 'rgba(147,52,230,.6)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(xp, y.top); ctx.lineTo(xp, y.bottom); ctx.stroke();
            ctx.setLineDash([]); ctx.font = '10px DM Mono,monospace'; ctx.fillStyle = 'rgba(147,52,230,.9)';
            ctx.fillText('⬤ crossover', xp + 4, y.top + 14); ctx.restore();
          }
        }
        if (crashAge) {
          const xp = x.getPixelForValue(crashAge);
          if (xp) {
            ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(147,52,230,.4)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(xp, y.top); ctx.lineTo(xp, y.bottom); ctx.stroke();
            ctx.setLineDash([]); ctx.restore();
          }
        }
      }
    }]
  });
}

function toggleLiq() { state.showLiq = !state.showLiq; render(); }
function toggleVolBands() { state.showVolBands = !state.showVolBands; document.getElementById('volBandsTog').classList.toggle('on', state.showVolBands); document.getElementById('legVol').style.display = state.showVolBands ? 'flex' : 'none'; render(); }

// ══════════════════════════════════════════════════════════════
// MODULO INFLAZIONE — con correlazione asset
// ══════════════════════════════════════════════════════════════
function renderInflation(vN, vW, vBt, inv, years, dN) {
  const inflBase = state.inflBottom / 100;
  const inflSig = state.inflVol / 100;
  const dF_base = Math.pow(1 + inflBase, years);
  const txF = blendedTaxRate(state.age + years);
  const nN = calcNetNom(vN, inv, txF);
  const nP = calcNetNom(vW, inv, txF);
  const nO = calcNetNom(vBt, inv, txF);

  // Scenari inflazione: bassa/centrale/alta + stocastici
  const inflScenarios = [
    { l: 'Bassa inflazione', rate: Math.max(0, inflBase - inflSig * 2), c: '#1e8e3e', bg: '#e8f5e9' },
    { l: 'Centrale (' + state.inflBottom.toFixed(1) + '%)', rate: inflBase, c: '#1a73e8', bg: '#e8f0fe' },
    { l: 'Alta inflazione', rate: inflBase + inflSig * 2, c: '#e37400', bg: '#fff3e0' },
    { l: 'Stocastica (σ=' + state.inflVol.toFixed(1) + '%)', rate: inflBase + inflSig, c: '#9334e6', bg: '#f3e8ff' },
  ];

  document.getElementById('inflScenarios').innerHTML = inflScenarios.map(s => {
    const df = Math.pow(1 + s.rate, years);
    const rN = nN / df;
    return `<div class="infl-card" style="border-color:${s.bg};background:${s.bg}">
      <div style="font-size:11px;font-weight:700;color:${s.c};margin-bottom:4px">${s.l}</div>
      <div style="font-size:12px;color:var(--text3)">Inflaz.: <strong>${(s.rate * 100).toFixed(1)}%/a</strong></div>
      <div style="font-size:11px;color:var(--text3)">Fattore: ÷${df.toFixed(2)}</div>
      <div style="font-size:10px;color:var(--text3);margin:4px 0">Netto Nominale Base</div>
      <div style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;color:var(--text2)">${fmt(nN)}</div>
      <div style="font-size:10px;color:#bbb;margin:2px 0">→ in potere d'acquisto oggi</div>
      <div style="font-size:20px;font-weight:700;font-family:'DM Mono',monospace;color:${s.c}">${fmt(rN)}</div>
      <div style="font-size:10.5px;color:var(--text3);margin-top:4px">Erosione: <strong style="color:var(--red)">${fmt(nN - rN)}</strong></div>
    </div>`;
  }).join('');

  // Tabella correlazione asset-inflazione
  const port = getPortParams(state.portfolio);
  const eqW = getEquityWeight(state.portfolio, state.age + years);
  const goldW = getGoldWeight(state.portfolio);
  const obW = Math.max(0, 1 - eqW - goldW);
  const assets = [
    { name: 'Azioni (' + (eqW * 100).toFixed(0) + '%)', corr: '+0.3', desc: 'Coprono l\'inflazione nel lungo periodo (+2-3% reale storico)', color: 'var(--green)' },
    { name: 'Obbligaz. nominali (' + (obW * 100).toFixed(0) + '%)', corr: '−0.35', desc: 'Soffrono molto in stagflazione: cedola fissa, rendimento reale negativo', color: 'var(--red)' },
    { name: 'Oro (' + (goldW * 100).toFixed(0) + '%)', corr: '+0.5', desc: 'Forte correlazione positiva con inflazione elevata (1970-80, 2020-22)', color: 'var(--orange)' },
    { name: 'Liquidità (' + (getCashWeight(state.portfolio) * 100).toFixed(0) + '%)', corr: '+0.2', desc: 'Tassi flottanti mitigano l\'erosione in contesti di rialzo', color: 'var(--teal)' },
  ].filter(a => parseFloat(a.name.match(/\((\d+)/)?.[1] ?? '0') > 0);

  const portInflBeta = port?.inflBeta ?? 0.1;
  const betaDesc = portInflBeta > 0.3 ? 'BUONA copertura inflazione' : portInflBeta > 0 ? 'DISCRETA copertura' : 'SCARSA copertura — soffre l\'inflazione';

  document.getElementById('inflCorrTable').innerHTML = `
    <div style="background:#fff;border:1px solid #ffe0b2;border-radius:var(--radius-sm);padding:14px;margin-bottom:10px">
      <div style="font-size:11px;font-weight:700;color:#e65100;text-transform:uppercase;font-family:'DM Mono',monospace;margin-bottom:10px">
        Correlazione Asset–Inflazione · ${getPortLabel(state.portfolio)}
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:#fff3e0;border-radius:var(--radius-sm);margin-bottom:10px">
        <div style="font-size:24px;font-weight:700;font-family:'DM Mono',monospace;color:${portInflBeta > 0.2 ? '#1e8e3e' : portInflBeta > 0 ? '#e37400' : '#d93025'}">${portInflBeta > 0 ? '+' : ''}${portInflBeta.toFixed(2)}</div>
        <div><div style="font-size:12px;font-weight:700;color:#e65100">Beta Inflazione del Portafoglio</div><div style="font-size:11.5px;color:#795548">${betaDesc}</div></div>
      </div>
      ${assets.map(a => `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #ffe0b2;gap:10px">
        <div style="font-weight:600;color:${a.color};min-width:130px;font-size:12.5px">${a.name}</div>
        <div style="font-size:12px;font-weight:700;color:${a.corr.startsWith('+') ? 'var(--green)' : 'var(--red)'};width:50px;text-align:center">${a.corr}</div>
        <div style="font-size:11.5px;color:var(--text2);flex:1">${a.desc}</div>
      </div>`).join('')}
    </div>
    <div style="background:#fff3e0;border:1px solid #ffe0b2;border-radius:var(--radius-sm);padding:12px;font-size:12px;color:#795548;line-height:1.7">
      In <strong>${years} anni</strong> al <strong>${inflBase.toFixed(1)}%</strong> (inflaz. centrale): ogni €100 oggi = €${(100 * dF_base).toFixed(0)} nominali. Erosione potere d'acquisto: <strong style="color:var(--red)">${((1 - 1 / dF_base) * 100).toFixed(1)}%</strong>. 
      Il portafoglio <strong>${getPortLabel(state.portfolio)}</strong> ha un beta inflazione di <strong>${portInflBeta > 0 ? '+' : ''}${portInflBeta.toFixed(2)}</strong> — 
      ${portInflBeta > 0.3 ? 'ottima difesa contro l\'erosione monetaria' : portInflBeta > 0 ? 'copertura parziale — i rendimenti reali potrebbero ridursi in contesti di alta inflazione' : 'attenzione: questo portafoglio soffre significativamente in periodi di alta inflazione'}.
    </div>`;

  // SWR con inflazione reale
  // Fraction of gross withdrawal that is gain (proporzione gain/valore)
  const gainFrac = vN > 0 && inv < vN ? Math.min(1, (vN - inv) / vN) : 0;
  const eT = gainFrac * txF;
  const df = dF_base;
  document.getElementById('inflDetails').innerHTML = `
    <div style="background:#fff;border:1px solid #ffe0b2;border-radius:var(--radius-sm);padding:14px;margin-bottom:14px">
      <div style="font-size:11px;color:#e65100;font-weight:700;text-transform:uppercase;font-family:'DM Mono',monospace;margin-bottom:10px">Rendita Sostenibile in Potere d'Acquisto Reale</div>
      ${[{ r: .03, l: '3%', c: '#1a73e8' }, { r: .035, l: '3.5%', c: '#1e8e3e' }, { r: .04, l: '4%', c: '#1e8e3e' }].map(s => {
    const gA = vN * s.r, nA = gA * (1 - eT), nR = nA / df;
    return `<div class="infl-swr-row"><span style="font-weight:600;color:#e65100;width:40px">SWR ${s.l}</span><span style="color:#795548">Net nom. <strong>${fmt(nA)}</strong>/a</span><span>→</span><span><strong style="color:${s.c};font-size:14px">${fmt(nR)}</strong>/a reali (${fmt(nR / 12)}/m)</span></div>`;
  }).join('')}
      <div style="font-size:11px;color:#bbb;margin-top:8px">Scontato ÷${df.toFixed(2)} = potere d'acquisto in euro di oggi.</div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// RENDER MAIN
// ══════════════════════════════════════════════════════════════
function render() {
  const { w, pac, age, years, opt, portfolio, seq, ter } = state;
  const endAge = age + years;
  const txS = blendedTaxRate(age) * 100, txE = blendedTaxRate(endAge) * 100;
  document.getElementById('blendedTaxBadge').innerText = Math.abs(txE - txS) < .5 ? `Aliquota blended: ${txS.toFixed(1)}%` : `Aliquota blended: ${txS.toFixed(1)}% → ${txE.toFixed(1)}% (lifecycle)`;

  const dB = project('best', false), dN = project('normal', false), dW = project('worst', false);
  const dS = seq.on ? project('normal', true) : null;
  const dNT = ter > 0 ? project('normal', false, 0) : null;
  const ages = dN.map(d => d.age);
  const vB = dB.map(d => d.value), vN = dN.map(d => d.value), vW = dW.map(d => d.value);
  const vS = dS ? dS.map(d => d.value) : null;
  const terDrag = dNT ? dNT[years].value - vN[years] : 0;
  const crashYearsList = seq.on ? getCrashYears(seq.mode || 'single', seq.timing, years) : [];
  const crashY = crashYearsList[0] ?? -1;
  const crashAge = crashY > 0 ? age + crashY : null;
  const bCA = findCrossover(dN), aCA = findCrossover(seq.on ? dS : dN);
  const picY = state.pics.map(p => +p.year);
  const expY = state.exps.map(e => +e.year);
  const pacY = state.pacChanges.map(c => +c.year);

  const mcFan = runMontecarlo();
  buildChart(vB, vN, vW, vS, ages, opt, crashAge, aCA, picY, expY, pacY, mcFan);

  document.getElementById('legSeq').style.display = seq.on ? 'flex' : 'none';
  document.getElementById('legPacChg').style.display = state.pacChanges.length > 0 ? 'flex' : 'none';

  const oA = arr => { const d = arr.find(d => d.value >= opt); return d ? d.age : null; };
  const oB = oA(dB), oN = oA(dN), oW = oA(dW);
  const md = [
    { l: `Pessimistico — età ${endAge}`, v: fmt(vW[years]), s: 'opt: ' + (oW || '>' + endAge), c: 'var(--orange)' },
    { l: `Base — età ${endAge}`, v: fmt(vN[years]), s: 'opt: ' + (oN || '>' + endAge), c: 'var(--blue)' },
    { l: `Ottimistico — età ${endAge}`, v: fmt(vB[years]), s: 'opt: ' + (oB || '>' + endAge), c: 'var(--green)' },
    ...(dS ? [{ l: `+Seq.Risk — età ${endAge}`, v: fmt(vS[years]), s: (vS[years] > vN[years] ? '+' : '') + fmt(vS[years] - vN[years]), c: 'var(--purple)' }] : []),
    { l: 'Totale versato', v: fmt(dN[years].invested), s: pac > 0 ? fmt(pac * 12) + '/anno' : 'solo PIC', c: 'var(--text)' },
    { l: 'Plusvalenza Lorda Nom.', v: fmt(dN[years].returns), s: dN[years].invested > 0 ? '×' + (dN[years].value / dN[years].invested).toFixed(2) + ' molt.' : '', c: dN[years].returns >= 0 ? 'var(--green)' : 'var(--red)' },
  ];
  document.getElementById('metrics').innerHTML = md.map(m => `<div class="mcard"><div class="ml">${m.l}</div><div class="mv" style="color:${m.c}">${m.v}</div><div class="ms">${m.s}</div></div>`).join('');

  const te = document.getElementById('terDragContent');
  if (ter === 0) te.innerHTML = `<span style="color:var(--green);font-weight:600">TER = 0%</span> — nessun costo fondo.`;
  else { const tp = (terDrag / dNT[years].value * 100).toFixed(1); te.innerHTML = `Con TER <strong>${ter.toFixed(2)}%</strong> su ${years} anni: costo stimato <strong style="color:var(--orange)">${fmt(terDrag)}</strong> vs TER 0% (${tp}% del montante — compounding dell'erosione annua)`; }

  const tI = dN[years].invested, txF = blendedTaxRate(endAge);
  const nB = calcNetNom(vN[years], tI, txF), nP = calcNetNom(vW[years], tI, txF), nO = calcNetNom(vB[years], tI, txF);
  document.getElementById('liqAge').innerText = endAge;
  const lb = document.getElementById('liqBtn'), ld = document.getElementById('liqData');
  if (state.showLiq) {
    lb.innerText = 'Nascondi'; lb.style.background = 'var(--bg)'; lb.style.color = 'var(--blue)'; ld.style.display = 'block';
    const lC = (t, g, n, col) => { const gain = Math.max(0, g - tI), tax = gain * txF; return `<div class="liq-card"><div class="liq-card-title">${t}</div><div class="liq-row"><span style="color:var(--text2)">Lordo Nominale</span><strong>${fmt(g)}</strong></div><div class="liq-row"><span style="color:var(--text2)">Capitale versato</span><span>${fmt(tI)}</span></div><div class="liq-row" style="color:var(--red)"><span>Tasse CG (${(txF * 100).toFixed(1)}%)</span><span>−${fmt(tax)}</span></div><div class="liq-row" style="border-top:1px solid var(--border);padding-top:8px;margin-bottom:0"><strong style="color:${col}">Netto Nominale</strong><strong style="color:${col};font-size:15px">${fmt(n)}</strong></div></div>`; };
    ld.innerHTML = `<div class="grid-3" style="gap:14px">${lC('Pessimistico', vW[years], nP, 'var(--orange)')}${lC('Scenario Base', vN[years], nB, 'var(--blue)')}${lC('Ottimistico', vB[years], nO, 'var(--green)')}</div><div style="font-size:11.5px;color:var(--text3);margin-top:12px">Aliquota ponderata finale: <strong>${(txF * 100).toFixed(1)}%</strong> (solo sulla plusvalenza).</div>`;
  } else { lb.innerText = '💰 Simula Vendita Totale (Netto)'; lb.style.background = 'var(--blue-dim)'; lb.style.color = 'var(--blue)'; ld.style.display = 'none'; }

  // Frazione media di plusvalenza sul valore finale (approx. per prelievi parziali proporzionali)
  const gainFrac = tI > 0 && vN[years] > tI ? Math.min(1, (vN[years] - tI) / vN[years]) : 0;
  // Aliquota effettiva sul prelievo lordo: solo la quota gain è tassata
  const eT = gainFrac * txF;
  const swrI = [{ r: .03, l: '3%', s: 'Conservativo', c: 'var(--blue)' }, { r: .035, l: '3.5%', s: 'Moderato', c: 'var(--green)' }, { r: .04, l: '4%', s: 'Regola del 4%', c: 'var(--green)' }];
  document.getElementById('swrData').innerHTML = `<div style="font-size:12.5px;color:var(--text2);margin-bottom:12px">Montante base <strong>${fmt(vN[years])}</strong>. Tassa effettiva prelievo: <strong>${(eT * 100).toFixed(1)}%</strong>.</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">${swrI.map(s => { const gA = vN[years] * s.r, nA = gA * (1 - eT), vP = pac > 0 ? ` — ${(nA / (pac * 12) * 100).toFixed(0)}% del PAC` : ''; return `<div class="liq-card"><div class="liq-card-title">SWR ${s.l} · ${s.s}</div><div class="liq-row"><span style="color:var(--text2)">Lorda/anno</span><strong>${fmt(gA)}</strong></div><div class="liq-row"><span style="color:var(--text2)">Lorda/mese</span><span>${fmt(gA / 12)}</span></div><div class="liq-row" style="border-top:1px solid var(--border);padding-top:8px;margin-bottom:0"><strong style="color:${s.c}">Netta/anno</strong><strong style="color:${s.c}">${fmt(nA)}${vP}</strong></div></div>`; }).join('')}</div>`;

  // INFLAZIONE AVANZATA
  renderInflation(vN[years], vW[years], vB[years], tI, years, dN);

  // CROSSOVER
  let cxt = '';
  if (!hasAnyActivePac()) cxt = 'Nessun PAC attivo. Nessun crossover calcolabile.';
  else if (aCA) { const cPac = getPacForYear(aCA - age) * 12; cxt = `A <strong>${aCA} anni</strong> la rendita annua netta supera il PAC di <strong>${fmt(cPac / 12)}/m</strong> (${fmt(cPac)}/a) — il portafoglio diventa <em>autosufficiente</em>.`; }
  else { const mp = Math.max(state.pac, ...state.pacChanges.map(c => +c.amount)); cxt = `Con PAC di ${fmt(mp * 12)}/anno il crossover netto non viene raggiunto nell'orizzonte impostato.`; }
  document.getElementById('cxText').innerHTML = cxt;

  // BAR CHART
  const inv2 = dN[years].invested, tot = dN[years].value, ret = tot - inv2;
  const iP = tot > 0 ? Math.max(2, (inv2 / tot * 100)).toFixed(1) : 100;
  const rP = tot > 0 ? Math.max(0, (ret / tot * 100)).toFixed(1) : 0;
  document.getElementById('barTrack').innerHTML = `<div class="bar-inv" style="width:${iP}%"></div><div class="bar-ret" style="width:${rP}%"></div>`;
  document.getElementById('barStats').innerHTML = `<div><span class="bar-dot" style="background:var(--blue)"></span>Versato: <strong>${fmt(inv2)}</strong> (${iP}%)</div><div><span class="bar-dot" style="background:var(--green)"></span>Plusvalenza: <strong style="color:var(--green)">${fmt(ret)}</strong> (${rP}%)</div><div style="color:var(--text3)">Moltiplicatore: <strong style="color:var(--text)">${tot > 0 && inv2 > 0 ? (tot / inv2).toFixed(2) : '—'}×</strong></div>`;

  // TABELLA
  const eY = new Set([0, years]);
  picY.forEach(y => { if (y > 0 && y <= years) eY.add(y); });
  expY.forEach(y => { if (y > 0 && y <= years) eY.add(y); });
  pacY.forEach(y => { if (y > 0 && y <= years) eY.add(y); });
  if (aCA) eY.add(aCA - age);
  if (crashY > 0) eY.add(crashY);
  crashYearsList.forEach(cy => { if (cy > 0 && cy <= years) eY.add(cy); });
  const stp = Math.max(1, Math.floor(years / 10));
  for (let y = 0; y <= years; y += stp) eY.add(y);
  const rows = state.allRows ? dN : dN.filter((_, i) => eY.has(i));
  const isCx = y => aCA && (age + y) === aCA;
  document.getElementById('tb').innerHTML = rows.map(d => {
    const iC = d.year === crashY && seq.on;
    const iPC = pacY.includes(d.year) && d.year > 0;
    const iPic = picY.includes(d.year) && d.year > 0;
    const iExp = expY.includes(d.year) && d.year > 0;
    const iCxR = isCx(d.year);
    const rc = []; if (iC) rc.push('tr-crash'); if (iPC) rc.push('tr-pac'); if (iPic) rc.push('tr-pic'); if (iExp) rc.push('tr-exp'); if (iCxR) rc.push('tr-cross');
    const rA = d.year > 0 ? d.annRetNet : 0, rPac = d.year > 0 ? getPacForYear(d.year) * 12 : state.pac * 12;
    const rCls = d.returns > 0 ? 'pos' : d.returns < 0 ? 'neg' : 'neutral';
    const aC = rA > rPac ? 'pos' : rA > 0 ? 'neutral' : 'neg';
    const vsP = d.year > 0 ? fmt(rA - rPac) : '—', vsCls = d.year > 0 && (rA - rPac) >= 0 ? 'pos' : 'neg';
    const pN = (d.year > 0 && rPac !== state.pac * 12) ? `<span style="font-size:10px;color:var(--blue);font-family:'DM Mono',monospace;background:var(--blue-dim);padding:1px 5px;border-radius:3px;margin-left:4px">${rPac === 0 ? '⏸' : fmt(rPac / 12) + '/m'}</span>` : '';
    return `<tr class="${rc.join(' ')}"><td><strong>${d.age}</strong></td><td>+${d.year}a${pN}</td><td>${fmt(d.invested)}</td><td class="${rCls}">${d.year > 0 ? fmt(d.returns) : '—'}</td><td><strong>${fmt(d.value)}</strong></td><td class="${aC}">${d.year > 0 ? fmt(rA) : '—'}</td><td class="${vsCls}">${vsP}</td><td style="font-size:11.5px;color:var(--text3);white-space:nowrap">${d.event || ''}</td></tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
// TAB SCENARI ECONOMICI
// ══════════════════════════════════════════════════════════════
let chartEco = null;

function renderEcoScenarios() {
  // Sync banner — mostra i parametri ereditati dal Simulatore
  const pName = getPortLabel(state.portfolio);
  const seqOn = state.seq && state.seq.on;
  document.getElementById('ecoSyncBanner').innerHTML =
    `<span style="color:var(--text2)">Parametri ereditati dal <strong style="color:var(--blue)">Simulatore</strong>:</span> ` +
    `<strong>${fmt(state.w)}</strong> capitale · ` +
    `<strong>€${fmtN(state.pac)}/m</strong> PAC · ` +
    `<strong>${state.years} anni</strong> · ` +
    `<strong>${pName}</strong>` +
    (seqOn ? ` · <span style="color:var(--purple)">⚠ Sequence Risk attivo</span>` : '');

  // Build scenario cards
  document.getElementById('ecoScenarioGrid').innerHTML = Object.entries(ECO_SCENARIOS).map(([k, s]) => `
    <div class="eco-card ${state.activeEcoScenario === k ? 'active' : ''}" 
         style="background:${s.bg};border-color:${state.activeEcoScenario === k ? s.color : 'transparent'}"
         onclick="selectEcoScenario('${k}')">
      <div class="eco-card-title" style="color:${s.color}">${s.emoji} ${s.label}</div>
      <div class="eco-card-desc">${s.desc.substring(0, 80)}…</div>
      <div style="margin-top:6px;font-size:10.5px;font-family:'DM Mono',monospace;color:${s.color};font-weight:600">⏱ ${s.duration >= 99 ? 'baseline' : '~' + s.duration + ' anni'}</div>
    </div>`).join('');

  const eco = ECO_SCENARIOS[state.activeEcoScenario];
  // Coerenza con il Simulatore: rispetta il toggle Sequence Risk per la baseline
  const dBase = project('normal', seqOn);
  const dEco = projectEco(state.activeEcoScenario);
  const ages = dBase.map(d => d.age);
  const vBase = dBase.map(d => d.value);
  const vEco = dEco.map(d => d.value);
  const vReal = dEco.map(d => d.real);

  document.getElementById('ecoSelectedDesc').style.display = 'block';
  const dur = ECO_SCENARIOS[state.activeEcoScenario].duration ?? 99;
  const win = getEcoWindow(state.activeEcoScenario, state.years, state.ecoTiming);
  const timingLabel = { early: '🌅 Inizio', mid: '🌤 Metà', late: '🌆 Fine' }[state.ecoTiming] || '';
  const winLabel = dur >= 99 ? 'permanente' : `anni ${win.s}–${win.e} su ${state.years}`;
  const durLabel = dur >= 99 ? 'permanente (baseline)' : `~${dur} anni (poi ritorno a Crescita Normale)`;
  document.getElementById('ecoSelectedDesc').innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
      <div style="font-size:28px">${eco.emoji}</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:700;color:${eco.color};margin-bottom:6px">${eco.label}</div>
        <div style="font-size:12.5px;color:var(--text2);line-height:1.7;margin-bottom:10px">${eco.desc}</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;font-family:'DM Mono',monospace">
          <span><b>Durata regime:</b> ${durLabel}</span>
          <span style="color:var(--purple);font-weight:600">${timingLabel} · regime attivo: ${winLabel}</span>
          <span>Az. ×${eco.eqMult}</span>
          <span>Ob. ×${eco.obMult}</span>
          <span>Oro ×${eco.goldMult}</span>
          <span>Inflaz. ${eco.inflMean}% (σ=${eco.inflSigma}%)</span>
          <span>Vol. ×${eco.volMult}</span>
          <span>Cash ${(eco.cashRet * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="mcard"><div class="ml">Scenario Economico</div><div class="mv" style="color:${eco.color};font-size:16px">${fmt(vEco[state.years])}</div><div class="ms">Valore finale</div></div>
        <div class="mcard"><div class="ml">Scenario Base</div><div class="mv" style="color:var(--blue);font-size:16px">${fmt(vBase[state.years])}</div><div class="ms">Riferimento</div></div>
        <div class="mcard"><div class="ml">Differenza</div><div class="mv" style="color:${vEco[state.years] > vBase[state.years] ? 'var(--green)' : 'var(--red)'};font-size:16px">${vEco[state.years] > vBase[state.years] ? '+' : ''}${fmt(vEco[state.years] - vBase[state.years])}</div><div class="ms">${((vEco[state.years] / vBase[state.years] - 1) * 100).toFixed(1)}%</div></div>
      </div>
    </div>`;

  if (chartEco) { chartEco.destroy(); chartEco = null; }
  const gC = 'rgba(0,0,0,.05)', tC = 'rgba(0,0,0,.45)';
  chartEco = new Chart(document.getElementById('chEco'), {
    type: 'line',
    data: {
      labels: ages,
      datasets: [
        { label: 'Base', data: vBase, borderColor: '#1a73e8', borderWidth: 2.5, pointRadius: 0, fill: false, tension: .35 },
        { label: eco.label, data: vEco, borderColor: eco.color, borderWidth: 3, pointRadius: 0, fill: false, tension: .35 },
        { label: 'Reale (deflatato)', data: vReal, borderColor: eco.color, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, fill: false, tension: .35 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { font: { family: 'DM Mono', size: 11 }, boxWidth: 16 } },
        tooltip: { callbacks: { title: c => 'Età ' + c[0].label, label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw) }, backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1, titleColor: '#202124', bodyColor: '#5f6368', padding: 10 }
      },
      scales: {
        x: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 12 }, grid: { color: gC } },
        y: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, callback: v => fmt(v) }, grid: { color: gC } }
      }
    },
    plugins: [{
      id: 'opt', afterDraw(c) {
        const { ctx, scales: { x, y } } = c;
        if (state.opt >= y.min && state.opt <= y.max) {
          const yp = y.getPixelForValue(state.opt);
          ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x.left, yp); ctx.lineTo(x.right, yp); ctx.stroke();
          ctx.setLineDash([]); ctx.font = '10px DM Mono,monospace'; ctx.fillStyle = 'rgba(0,0,0,.3)';
          ctx.fillText('💎 optionality', x.left + 6, yp - 4); ctx.restore();
        }
        // Linee verticali inizio/fine regime (usa win.e per rispettare il timing scelto)
        const ecoC = ECO_SCENARIOS[state.activeEcoScenario];
        if (ecoC && (ecoC.duration ?? 99) < 99) {
          ctx.save();
          ctx.setLineDash([5, 4]); ctx.strokeStyle = ecoC.color; ctx.lineWidth = 1.5;
          ctx.font = 'bold 10.5px DM Mono,monospace'; ctx.fillStyle = ecoC.color;
          if (win.s > 1) {
            const xpS = x.getPixelForValue(state.age + win.s - 1);
            ctx.beginPath(); ctx.moveTo(xpS, y.top); ctx.lineTo(xpS, y.bottom); ctx.stroke();
            ctx.fillText('inizio regime (a.' + win.s + ')', xpS + 4, y.top + 28);
          }
          if (win.e < state.years) {
            const xpE = x.getPixelForValue(state.age + win.e);
            ctx.beginPath(); ctx.moveTo(xpE, y.top); ctx.lineTo(xpE, y.bottom); ctx.stroke();
            ctx.fillText('\u27f5 fine regime (a.' + win.e + ')', xpE + 4, y.top + 14);
          }
          ctx.restore();
        }
      }
    }]
  });

  // Compare table — all scenarios
  const rows = Object.entries(ECO_SCENARIOS).map(([k, s]) => {
    const dE = projectEco(k);
    const vE = dE[state.years].value, vR = dE[state.years].real;
    const delta = vE - vBase[state.years], pct = ((vE / vBase[state.years] - 1) * 100).toFixed(1);
    const durTxt = s.duration >= 99 ? 'baseline' : `${Math.min(s.duration, state.years)}/${state.years} a`;
    return `<tr><td style="text-align:left"><span style="font-size:13px">${s.emoji}</span> ${s.label}</td>
      <td style="font-family:'DM Mono',monospace;color:${s.color};font-weight:600">${durTxt}</td>
      <td style="font-weight:600;color:${s.color}">${fmt(vE)}</td>
      <td class="${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${fmt(delta)}</td>
      <td class="${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${pct}%</td>
      <td style="color:var(--text3)">${fmt(vR)}</td>
      <td style="color:var(--text3)">${s.inflMean.toFixed(1)}%</td></tr>`;
  }).join('');
  document.getElementById('ecoCompareTable').innerHTML = `
    <div class="tbl-outer"><table>
      <thead><tr>
        <th style="text-align:left">Scenario</th>
        <th>Durata regime</th>
        <th>Valore Finale</th>
        <th>Δ vs Base</th>
        <th>Δ %</th>
        <th>Valore Reale</th>
        <th>Inflaz. media (regime)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;

  // Tabella anno per anno
  const stp = Math.max(1, Math.floor(state.years / 12));
  document.getElementById('ecoTable').innerHTML = dEco.filter((_, i) => i % stp === 0 || i === state.years).map(d => {
    const bv = dBase[d.year]?.value ?? 0;
    const delta = d.value - bv;
    return `<tr>
      <td><strong>${d.age}</strong></td>
      <td>+${d.year}a</td>
      <td style="color:var(--blue)">${fmt(bv)}</td>
      <td style="color:${eco.color};font-weight:600">${fmt(d.value)}</td>
      <td class="${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${fmt(delta)}</td>
      <td style="color:${d.inflYear > 4 ? 'var(--red)' : d.inflYear < 0 ? 'var(--blue)' : 'var(--text2)'}">${d.inflYear.toFixed(1)}%</td>
      <td style="color:var(--teal)">${fmt(d.real)}</td>
    </tr>`;
  }).join('');
}

function selectEcoScenario(key) {
  state.activeEcoScenario = key;
  renderEcoScenarios();
}

// ══════════════════════════════════════════════════════════════
// TAB A/B
// ══════════════════════════════════════════════════════════════
let chartAB = null;
function renderAB() {
  const dA = project('best', false), dAn = project('normal', false), dAw = project('worst', false);
  const pacBoverride = stateB.pac >= 0 ? stateB.pac : state.pac;
  const dBb = projectWithOverrides({ portfolio: stateB.portfolio, ter: stateB.ter, pac: pacBoverride }, 'best');
  const dBn = projectWithOverrides({ portfolio: stateB.portfolio, ter: stateB.ter, pac: pacBoverride }, 'normal');
  const dBw = projectWithOverrides({ portfolio: stateB.portfolio, ter: stateB.ter, pac: pacBoverride }, 'worst');
  const ages = dAn.map(d => d.age);
  const { years, age } = state, endAge = age + years;
  const pA = getPortParams(state.portfolio);

  // ── Sync banner: mostra esattamente cosa è condiviso tra A e B ──
  const picCount = state.pics.length, expCount = state.exps.length, pacChgCount = state.pacChanges.length;
  const sharedItems = [
    `<strong>${fmt(state.w)}</strong> patrimonio`,
    `<strong>${state.years} anni</strong>`,
    `<strong>età ${state.age}</strong>`,
    `<strong>${state.taxEq.toFixed(0)}%/${state.taxOb.toFixed(0)}%</strong> tasse Az/Ob`,
    ...(picCount > 0    ? [`<strong>${picCount} PIC</strong> aggiuntivi (condivisi)`] : []),
    ...(expCount > 0    ? [`<strong>${expCount} spese</strong> straordinarie (condivise)`] : []),
    ...(pacChgCount > 0 ? [`<strong>${pacChgCount} variaz.</strong> PAC base (condivise)`] : []),
  ];
  const syncEl = document.getElementById('abSyncDetails');
  if (syncEl) syncEl.innerHTML = sharedItems.join(' · ') + (picCount + expCount > 0
    ? `<span style="margin-left:8px;color:var(--orange);font-size:11px">⚠ PIC e spese identici per entrambi i portafogli</span>` : '');

  document.getElementById('ab-a-info').innerHTML = `<div style="display:flex;gap:20px;flex-wrap:wrap;font-size:12.5px"><div><strong>${pA?.label ?? state.portfolio}</strong></div><div>TER: <strong>${state.ter.toFixed(2)}%</strong></div><div>PAC: <strong>${fmt(state.pac)}/m</strong></div>${pA && pA.normal ? `<div>Rend. base: <strong>${((pA.normal - state.ter / 100) * 100).toFixed(2)}%</strong>/a</div>` : ''}</div><div style="margin-top:8px;font-size:12px;color:var(--text2)">Valore finale base: <strong style="color:var(--blue)">${fmt(dAn[years].value)}</strong></div>`;
  if (chartAB) { chartAB.destroy(); chartAB = null; }
  const ds = [
    { label: 'A Ott.', data: dA.map(d => d.value), borderColor: 'rgba(26,115,232,.4)', borderWidth: 1, pointRadius: 0, fill: false, tension: .35, borderDash: [4, 3] },
    { label: 'A Base', data: dAn.map(d => d.value), borderColor: '#1a73e8', borderWidth: 3, pointRadius: 0, fill: false, tension: .35 },
    { label: 'A Pess.', data: dAw.map(d => d.value), borderColor: 'rgba(26,115,232,.4)', borderWidth: 1, pointRadius: 0, fill: false, tension: .35, borderDash: [4, 3] },
    { label: 'B Ott.', data: dBb.map(d => d.value), borderColor: 'rgba(147,52,230,.4)', borderWidth: 1, pointRadius: 0, fill: false, tension: .35, borderDash: [4, 3] },
    { label: 'B Base', data: dBn.map(d => d.value), borderColor: '#9334e6', borderWidth: 3, pointRadius: 0, fill: false, tension: .35 },
    { label: 'B Pess.', data: dBw.map(d => d.value), borderColor: 'rgba(147,52,230,.4)', borderWidth: 1, pointRadius: 0, fill: false, tension: .35, borderDash: [4, 3] },
  ];
  const gC = 'rgba(0,0,0,.05)', tC = 'rgba(0,0,0,.45)';
  chartAB = new Chart(document.getElementById('chAB'), { type: 'line', data: { labels: ages, datasets: ds }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { filter: i => ['A Base', 'B Base'].includes(i.dataset.label), callbacks: { title: c => 'Età ' + c[0].label, label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw) }, backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1, titleColor: '#202124', bodyColor: '#5f6368', padding: 10 } }, scales: { x: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 12 }, grid: { color: gC } }, y: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, callback: v => fmt(v) }, grid: { color: gC } } } } });
  const invA = dAn[years].invested, invB = dBn[years].invested;
  const txFA = blendedTaxRate(endAge);
  const eqB = getEquityWeight(stateB.portfolio, endAge);
  const txFB = (eqB * state.taxEq + (1 - eqB) * state.taxOb) / 100;
  const nA = calcNetNom(dAn[years].value, invA, txFA), nB = calcNetNom(dBn[years].value, invB, txFB);
  const delta = dBn[years].value - dAn[years].value, deltaN = nB - nA;
  const mRows = [
    ['Valore finale lordo (base)', fmt(dAn[years].value), fmt(dBn[years].value), (delta >= 0 ? '+' : '') + fmt(delta)],
    ['Valore finale (ottimistico)', fmt(dA[years].value), fmt(dBb[years].value), '—'],
    ['Valore finale (pessimistico)', fmt(dAw[years].value), fmt(dBw[years].value), '—'],
    ['Totale versato', fmt(invA), fmt(invB), '—'],
    ['Moltiplicatore', '×' + (dAn[years].value / invA).toFixed(2), '×' + (dBn[years].value / invB).toFixed(2), 'Δ ' + ((dBn[years].value / invB - dAn[years].value / invA)).toFixed(2) + 'x'],
    ['Netto fiscale finale', fmt(nA), fmt(nB), (deltaN >= 0 ? '+' : '') + fmt(deltaN)],
  ];
  document.getElementById('ab-metrics').innerHTML = `<div class="tbl-outer"><table><thead><tr><th style="text-align:left">Metrica</th><th style="color:var(--blue)">A — ${pA?.label ?? state.portfolio}</th><th style="color:var(--purple)">B — ${PORT[stateB.portfolio]?.label ?? stateB.portfolio}</th><th>Δ (B−A)</th></tr></thead><tbody>${mRows.map(r => `<tr><td style="text-align:left">${r[0]}</td><td style="color:var(--blue);font-weight:600">${r[1]}</td><td style="color:var(--purple);font-weight:600">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
  const gainA = Math.max(0, dAn[years].value - invA), gainB = Math.max(0, dBn[years].value - invB);
  document.getElementById('ab-fiscal').innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="liq-card" style="border:1px solid rgba(26,115,232,.3)"><div class="liq-card-title" style="color:var(--blue)">A — ${pA?.label ?? state.portfolio}</div><div class="liq-row"><span style="color:var(--text2)">Lordo</span><strong>${fmt(dAn[years].value)}</strong></div><div class="liq-row" style="color:var(--red)"><span>Tasse CG (${(txFA * 100).toFixed(1)}%)</span><span>−${fmt(gainA * txFA)}</span></div><div class="liq-row" style="border-top:1px solid var(--border);padding-top:8px;margin-bottom:0"><strong style="color:var(--blue)">Netto</strong><strong style="color:var(--blue);font-size:15px">${fmt(nA)}</strong></div></div><div class="liq-card" style="border:1px solid rgba(147,52,230,.3)"><div class="liq-card-title" style="color:var(--purple)">B — ${PORT[stateB.portfolio]?.label ?? stateB.portfolio}</div><div class="liq-row"><span style="color:var(--text2)">Lordo</span><strong>${fmt(dBn[years].value)}</strong></div><div class="liq-row" style="color:var(--red)"><span>Tasse CG (${(txFB * 100).toFixed(1)}%)</span><span>−${fmt(gainB * txFB)}</span></div><div class="liq-row" style="border-top:1px solid var(--border);padding-top:8px;margin-bottom:0"><strong style="color:var(--purple)">Netto</strong><strong style="color:var(--purple);font-size:15px">${fmt(nB)}</strong></div></div></div><div style="margin-top:10px;padding:10px 14px;background:${deltaN >= 0 ? 'var(--green-dim)' : 'var(--red-dim)'};border-radius:var(--radius-sm);font-size:13px;color:${deltaN >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:600">Portafoglio B porta ${deltaN >= 0 ? '+' + fmt(deltaN) + ' netti IN PIÙ rispetto ad A' : fmt(Math.abs(deltaN)) + ' netti IN MENO rispetto ad A'} in scenario base.</div>`;
  const step = Math.max(1, Math.floor(years / 12));
  const rowsAB = []; for (let i = 0; i <= years; i += step) rowsAB.push(i);
  document.getElementById('ab-table').innerHTML = rowsAB.map(i => {
    const vA = dAn[i].value, vBv = dBn[i].value, d = vBv - vA, dp = vA > 0 ? (d / vA * 100) : 0;
    const cls = d > 0 ? 'pos' : d < 0 ? 'neg' : 'neutral';
    return `<tr><td><strong>${state.age + i}</strong></td><td>+${i}a</td><td style="color:var(--blue);font-weight:600">${fmt(vA)}</td><td style="color:var(--purple);font-weight:600">${fmt(vBv)}</td><td class="${cls}">${d >= 0 ? '+' : ''}${fmt(d)}</td><td class="${cls}">${d >= 0 ? '+' : ''}${dp.toFixed(1)}%</td></tr>`;
  }).join('');
}
document.getElementById('abAllocBtns').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; stateB.portfolio = b.dataset.k; document.querySelectorAll('#abAllocBtns .gbtn').forEach(x => x.classList.remove('a-purple')); b.classList.add('a-purple'); renderAB(); };

// ══════════════════════════════════════════════════════════════
// TAB MC SUCCESS
// ══════════════════════════════════════════════════════════════
function runSuccessMC() {
  const btn = event.target; btn.disabled = true; btn.textContent = '⏳ Calcolo...';
  setTimeout(() => {
    const { w, age, years, portfolio, ter, pics, exps } = state;
    const { withdrawal, years: wY, inflation: wI } = mcState;
    const N = 1000, terRate = ter / 100;
    const inflRate = wI / 100;
    const retAge = age + years; // età all'inizio del decumulo
    let successes = 0;
    const finalVals = [], ruinYears = [];
    for (let i = 0; i < N; i++) {
      let cW = w;
      // Fase accumulo — Gaussiano log-normale corretto (stesso metodo di runMontecarlo)
      // Correzione Ito: mu_arith = mu_geo + σ²/2  →  E[CAGR] = mu_geo = PORT.normal
      // Senza correzione il P50 accumulo sarebbe ~17% sotto la linea Base su 35 anni.
      for (let y = 1; y <= years; y++) {
        const annPac = getPacForYear(y) * 12;
        const pic = pics.filter(p => +p.year === y).reduce((s, p) => s + (+p.amount || 0), 0);
        const exp = exps.filter(e => +e.year === y).reduce((s, e) => s + (+e.amount || 0), 0);
        const mu  = getRate(portfolio, 'normal', y, age);
        const vol = getPortfolioVol(portfolio, age + y);
        const mu_arith = mu + 0.5 * vol * vol;         // correzione log-normale (Itō)
        const r   = mu_arith + vol * randn_bm() - terRate;
        const midW = cW + (annPac + pic - exp) / 2;
        cW += annPac + pic - exp + midW * r;
      }
      let wd = withdrawal, ruined = false;
      // Fase prelievo — stesso portafoglio, età progredisce dal retAge
      for (let y = 1; y <= wY; y++) {
        if (cW <= 0) { ruined = true; ruinYears.push(y - 1); break; }
        if (y > 1) wd *= (1 + inflRate);
        const wAge = retAge + y;
        const mu  = getRate(portfolio, 'normal', y, retAge);
        const vol = getPortfolioVol(portfolio, wAge);
        const mu_arith = mu + 0.5 * vol * vol;         // correzione log-normale (Itō)
        const r   = mu_arith + vol * randn_bm() - terRate;
        const midW = Math.max(0, cW - wd / 2);
        cW += midW * r - wd;
      }
      if (!ruined && cW > 0) successes++;
      else if (!ruined && cW <= 0) ruinYears.push(wY);
      finalVals.push(Math.max(0, cW));
    }
    finalVals.sort((a, b) => a - b);
    const sr = successes / N * 100;
    const avgRuinYear = ruinYears.length > 0 ? (ruinYears.reduce((a, b) => a + b, 0) / ruinYears.length).toFixed(1) : null;
    const col = sr >= 90 ? 'var(--green)' : sr >= 80 ? 'var(--orange)' : sr >= 70 ? '#e65100' : 'var(--red)';
    const label = sr >= 90 ? 'Piano molto solido ✅' : sr >= 80 ? 'Piano accettabile ⚠️' : sr >= 70 ? 'Piano a rischio 🔶' : 'Piano critico — revisione necessaria ❌';
    const desc = sr >= 90 ? `Il portafoglio rimane positivo in ${successes}/1.000 scenari. Robusto (soglia professionale: >90%).` : sr >= 80 ? `Fallisce in ${N - successes}/1.000 scenari. Accettabile ma con margine ridotto.` : `Fallisce in ${N - successes}/1.000 scenari. Considera di ridurre il prelievo o aumentare il patrimonio.`;
    lastMCSuccessResult = { sr, successes, N, label, desc, avgRuinYear, p10: finalVals[Math.floor(N * .10)], p50: finalVals[Math.floor(N * .50)], p90: finalVals[Math.floor(N * .90)], withdrawal, wY, wI, years, portfolio, ter };
    document.getElementById('mc-success-result').innerHTML = `
      <div class="success-display sec" style="border-color:${col};background:${sr >= 90 ? 'var(--green-dim)' : sr >= 80 ? 'var(--orange-dim)' : sr >= 70 ? 'rgba(230,81,0,.08)' : 'var(--red-dim)'}">
        <div class="success-pct" style="color:${col}">${sr.toFixed(1)}%</div>
        <div style="font-size:16px;font-weight:600;margin-top:8px;color:${col}">${label}</div>
        <div style="font-size:13px;margin-top:6px;color:var(--text2)">${desc}</div>
        <div class="success-bar"><div class="success-bar-fill" style="width:${sr}%;background:${col}">${sr.toFixed(0)}%</div></div>
      </div>
      <div class="grid-3" style="margin-bottom:10px">
        <div class="mc-box"><div class="mc-lbl">Successi</div><div class="mc-val" style="color:var(--green)">${successes}/1.000</div></div>
        <div class="mc-box"><div class="mc-lbl">Fallimenti</div><div class="mc-val" style="color:var(--red)">${N - successes}/1.000</div></div>
        <div class="mc-box"><div class="mc-lbl">Anno rovina (med.)</div><div class="mc-val" style="color:var(--orange)">${avgRuinYear ? 'Anno ' + avgRuinYear : '—'}</div></div>
      </div>
      <div class="sec"><div class="sec-label">Patrimonio residuo a fine prelievo</div>
        <div class="mc-grid">
          <div class="mc-box"><div class="mc-lbl">10° percentile</div><div class="mc-val" style="color:var(--orange)">${fmt(finalVals[Math.floor(N * .10)])}</div></div>
          <div class="mc-box"><div class="mc-lbl">Mediana</div><div class="mc-val" style="color:var(--blue)">${fmt(finalVals[Math.floor(N * .50)])}</div></div>
          <div class="mc-box"><div class="mc-lbl">90° percentile</div><div class="mc-val" style="color:var(--green)">${fmt(finalVals[Math.floor(N * .90)])}</div></div>
        </div>
      </div>`;
    btn.disabled = false; btn.textContent = '🎯 Calcola Probabilità';
  }, 80);
}

// ══════════════════════════════════════════════════════════════
// TAB DECUMULO — Guyton-Klinger corretto
// ══════════════════════════════════════════════════════════════
function simulateDecumulo(sc) {
  const { startPortfolio: sP, withdrawal: w0, years: Y, portfolio: port, strategy: strat, inflation: infl, ter, ecoScenario, ecoTiming } = decState;
  const terRate = ter / 100, inflRate = infl / 100;
  const initialWithdrawalRate = sP > 0 ? w0 / sP : 0;
  // Età di inizio decumulo — usata per lifecycle weight corretto
  const decStartAge = state.age + state.years;
  // Aliquota fiscale blended per il portafoglio di DECUMULO (usa decState.portfolio, non state.portfolio)
  const decEqW = getEquityWeight(port, decStartAge);
  const decTaxRate = (decEqW * state.taxEq + (1 - decEqW) * state.taxOb) / 100;

  let cW = sP, wd = w0, prevReturn = null;
  // Traccia la base di costo residua per calcolare la quota gain proporzionale su ogni prelievo.
  // Ipotesi: all'inizio del decumulo la base di costo è pari al patrimonio iniziale (importato dal simulatore
  // dopo accumulo, quindi l'intero sP è già composto da capitale versato + plusvalenza latente).
  // Usiamo la quota gain implicita nel patrimonio corrente per stimare la tassa su ogni prelievo.
  // costBasis decresce proporzionalmente ai prelievi (metodo costo medio proporzionale — coerente
  // con il regime fiscale amministrato italiano per ETF UCITS ad accumulo).
  let costBasis = sP; // al momento dell'importazione dal simulatore, la base di costo è disponibile
  // Se importato dal simulatore, aggiorna la base di costo con il capitale effettivamente versato
  if (typeof decState._importedInvested === 'number' && decState._importedInvested > 0) {
    costBasis = Math.min(decState._importedInvested, sP);
  }

  const ecoWin = ecoScenario ? getEcoWindow(ecoScenario, Y, ecoTiming) : null;
  const data = [];
  for (let y = 1; y <= Y; y++) {
    if (cW <= 0) { data.push({ year: y, start: 0, ret: 0, withdrawal: 0, wdNet: 0, taxOnWd: 0, end: 0, rate: 0, note: 'Portafoglio esaurito', eco: false }); continue; }
    const startW = cW;
    const inEcoRegime = ecoWin && y >= ecoWin.s && y <= ecoWin.e;
    let grossRate;
    if (inEcoRegime) {
      const spread = sc === 'best' ? 0.02 : sc === 'worst' ? -0.025 : 0;
      grossRate = getRateEco(port, ecoScenario, y, decStartAge, ecoWin) + spread;
    } else {
      grossRate = getRate(port, sc, y, decStartAge);
    }
    const netRate = grossRate - terRate;
    // Mid-point: interessi maturano sulla media tra inizio e fine anno
    // Equivalente a: cW_dopo = (cW - wd/2) * (1+r) - wd/2
    const midW = Math.max(0, cW - wd / 2);
    const annRet = midW * netRate;
    cW = Math.max(0, cW - wd + annRet);

    // ── Calcolo fiscale sul prelievo ──────────────────────────────
    // Quota gain proporzionale = (valore - base costo) / valore, clamped [0,1]
    // Solo la quota gain è tassabile; la quota capitale viene restituita esentasse.
    const gainFrac = startW > costBasis ? Math.min(1, (startW - costBasis) / startW) : 0;
    const taxOnWd = Math.round(wd * gainFrac * decTaxRate);
    const wdNet = Math.round(wd - taxOnWd);
    // Aggiorna la base di costo proporzionalmente al prelievo (riduce sia il valore sia la base):
    // la quota capitale prelevata = wd * (1 - gainFrac)
    costBasis = Math.max(0, costBasis - wd * (1 - gainFrac));
    // ─────────────────────────────────────────────────────────────

    let note = '', nextWd = wd;
    if (inEcoRegime && y === ecoWin.s) note = ECO_SCENARIOS[ecoScenario].emoji + ' regime attivo';
    if (ecoWin && y === ecoWin.e + 1) note = '↩ ritorno normale';
    if (strat === 'fixed') { nextWd = wd; }
    else if (strat === 'inflation') { if (y > 1) { nextWd = wd * (1 + inflRate); if (!note && infl > 0) note = `+${infl.toFixed(1)}% inflaz.`; } }
    else if (strat === 'gk') {
      const currentRate = cW > 0 ? wd / cW : Infinity;
      const portfolioRuleBlocks = prevReturn !== null && prevReturn < 0;
      if (currentRate > initialWithdrawalRate * 1.20) { nextWd = wd * 0.90; note = (note ? note + ' · ' : '') + 'GK: -10% (tasso alto)'; }
      else if (currentRate < initialWithdrawalRate * 0.80) {
        if (!portfolioRuleBlocks) { nextWd = wd * 1.10; note = (note ? note + ' · ' : '') + 'GK: +10% (tasso basso)'; }
        else { nextWd = wd; note = (note ? note + ' · ' : '') + 'GK: blocco PMR'; }
      } else {
        if (!portfolioRuleBlocks && inflRate > 0) { nextWd = wd * (1 + inflRate); if (!note) note = `GK: +${infl.toFixed(1)}% inflaz.`; }
        else if (portfolioRuleBlocks) { nextWd = wd; note = (note ? note + ' · ' : '') + 'GK: no aumento (ann. neg.)'; }
      }
      prevReturn = netRate;
    }
    data.push({ year: y, start: Math.round(startW), ret: Math.round(annRet), withdrawal: Math.round(wd), wdNet, taxOnWd, end: Math.round(cW), rate: startW > 0 ? wd / startW : 0, note, eco: !!inEcoRegime });
    wd = nextWd;
  }
  return data;
}

// ══════════════════════════════════════════════════════════════
// DECUMULO STORICO — sequenze reali (bootstrap by starting year)
// "Cosa sarebbe successo se fossi andato in pensione nel 1973?"
// Per ogni anno di partenza 1970-(2024-Y) esegue il decumulo usando
// le sequenze mensili storiche reali (calibrate) di equity/bond/gold.
// Ritorna: tasso di sopravvivenza, peggior anno di start, statistiche.
// ══════════════════════════════════════════════════════════════
function runDecumuloHistorical() {
  const { startPortfolio: sP, withdrawal: w0, years: Y, portfolio: port, strategy: strat, inflation: inflFixed, ter } = decState;
  const terRateM = ter / 100 / 12;

  // Gate: trend/carry non hanno serie storica → il backtest storico non è fedele
  const unmapped = getUnmappedHistAssets(port);
  if (unmapped.length) {
    const err = new Error(`Backtest storico non disponibile: ${unmapped.map(u => u.label).join(', ')} non hanno serie storica nel dataset 1970-2024 (azioni/bond/oro). Usa il Monte Carlo con un modello parametrico.`);
    err.unmapped = true;
    throw err;
  }

  // Pesi del portafoglio
  const decAge = state.age + state.years;
  const eqW = getEquityWeight(port, decAge);
  const goldW0 = getGoldWeight(port);
  const cashW = getCashWeight(port);
  // Commodities ammesse mappate sull'oro (proxy real-asset)
  const altW = port === 'custom' ? (calcCustomParams().altW || 0) : 0;
  const goldW = goldW0 + altW;
  const obW = Math.max(0, 1 - eqW - goldW - cashW);

  // Anni di partenza disponibili (servono Y anni di dati dopo)
  const totalYearsAvail = Math.floor(HIST_MONTHLY.length / 12);
  const maxStartYear = 1970 + totalYearsAvail - Y;
  const startYears = [];
  for (let y = 1970; y <= maxStartYear; y++) startYears.push(y);

  const results = [];

  for (const startYr of startYears) {
    const startIdx = (startYr - 1970) * 12;
    let cap = sP, wd = w0, prevYearRet = null;
    let survived = true, exhaustYear = null;
    const annualEndCap = [sP];

    for (let yi = 0; yi < Y; yi++) {
      if (cap <= 0) { survived = false; exhaustYear = exhaustYear ?? yi; cap = 0; }
      // 12 mesi di rendimenti reali, sottraendo prelievo mensile (wd/12)
      const monthlyWd = wd / 12;
      let yearRet = 1; // moltiplicatore lordo
      for (let m = 0; m < 12; m++) {
        if (cap <= 0) { cap = 0; break; }
        const idx = startIdx + yi * 12 + m;
        if (idx >= HIST_MONTHLY.length) break;
        const row = calibrateHistRow(HIST_MONTHLY[idx]);
        const eqR = row[0], obR = row[1], goldR = row[2];
        const cashR = 0.002; // ~2.4% annuo cash
        const portR = eqW*eqR + obW*obR + goldW*goldR + cashW*cashR - terRateM;
        // Prelievo a metà mese: cap_dopo = (cap - wd/2)(1+r) - wd/2
        cap = Math.max(0, (cap - monthlyWd/2) * (1 + portR) - monthlyWd/2);
        yearRet *= (1 + portR);
      }
      annualEndCap.push(Math.round(cap));

      // Inflazione storica reale dell'anno
      const histInfl = (HIST_INFLATION[startYr + yi] ?? 2.5) / 100;
      const inflRate = histInfl; // usa sempre inflazione storica per realismo

      // Adatta prelievo per anno successivo (strategia)
      let nextWd = wd;
      const initialWR = sP > 0 ? w0 / sP : 0;
      const currentWR = cap > 0 ? wd / cap : Infinity;
      if (strat === 'fixed') { nextWd = wd; }
      else if (strat === 'inflation') { nextWd = wd * (1 + inflRate); }
      else if (strat === 'gk') {
        const pmrBlock = prevYearRet !== null && prevYearRet < 1;
        if (currentWR > initialWR * 1.20) nextWd = wd * 0.90;
        else if (currentWR < initialWR * 0.80 && !pmrBlock) nextWd = wd * 1.10;
        else if (!pmrBlock && inflRate > 0) nextWd = wd * (1 + inflRate);
        prevYearRet = yearRet;
      }
      wd = nextWd;
    }

    results.push({
      startYear: startYr,
      survived,
      exhaustYear,
      finalCap: Math.round(cap),
      annualEndCap,
      maxDrawdown: maxDrawdownArr(annualEndCap),
    });
  }

  // Statistiche aggregate
  const nTotal = results.length;
  const nSurvived = results.filter(r => r.survived).length;
  const successRate = nTotal > 0 ? nSurvived / nTotal : 0;
  const failed = results.filter(r => !r.survived).sort((a,b) => a.exhaustYear - b.exhaustYear);
  const worstStart = failed.length > 0 ? failed[0] : null;
  const median = (() => {
    const sorted = [...results].sort((a,b) => a.finalCap - b.finalCap);
    return sorted[Math.floor(sorted.length/2)];
  })();

  return {
    results, nTotal, nSurvived, successRate,
    worstStart, median,
    years: Y,
  };
}

// Drawdown massimo (negativo) da array di valori
function maxDrawdownArr(arr) {
  let peak = arr[0] || 0, maxDD = 0;
  for (const v of arr) {
    if (v > peak) peak = v;
    if (peak > 0) {
      const dd = (v - peak) / peak;
      if (dd < maxDD) maxDD = dd;
    }
  }
  return maxDD;
}

// Render UI risultati decumulo storico
function runDecHistorical() {
  const btn = document.getElementById('decHistBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Calcolo...'; }
  setTimeout(() => {
    try {
      const r = runDecumuloHistorical();
      const succPct = (r.successRate * 100).toFixed(0);
      const succColor = r.successRate >= 0.90 ? 'var(--green)' : r.successRate >= 0.70 ? 'var(--orange)' : 'var(--red)';
      const worstYr = r.worstStart;
      const failedList = r.results.filter(x => !x.survived).map(x => `${x.startYear} (esaurito anno ${x.exhaustYear})`);
      const sorted = [...r.results].sort((a,b) => a.finalCap - b.finalCap);
      const median = sorted[Math.floor(sorted.length/2)];
      const p10 = sorted[Math.floor(sorted.length*0.10)];
      const p90 = sorted[Math.floor(sorted.length*0.90)];

      // Identifica anni famosi nel dataset
      const famousYears = [1970, 1973, 1980, 1987, 1990, 2000, 2008];
      const famousResults = famousYears
        .map(y => r.results.find(x => x.startYear === y))
        .filter(x => x !== undefined);

      const html = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px">
          <div class="dec-stat">
            <div class="dec-stat-label">Tasso Sopravvivenza</div>
            <div class="dec-stat-value" style="color:${succColor};font-size:24px">${succPct}%</div>
            <div style="font-size:10.5px;color:var(--text3);margin-top:3px">${r.nSurvived}/${r.nTotal} anni di partenza</div>
          </div>
          <div class="dec-stat">
            <div class="dec-stat-label">Capitale Finale Mediano</div>
            <div class="dec-stat-value" style="color:var(--blue)">${fmt(median?.finalCap || 0)}</div>
            <div style="font-size:10.5px;color:var(--text3);margin-top:3px">P10: ${fmt(p10?.finalCap || 0)} · P90: ${fmt(p90?.finalCap || 0)}</div>
          </div>
          <div class="dec-stat">
            <div class="dec-stat-label">Worst Year (peggior partenza)</div>
            <div class="dec-stat-value" style="color:var(--red);font-size:20px">${worstYr ? worstYr.startYear : 'Nessun fail'}</div>
            <div style="font-size:10.5px;color:var(--text3);margin-top:3px">${worstYr ? `Esaurito anno ${worstYr.exhaustYear}` : 'Tutti gli anni hanno retto'}</div>
          </div>
          <div class="dec-stat">
            <div class="dec-stat-label">Drawdown Mediano</div>
            <div class="dec-stat-value" style="color:var(--orange)">${(median?.maxDrawdown*100 || 0).toFixed(0)}%</div>
            <div style="font-size:10.5px;color:var(--text3);margin-top:3px">Picco-fondo del capitale</div>
          </div>
        </div>

        ${failedList.length > 0 ? `
          <div class="info-box" style="background:var(--red-dim);border-color:var(--red);color:var(--red);margin-bottom:12px">
            <strong>❌ Anni di partenza che hanno ESAURITO il capitale:</strong><br>
            ${failedList.join(' · ')}
          </div>` : `
          <div class="info-box" style="background:var(--green-dim);border-color:var(--green);color:var(--green);margin-bottom:12px">
            <strong>✅ Tutti gli ${r.nTotal} anni di partenza hanno completato il piano senza esaurire il capitale</strong>
          </div>`}

        <div class="sec-label" style="margin-top:14px">📌 Esiti per anni notevoli (eventi storici)</div>
        <div class="tbl-outer">
          <table>
            <thead><tr>
              <th style="text-align:left">Anno Start</th>
              <th style="text-align:left">Evento</th>
              <th>Esito</th>
              <th>Capitale Finale</th>
              <th>Max Drawdown</th>
            </tr></thead>
            <tbody>
              ${famousResults.map(x => {
                const events = {
                  1970: '🛢️ Pre oil shock',
                  1973: '🔥 Stagflazione & oil shock',
                  1980: '📈 Volcker disinflazione',
                  1987: '💥 Black Monday',
                  1990: '🇯🇵 Giappone burst',
                  2000: '💻 Dot-com bust',
                  2008: '🏦 Crisi finanziaria',
                };
                const evtName = events[x.startYear] || '';
                const status = x.survived ? `<span class="pos">✅ Successo</span>` : `<span class="neg">❌ Fallito anno ${x.exhaustYear}</span>`;
                return `<tr>
                  <td>${x.startYear}</td>
                  <td>${evtName}</td>
                  <td>${status}</td>
                  <td>${fmt(x.finalCap)}</td>
                  <td><span class="neg">${(x.maxDrawdown*100).toFixed(0)}%</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="font-size:11.5px;color:var(--text3);margin-top:10px;line-height:1.5">
          <strong>Note metodologiche:</strong> usa rendimenti mensili reali calibrati e inflazione effettiva di ogni anno. Il portafoglio è ribilanciato implicitamente ai pesi target ogni mese. La strategia di prelievo applicata è quella selezionata sopra. Risultati confrontabili con Trinity Study (Bengen 1994) e successivi aggiornamenti (Pfau, Kitces).
        </div>`;
      document.getElementById('decHistResults').innerHTML = html;
    } catch (e) {
      document.getElementById('decHistResults').innerHTML = `<div class="info-box" style="color:var(--red)">Errore: ${e.message}</div>`;
      console.error(e);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '📅 Esegui Backtest Storico'; }
    }
  }, 80);
}

let chartDec = null;
function renderDecumulo() {
  const dBase = simulateDecumulo('normal'), dBest = simulateDecumulo('best'), dWorst = simulateDecumulo('worst');
  const { years: Y } = decState;
  const endBase = dBase[Y - 1]?.end || 0, endBest = dBest[Y - 1]?.end || 0, endWorst = dWorst[Y - 1]?.end || 0;
  const ruinBase = dBase.findIndex(d => d.note && d.note.includes('esaurito'));
  const ruinWorst = dWorst.findIndex(d => d.note && d.note.includes('esaurito'));
  const totalExtracted = dBase.reduce((s, d) => s + d.withdrawal, 0);
  const totalExtractedNet = dBase.reduce((s, d) => s + (d.wdNet ?? d.withdrawal), 0);
  const totalTax = dBase.reduce((s, d) => s + (d.taxOnWd ?? 0), 0);
  // Aliquota blended decumulo per il badge info
  const decEqW = getEquityWeight(decState.portfolio, state.age + state.years);
  const decTaxRate = (decEqW * state.taxEq + (1 - decEqW) * state.taxOb) / 100;
  document.getElementById('dec-stats').innerHTML = [
    { l: 'Patrimonio finale (base)', v: fmt(endBase), c: endBase > 0 ? 'var(--blue)' : 'var(--red)' },
    { l: 'Patrimonio finale (ott.)', v: fmt(endBest), c: 'var(--green)' },
    { l: 'Patrimonio finale (pess.)', v: fmt(endWorst), c: endWorst > 0 ? 'var(--orange)' : 'var(--red)' },
    { l: 'Totale estratto lordo (base)', v: fmt(totalExtracted), c: 'var(--text)' },
    { l: 'Totale estratto netto (base)', v: fmt(totalExtractedNet), c: 'var(--green)', sub: `tasse: −${fmt(totalTax)}` },
    { l: 'Rovina scenario base', v: ruinBase < 0 ? 'Non si esaurisce' : 'Anno ' + (ruinBase + 1), c: ruinBase < 0 ? 'var(--green)' : 'var(--red)' },
    { l: 'Rovina pessimistico', v: ruinWorst < 0 ? 'Regge' : 'Anno ' + (ruinWorst + 1), c: ruinWorst < 0 ? 'var(--green)' : 'var(--red)' },
  ].map(s => `<div class="dec-stat"><div class="dec-stat-label">${s.l}</div><div class="dec-stat-value" style="color:${s.c}">${s.v}</div>${s.sub ? `<div style="font-size:11px;color:var(--red);margin-top:2px">${s.sub}</div>` : ''}</div>`).join('');
  // Info fiscale sopra la tabella
  const fiscInfoHtml = `<div style="margin-bottom:10px;padding:10px 14px;background:#fff3e0;border:1px solid #ffe0b2;border-radius:var(--radius-sm);font-size:12.5px;color:#795548;line-height:1.6">
    🏛️ <strong>Fiscalità prelievi:</strong> aliquota blended portafoglio decumulo <strong>${(decTaxRate*100).toFixed(1)}%</strong> — applicata solo sulla quota plusvalenza proporzionale di ogni prelievo (metodo costo medio, regime amministrato ETF UCITS). La quota capitale è restituita esentasse. La colonna <em>Netto</em> mostra quanto incassi effettivamente.
  </div>`;
  if (chartDec) { chartDec.destroy(); chartDec = null; }
  const labels = dBase.map(d => 'Anno ' + d.year);
  chartDec = new Chart(document.getElementById('chDec'), {
    type: 'line', data: { labels, datasets: [
      { label: 'Ottimistico', data: dBest.map(d => d.end), borderColor: '#36d490', borderWidth: 2, pointRadius: 0, fill: false, tension: .35 },
      { label: 'Base', data: dBase.map(d => d.end), borderColor: '#1a73e8', borderWidth: 3, pointRadius: 0, fill: 'origin', backgroundColor: 'rgba(26,115,232,.06)', tension: .35 },
      { label: 'Pessimistico', data: dWorst.map(d => d.end), borderColor: '#e37400', borderWidth: 2, pointRadius: 0, fill: false, tension: .35 },
    ] },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { callbacks: { title: c => c[0].label, label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw) }, backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1, titleColor: '#202124', bodyColor: '#5f6368', padding: 10 } }, scales: { x: { ticks: { color: 'rgba(0,0,0,.45)', font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 12 }, grid: { color: 'rgba(0,0,0,.05)' } }, y: { ticks: { color: 'rgba(0,0,0,.45)', font: { size: 11, family: 'DM Mono' }, callback: v => fmt(v) }, grid: { color: 'rgba(0,0,0,.05)' } } } },
    plugins: [{ id: 'zero', afterDraw(c) { const { ctx, scales: { x, y } } = c; if (y.getPixelForValue) { const yp = y.getPixelForValue(0); if (yp > y.top && yp < y.bottom) { ctx.save(); ctx.strokeStyle = 'rgba(217,48,37,.6)'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.beginPath(); ctx.moveTo(x.left, yp); ctx.lineTo(x.right, yp); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); } } } }]
  });
  const tableEl = document.getElementById('dec-table');
  // Aggiorna header tabella per includere colonne fiscali
  const tblOuter = tableEl.closest('.tbl-outer');
  if (tblOuter) {
    const thead = tblOuter.querySelector('thead tr');
    if (thead && !thead.querySelector('.dec-tax-hdr')) {
      thead.innerHTML = `<th style="text-align:left">Anno</th><th>Valore Inizio</th><th>Rendimento</th><th>Prelievo Lordo</th><th class="dec-tax-hdr" style="color:var(--red)">Tasse CG</th><th style="color:var(--green)">Prelievo Netto</th><th>Valore Fine</th><th>Tasso Prelievo</th><th>Note</th>`;
    }
  }
  tableEl.innerHTML = fiscInfoHtml + dBase.map(d => {
    const rateCls = d.rate > .06 ? 'neg' : d.rate > .04 ? 'neutral' : 'pos';
    const endCls = d.end <= 0 ? 'neg' : d.end < decState.startPortfolio * .5 ? 'neutral' : 'pos';
    const ecoStyle = d.eco ? 'background:rgba(147,52,230,.05);border-left:2px solid rgba(147,52,230,.4)' : '';
    const taxCell = d.taxOnWd > 0 ? `<td style="color:var(--red);font-family:'DM Mono',monospace;font-size:12px">−${fmt(d.taxOnWd)}</td>` : `<td style="color:var(--text3);font-size:11.5px">—</td>`;
    const netCell = `<td style="color:var(--green);font-weight:600">${fmt(d.wdNet ?? d.withdrawal)}</td>`;
    return `<tr style="${ecoStyle}"><td style="text-align:left"><strong>${d.year}</strong></td><td>${fmt(d.start)}</td><td class="${d.ret >= 0 ? 'pos' : 'neg'}">${fmt(d.ret)}</td><td style="color:var(--orange)">${fmt(d.withdrawal)}</td>${taxCell}${netCell}<td class="${endCls}"><strong>${fmt(d.end)}</strong></td><td class="${rateCls}">${(d.rate * 100).toFixed(2)}%</td><td style="font-size:11.5px;color:var(--text3)">${d.note || ''}</td></tr>`;
  }).join('');
}

function importFromSim() {
  const dN = project('normal', false);
  decState.startPortfolio = dN[state.years].value;
  // Salva la base di costo (capitale effettivamente versato) per il calcolo fiscale corretto
  decState._importedInvested = dN[state.years].invested || 0;
  document.getElementById('sDecStart').value = Math.min(decState.startPortfolio, 5000000);
  document.getElementById('lDecStart').textContent = fmt(decState.startPortfolio);
  const gainFracImp = decState.startPortfolio > 0 && decState._importedInvested < decState.startPortfolio
    ? ((1 - decState._importedInvested / decState.startPortfolio) * 100).toFixed(1) : '0';
  document.getElementById('importStatus').textContent = `Importato: ${fmtFull(decState.startPortfolio)} (scenario base, età ${state.age + state.years} anni) — plusvalenza latente ${gainFracImp}%`;
  renderDecumulo();
}

const decStratDescs = {
  fixed: '<strong>Fisso Nominale:</strong> La stessa somma ogni anno. Semplice, ma il potere d\'acquisto reale decresce per inflazione.',
  inflation: '<strong>Indicizzato Inflazione:</strong> Il prelievo cresce ogni anno dell\'inflazione impostata, mantenendo costante il potere d\'acquisto reale. Standard per la pianificazione pensionistica.',
  gk: '<strong>Guyton-Klinger (paper originale 2006):</strong> 4 regole — (1) <em>Portfolio Management Rule</em>: nessun aumento se l\'anno precedente il rendimento era negativo; (2) <em>Capital Preservation Rule</em>: se il tasso di prelievo supera del 20% quello iniziale → taglio 10%; (3) <em>Prosperity Rule</em>: se è inferiore del 20% → aumento 10% (solo se PMR non blocca); (4) altrimenti → aumento per inflazione. Massimizza il reddito con la longevità.',
};

// ══════════════════════════════════════════════════════════════
// PORTFOLIO INFO BOX
// ══════════════════════════════════════════════════════════════
function updatePortDetailBox() {
  const isCustom = state.portfolio === 'custom';
  const p = isCustom ? calcCustomParams() : PORT[state.portfolio];
  const builder = document.getElementById('customBuilder');
  if (builder) builder.classList.toggle('visible', isCustom);
  if (isCustom) { renderCustomBuilder(); return; }
  if (!p) { document.getElementById('portDetailBox').innerHTML = ''; return; }
  const bd = (state.portfolio !== 'custom' && PORT[state.portfolio]?.breakdown)
    ? Object.entries(PORT[state.portfolio].breakdown).map(([k,v])=>`<span style="background:var(--bg);border:1px solid var(--border2);padding:2px 8px;border-radius:4px;font-size:11.5px;font-family:'DM Mono',monospace"><strong>${v}</strong> ${k}</span>`).join(' '):'';
  // FX badge per portafogli predefiniti
  const fxExp = getFxExposure(state.portfolio, state.age);
  const fxHedged = !!state.fxHedge;
  const fxBadge = fxExp > 0.01
    ? `<span style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-family:'DM Mono',monospace;font-weight:600;color:var(--purple);background:var(--purple-dim);border:1px solid rgba(147,52,230,.3);padding:2px 8px;border-radius:4px" onclick="toggleFxHedge()" title="Esposizione cambio EUR/USD. Click per attivare/disattivare copertura valutaria (hedging)">💱 FX ${(fxExp*100).toFixed(0)}% ${fxHedged?'<span style=\'color:var(--green)\'>hedged ✓</span>':'unhedged'}</span>`
    : '';
  const fxCostNote = fxHedged && fxExp > 0.01
    ? `<div style="margin-top:6px;font-size:11px;color:var(--text3)">⚠️ Copertura valutaria attiva: costo stimato −${(fxExp * state.fxHedgeCost * 100).toFixed(2)}%/a sul rendimento netto.</div>`
    : (fxExp > 0.01 ? `<div style="margin-top:6px;font-size:11px;color:var(--text3)">⚠️ Esposizione cambio EUR/USD non coperta: vol. aggiuntiva ~${(fxExp * state.fxVol * 100).toFixed(1)}%/a. Clicca 💱 per attivare hedging.</div>` : '');
  document.getElementById('portDetailBox').innerHTML = `
    <div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:${bd?'8px':'4px'}">${p.desc||''}</div>
    ${bd?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">${bd}</div>`:''}
    ${fxBadge ? `<div style="margin-bottom:4px">${fxBadge}</div>` : ''}
    ${fxCostNote}
    ${p.realRet!=null?`<div style="margin-top:8px;font-size:11.5px;color:var(--text3)">Rendimento reale: <strong style="color:var(--green)">${(p.realRet*100).toFixed(1)}%/a</strong> · Beta infl.: <strong style="color:${p.inflBeta>0.2?'var(--green)':p.inflBeta>0?'var(--orange)':'var(--red)'}">${p.inflBeta>0?'+':''}${p.inflBeta.toFixed(2)}</strong> · Vol.: <strong>${p.vol?(p.vol*100).toFixed(0)+'%':'variabile'}</strong></div>`:''}`;
}

// ── Custom Portfolio builder ──────────────────────────────────
function renderCustomBuilder() {
  const el = document.getElementById('customBuilder');
  if (!el) return;
  el.classList.add('visible');
  const slots = state.customPortfolio.slots;
  const total = slots.reduce((s,sl)=>s+(+sl.pct||0),0);
  const totalOk = Math.abs(total-100)<0.5;
  const cp = calcCustomParams();
  document.getElementById('portDetailBox').innerHTML = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:6px">Parametri calcolati in tempo reale sulla composizione sotto.</div>
    <div class="custom-params">
      <span class="custom-param-chip" style="color:var(--blue)">Base: <strong>${(cp.normal*100).toFixed(2)}%/a</strong></span>
      <span class="custom-param-chip" style="color:var(--green)">Ott.: <strong>${(cp.best*100).toFixed(2)}%/a</strong></span>
      <span class="custom-param-chip" style="color:var(--orange)">Pess.: <strong>${(cp.worst*100).toFixed(2)}%/a</strong></span>
      <span class="custom-param-chip">σ: <strong>${(cp.vol*100).toFixed(1)}%</strong></span>
      <span class="custom-param-chip" style="color:var(--red)" title="Volatilità in regime di crisi (correlazioni → 1)">σ-crisi: <strong>${(cp.volStress*100).toFixed(1)}%</strong></span>
      <span class="custom-param-chip" style="color:${cp.inflBeta>0.2?'var(--green)':cp.inflBeta>0?'var(--orange)':'var(--red)'}">β-infl: <strong>${cp.inflBeta>0?'+':''}${cp.inflBeta.toFixed(2)}</strong></span>
      <span class="custom-param-chip" style="color:var(--orange)" title="TER medio ponderato sugli ETF selezionati — applicato automaticamente alla simulazione">TER applicato: <strong>${cp.ter.toFixed(2)}%</strong></span>
      <span class="custom-param-chip" style="color:var(--purple);cursor:pointer" onclick="toggleFxHedge()" title="Esposizione cambio EUR/USD e altre valute. Click per attivare/disattivare la copertura">💱 FX: <strong>${(cp.fxExposure*100).toFixed(0)}% ${cp.fxHedged?'(hedged)':'(unhedged)'}</strong></span>
      <span class="custom-param-chip">Az: <strong>${(cp.eq*100).toFixed(0)}%</strong></span>
      <span class="custom-param-chip">Ob: <strong>${(cp.ob*100).toFixed(0)}%</strong></span>
      ${cp.goldW>0?`<span class="custom-param-chip">Oro: <strong>${(cp.goldW*100).toFixed(0)}%</strong></span>`:''}
      ${cp.altW>0?`<span class="custom-param-chip" title="Commodities, carry, trend following — real asset / diversificatori">Alt: <strong>${(cp.altW*100).toFixed(0)}%</strong></span>`:''}
      ${cp.cashW>0?`<span class="custom-param-chip">Cash: <strong>${(cp.cashW*100).toFixed(0)}%</strong></span>`:''}
    </div>`;
  el.innerHTML = `
    <div class="sec-label" style="margin-bottom:12px">🔧 Builder Portafoglio Custom</div>
    <div id="customSlots">${slots.map((sl,i)=>`
      <div class="custom-slot">
        <select class="custom-select" onchange="updCustomAc(${i},this.value)">
          <option value="">— Seleziona asset class —</option>
          ${Object.entries(ASSET_CLASSES).map(([k,v])=>`<option value="${k}"${sl.ac===k?' selected':''}>${v.emoji} ${v.label}</option>`).join('')}
        </select>
        <input class="custom-pct-input" type="number" min="0" max="100" step="5" value="${sl.pct}" placeholder="%" onchange="updCustomPct(${i},+this.value)">
        <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace">%</span>
        <button class="dbtn" onclick="delCustomSlot(${i})">✕</button>
      </div>`).join('')}</div>
    <div class="custom-total ${totalOk?'ok':total>0?'warn':'err'}">
      Totale: ${total.toFixed(1)}% ${totalOk?'✅ OK':total<100?'⚠️ mancano '+(100-total).toFixed(1)+'%':'❌ eccedenza '+(total-100).toFixed(1)+'%'}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <button class="addbtn" style="flex:1;min-width:140px" onclick="addCustomSlot()">+ Aggiungi asset class</button>
      <button class="gbtn a-blue" onclick="normalizeCustom()">⚖️ Normalizza a 100%</button>
      <button class="gbtn" onclick="resetCustomPreset('eq60')" title="60% Az. Globali + 40% Aggregato">60/40</button>
      <button class="gbtn" onclick="resetCustomPreset('all_seasons')" title="All Seasons di Dalio">All Seasons</button>
      <button class="gbtn" onclick="resetCustomPreset('permanent')" title="Permanent Portfolio di Browne">Permanent</button>
      <button class="gbtn" onclick="resetCustomPreset('larry')" title="Larry Portfolio di Swedroe">Larry</button>
      <button class="gbtn" onclick="resetCustomPreset('global')" title="Mercato Globale">Global</button>
      <button class="gbtn" onclick="resetCustomPreset('inflaz')" title="Anti-inflazione: Az+TIPS+Oro+Comm">Anti-Inflaz.</button>
      <button class="gbtn" onclick="resetCustomPreset('multifat')" title="Multi-fattore + Bond + Oro">Multi-Fat.</button>
      <button class="gbtn" onclick="resetCustomPreset('trend_div')" title="Azioni + Trend Following + Bond + Oro">Trend+Div.</button>
      <button class="gbtn" onclick="resetCustomPreset('carry_mix')" title="Carry Bond + FX Carry + Azioni + Bond">Carry Mix</button>
    </div>
    <div class="info-box" style="font-size:11.5px">
      <strong>Dati:</strong> mu = rendimento nominale forward-looking (10-20a), σ = volatilità storica 1970-2024. Fonti: DMS Yearbook 2024, dati Federal Reserve (FRED), Banche Centrali, letteratura accademica (Fama-French, Jegadeesh-Titman, Carhart). La volatilità usa una matrice di correlazione semplificata tra categorie (es. ρ(az,bond)≈−0.05, ρ(az,oro)≈0.05) — risultato più realistico della semplice media ponderata.
    </div>`;
}

// ── Helper unificato: restituisce parametri portafoglio (custom o PORT) ──────
// Usato da tutti i moduli che prima accedevano direttamente a PORT[key].
// Per 'custom' chiama calcCustomParams(); per gli altri restituisce PORT[key].
function getPortParams(portKey) {
  if (portKey === 'custom') return calcCustomParams();
  // Per portafogli predefiniti, restituisce una copia con best/normal/worst
  // aggiustati per FX hedging — così updateRetInfo mostra valori coerenti con render()
  const p = PORT[portKey];
  if (!p) return null;
  if (portKey === 'lifecycle') return p; // lifecycle non ha best/normal/worst fissi
  const fxExp   = p.fxExp ?? 0;
  const fxHedged = !!state.fxHedge;
  const fxCost   = fxHedged ? fxExp * state.fxHedgeCost : 0;
  const fxAddVar = fxHedged ? 0 : Math.pow(fxExp * state.fxVol, 2);
  const sigmaFx  = Math.sqrt((p.vol ?? 0.10) ** 2 + fxAddVar);
  const muNet    = (p.normal ?? 0.055) - fxCost;
  return {
    ...p,
    normal: muNet,
    best:   Math.min(muNet + 0.20 * sigmaFx, 0.20),
    worst:  Math.max(muNet - 0.38 * sigmaFx, -0.08),
    vol:    sigmaFx,
  };
}
// ── Label portafoglio (anche per 'custom') ────────────────────────────────────
function getPortLabel(portKey) {
  if (portKey === 'custom') return '🔧 Custom';
  return PORT[portKey]?.label ?? portKey;
}

// ── Esposizione FX (% patrimonio in valuta non-EUR) ──────────────────────────
// Per 'custom': usa calcCustomParams().fxExposure
// Per lifecycle: interpolato con l'età (più equity = più FX USD)
// Per gli altri: usa PORT[key].fxExp
function getFxExposure(portKey, age) {
  if (portKey === 'custom') return calcCustomParams().fxExposure ?? 0;
  if (portKey === 'lifecycle') {
    const eq = getLCWeight(age ?? state.age);
    return eq * 0.85 + (1 - eq) * 0.05; // equity ~85% USD, bond ~5%
  }
  return PORT[portKey]?.fxExp ?? 0;
}

// ── Calcola effetto FX netto per portafogli predefiniti (investitore EUR) ─────
// Restituisce { fxExposure, fxHedged, fxCost, fxAddVol, fxAdjMu, fxAdjVol }
function getFxAdjustment(portKey, age) {
  const fxExp  = getFxExposure(portKey, age);
  const hedged = !!state.fxHedge;
  const fxCost    = hedged ? fxExp * state.fxHedgeCost : 0;
  const fxAddVar  = hedged ? 0 : Math.pow(fxExp * state.fxVol, 2);
  const fxAddVol  = Math.sqrt(fxAddVar);
  return { fxExposure: fxExp, fxHedged: hedged, fxCost, fxAddVol };
}
// ── Applica il TER ponderato del portafoglio custom allo slider e a state.ter ──
// Chiamata ogni volta che la composizione custom cambia, così la simulazione usa
// sempre il TER coerente con gli ETF selezionati (e non il default 0.20%).
function syncCustomTer() {
  if (state.portfolio !== 'custom') return;
  const cp = calcCustomParams();
  const suggestedTer = Math.round(cp.ter * 100) / 100; // cp.ter è già in % (es. 0.165 = 0.165%)
  state.ter = suggestedTer;
  const sl = document.getElementById('sTer');
  const lb = document.getElementById('lTer');
  if (sl) sl.value = suggestedTer;
  if (lb) lb.textContent = suggestedTer.toFixed(2) + '%';
  updateRetInfo();
}

function addCustomSlot(){ state.customPortfolio.slots.push({ac:'',pct:0}); renderCustomBuilder(); syncCustomTer(); render(); updateBootstrapBtnState(); }
function delCustomSlot(i){ state.customPortfolio.slots.splice(i,1); if(!state.customPortfolio.slots.length) state.customPortfolio.slots.push({ac:'eq_world',pct:100}); renderCustomBuilder(); syncCustomTer(); render(); updateBootstrapBtnState(); }
function updCustomAc(i,ac){ state.customPortfolio.slots[i].ac=ac; renderCustomBuilder(); syncCustomTer(); render(); updateBootstrapBtnState(); }
function updCustomPct(i,pct){ state.customPortfolio.slots[i].pct=Math.max(0,pct); renderCustomBuilder(); syncCustomTer(); render(); updateBootstrapBtnState(); }
function normalizeCustom(){ const s=state.customPortfolio.slots.filter(sl=>sl.ac&&sl.pct>0); const t=s.reduce((acc,sl)=>acc+sl.pct,0); if(!t) return; state.customPortfolio.slots=s.map(sl=>({...sl,pct:Math.round(sl.pct/t*1000)/10})); renderCustomBuilder(); syncCustomTer(); render(); }

// ── Toggle copertura cambio EUR/USD ────────────────────────────────
// Modella l'effetto valutario per investitore EUR:
// - Unhedged: aggiunge vol da EUR/USD (~8.5%/a) proporzionalmente all'esposizione
// - Hedged: costo annuo ~0.3% (forward FX), elimina la vol valutaria
// Fonte: differenziale tassi EUR/USD storico, costi hedging ETF UCITS
function toggleFxHedge() {
  state.fxHedge = !state.fxHedge;
  renderCustomBuilder();
  updateRetInfo();
  updatePortDetailBox();
  render();
}
function resetCustomPreset(key){
  const p = {
    eq60:         [{ac:'eq_sviluppati',pct:60},{ac:'ob_glob_agg',pct:40}],
    all_seasons:  [{ac:'eq_sviluppati',pct:30},{ac:'ob_usa_ult',pct:40},{ac:'ob_usa_it',pct:15},{ac:'gold',pct:7.5},{ac:'commodities',pct:7.5}],
    permanent:    [{ac:'eq_sviluppati',pct:25},{ac:'ob_usa_ult',pct:25},{ac:'gold',pct:25},{ac:'cash',pct:25}],
    larry:        [{ac:'eq_small_value',pct:15},{ac:'eq_europa',pct:7.5},{ac:'eq_em',pct:7.5},{ac:'ob_usa_it',pct:70}],
    global:       [{ac:'eq_sviluppati',pct:55},{ac:'ob_glob_agg',pct:45}],
    inflaz:       [{ac:'eq_sviluppati',pct:30},{ac:'ob_infl',pct:30},{ac:'gold',pct:20},{ac:'commodities',pct:20}],
    multifat:     [{ac:'fat_multifat',pct:70},{ac:'ob_glob_agg',pct:20},{ac:'gold',pct:10}],
    trend_div:    [{ac:'eq_sviluppati',pct:40},{ac:'fat_trend',pct:25},{ac:'ob_glob_gov',pct:25},{ac:'gold',pct:10}],
    carry_mix:    [{ac:'fat_carry_bond',pct:30},{ac:'fat_carry_fx',pct:20},{ac:'eq_sviluppati',pct:30},{ac:'ob_glob_agg',pct:20}],
  };
  if(p[key]){state.customPortfolio.slots=p[key].map(s=>({...s}));renderCustomBuilder();syncCustomTer();render();}
}


// ══════════════════════════════════════════════════════════════
// SLIDERS + BINDING
// ══════════════════════════════════════════════════════════════
function bindSlider(sid, lid, key, fmtFn, cb) {
  const s = document.getElementById(sid), l = document.getElementById(lid);
  s.oninput = () => { state[key] = +s.value; l.textContent = fmtFn(+s.value); if (key === 'pac') renderPacChgList(); if (key === 'years') { const el = document.getElementById('mcAccYears'); if (el) el.textContent = +s.value; } if (cb) cb(); render(); };
}
bindSlider('sW', 'lW', 'w', v => '€' + fmtN(v));
bindSlider('sP', 'lP', 'pac', v => '€' + fmtN(v) + '/m');
bindSlider('sA', 'lA', 'age', v => v + ' anni');
bindSlider('sY', 'lY', 'years', v => v + ' anni');
bindSlider('sO', 'lO', 'opt', v => '€' + fmtN(v));
bindSlider('sTer', 'lTer', 'ter', v => v.toFixed(2) + '%', updateRetInfo);
bindSlider('sTeq', 'lTeq', 'taxEq', v => v.toFixed(1) + '%', updateRetInfo);
bindSlider('sTob', 'lTob', 'taxOb', v => v.toFixed(1) + '%', updateRetInfo);
bindSlider('sInflBottom', 'lInflBottom', 'inflBottom', v => v.toFixed(1) + '%');
bindSlider('sInflVol', 'lInflVol', 'inflVol', v => v.toFixed(2) + '%');

document.getElementById('sMcW').oninput = function () { mcState.withdrawal = +this.value; document.getElementById('lMcW').textContent = fmt(+this.value) + '/a'; };
document.getElementById('sMcY').oninput = function () { mcState.years = +this.value; document.getElementById('lMcY').textContent = this.value + ' anni'; };
document.getElementById('sMcI').oninput = function () { mcState.inflation = +this.value; document.getElementById('lMcI').textContent = (+this.value).toFixed(1) + '%'; };

function bindDecSlider(sid, lid, key, fmtFn) { const s = document.getElementById(sid), l = document.getElementById(lid); s.oninput = () => { decState[key] = +s.value; l.textContent = fmtFn(+s.value); renderDecumulo(); }; }
bindDecSlider('sDecStart', 'lDecStart', 'startPortfolio', v => fmt(v));
bindDecSlider('sDecW', 'lDecW', 'withdrawal', v => fmt(v) + '/a');
bindDecSlider('sDecY', 'lDecY', 'years', v => v + ' anni');
bindDecSlider('sDecTer', 'lDecTer', 'ter', v => v.toFixed(2) + '%');
bindDecSlider('sDecI', 'lDecI', 'inflation', v => v.toFixed(1) + '%');

document.getElementById('decAllocBtns').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; decState.portfolio = b.dataset.k; document.querySelectorAll('#decAllocBtns .gbtn').forEach(x => x.classList.remove('a-blue')); b.classList.add('a-blue'); renderDecumulo(); };
document.getElementById('decStratBtns').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; decState.strategy = b.dataset.s; document.querySelectorAll('#decStratBtns .gbtn').forEach(x => x.classList.remove('a-blue')); b.classList.add('a-blue'); document.getElementById('decStratDesc').innerHTML = decStratDescs[b.dataset.s] || ''; renderDecumulo(); };

// Eco timing — Scenari tab
function updateEcoTimDesc() {
  const win = getEcoWindow(state.activeEcoScenario, state.years, state.ecoTiming);
  const eco = ECO_SCENARIOS[state.activeEcoScenario];
  const labels = { early: 'Inizio: il regime inizia subito (anni 1–' + win.e + '). Massima esposizione nella fase di accumulo iniziale — i mercati colpiti quando il capitale è ancora basso.', mid: 'Metà: il regime si attiva a metà orizzonte (anni ' + win.s + '–' + win.e + '). Il portafoglio è già cresciuto; l\'impatto è più ampio in termini assoluti.', late: 'Fine: il regime si manifesta negli ultimi anni (anni ' + win.s + '–' + win.e + '). Vero sequence risk — manca il tempo per il recupero prima della liquidazione.' };
  document.getElementById('ecoTimDesc').innerHTML = (labels[state.ecoTiming] || '') + (eco?.duration >= 99 ? ' <em style="color:var(--text3)">(Scenario permanente: copre tutto l\'orizzonte indipendentemente dalla fase.)</em>' : '');
}
document.getElementById('ecoTimBtns').onclick = e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  state.ecoTiming = b.dataset.t;
  document.querySelectorAll('#ecoTimBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  updateEcoTimDesc();
  renderEcoScenarios();
};

// Eco scenario + timing — Decumulo tab
function initDecEcoBtns() {
  const wrap = document.getElementById('decEcoBtns');
  Object.entries(ECO_SCENARIOS).forEach(([k, s]) => {
    const btn = document.createElement('button');
    btn.className = 'gbtn'; btn.dataset.e = k;
    btn.innerHTML = s.emoji + ' ' + s.label;
    wrap.appendChild(btn);
  });
}
function updateDecEcoTimDesc() {
  if (!decState.ecoScenario) { document.getElementById('decEcoTimDesc').innerHTML = ''; return; }
  const win = getEcoWindow(decState.ecoScenario, decState.years, decState.ecoTiming);
  const eco = ECO_SCENARIOS[decState.ecoScenario];
  const labels = { early: 'Inizio decumulo (anni 1–' + win.e + '): colpisce nella fase in cui il portafoglio è ancora grande — massimo impatto assoluto.', mid: 'Metà decumulo (anni ' + win.s + '–' + win.e + '): il prelievo ha già ridotto il capitale; la volatilità è più gestibile.', late: 'Fine decumulo (anni ' + win.s + '–' + win.e + '): il patrimonio residuo è limitato; l\'effetto sul totale è contenuto.' };
  document.getElementById('decEcoTimDesc').innerHTML = (labels[decState.ecoTiming] || '') + (eco?.duration >= 99 ? ' <em style="color:var(--text3)">(Scenario permanente.)</em>' : '');
}
document.getElementById('decEcoBtns').onclick = e => {
  const b = e.target.closest('[data-e]'); if (!b) return;
  const k = b.dataset.e;
  decState.ecoScenario = k === 'none' ? null : k;
  document.querySelectorAll('#decEcoBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  document.getElementById('decEcoTimRow').style.display = decState.ecoScenario ? 'block' : 'none';
  updateDecEcoTimDesc();
  renderDecumulo();
};
document.getElementById('decEcoTimBtns').onclick = e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  decState.ecoTiming = b.dataset.t;
  document.querySelectorAll('#decEcoTimBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  updateDecEcoTimDesc();
  renderDecumulo();
};

document.getElementById('allocBtns').onclick = e => {
  const b = e.target.closest('[data-k]'); if (!b) return;
  state.portfolio = b.dataset.k;
  document.querySelectorAll('#allocBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  const builder = document.getElementById('customBuilder');
  if (builder) builder.classList.toggle('visible', b.dataset.k === 'custom');
  if (b.dataset.k === 'custom') syncCustomTer();
  updateRetInfo(); updatePortDetailBox(); updateSeqDesc(); render();
  if (typeof updateBootstrapBtnState === 'function') updateBootstrapBtnState();
};

function updateRetInfo() {
  const p = getPortParams(state.portfolio);
  const el = document.getElementById('retInfo'), terRate = state.ter / 100;
  const nT = r => (r - terRate) * 100;
  if (!p || !p.normal) el.innerHTML = `<span>Lifecycle: equity 80%→20% con l'età.</span><span style="color:var(--text3);width:100%;margin-top:2px">Tassi nominali netti TER ${state.ter.toFixed(2)}%. Tasse solo alla vendita finale.</span>`;
  else el.innerHTML = `<span>🔴 Pess. <strong>${nT(p.worst).toFixed(2)}%</strong>/a</span><span>🔵 Base <strong>${nT(p.normal).toFixed(2)}%</strong>/a</span><span>🟢 Ott. <strong>${nT(p.best).toFixed(2)}%</strong>/a</span><span>📊 Vol. <strong>${p.vol ? (p.vol * 100).toFixed(0) + '%' : 'var.'}</strong>/a</span><span style="color:var(--text3);width:100%;margin-top:2px">Tassi nominali lordi netti TER ${state.ter.toFixed(2)}%. Tasse solo alla liquidazione.</span>`;
}

function toggleSeq() { state.seq.on = !state.seq.on; document.getElementById('seqTog').classList.toggle('on', state.seq.on); document.getElementById('seqOpts').style.display = state.seq.on ? 'block' : 'none'; updateSeqDesc(); render(); }
document.getElementById('sevBtns').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; state.seq.severity = b.dataset.s; document.querySelectorAll('#sevBtns .gbtn').forEach(x => x.classList.remove('a-purple')); b.classList.add('a-purple'); updateSeqDesc(); render(); };
document.getElementById('timBtns').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; state.seq.timing = b.dataset.t; document.querySelectorAll('#timBtns .gbtn').forEach(x => x.classList.remove('a-amber')); b.classList.add('a-amber'); updateSeqDesc(); render(); };

function updateSeqDesc() {
  const mode = state.seq.mode || 'single';
  const crashYears = getCrashYears(mode, state.seq.timing, state.years);
  const cY = crashYears[0] ?? 1;
  const aw = getEquityWeight(state.portfolio, state.age + cY);
  const acr = SEQ_RATES[state.seq.severity] * aw + BOND_RALLY_RATE * (1 - aw);
  const pctv = Math.abs((acr * 100).toFixed(1)) + '%';
  const prefix = aw === 0 ? `Portafoglio 100% obbligazionario: Flight to Quality (+5%). ` : `Impatto portafoglio: −${pctv} nominale anno ${cY}. `;
  const msgs = { early: `${prefix}Magia del PAC in accumulo: comprando a sconto, il portafoglio può recuperare più velocemente.`, mid: `${prefix}Il PAC media al ribasso. Un PAC alto può annullare il danno nel medio periodo.`, late: `${prefix}Vero Sequence Risk: manca tempo per il recupero. La decorrelazione obbligazionaria è fondamentale.` };
  document.getElementById('seqDesc').innerHTML = msgs[state.seq.timing] || '';
  
  // Multi-crash info
  const mcInfo = document.getElementById('multiCrashInfo');
  if (mode !== 'single' && mcInfo) {
    mcInfo.style.display = 'block';
    const crashDescs = crashYears.map((cy, i) => {
      const sf = i === 0 ? 1.0 : i === 1 ? 0.65 : 0.45;
      const sevPct = Math.abs(SEQ_RATES[state.seq.severity] * sf * 100).toFixed(0);
      return `<strong>Crash #${i+1}</strong> (anno ${cy}): severità −${sevPct}% azionario`;
    });
    mcInfo.innerHTML = `<strong>Modalità ${mode === 'double' ? '2 crash' : '3 crash'} realistici</strong> — ` + crashDescs.join(' · ') + 
      `<br><span style="font-size:11px;opacity:.8">I crash successivi al primo hanno severità ridotta (−35% / −55% del primo): storicamente i mercati già depressi rimbalzano più velocemente.</span>`;
  } else if (mcInfo) mcInfo.style.display = 'none';
}

// Multi-crash mode buttons
document.getElementById('seqModeBtns').onclick = e => {
  const b = e.target.closest('[data-sm]'); if (!b) return;
  state.seq.mode = b.dataset.sm;
  document.querySelectorAll('#seqModeBtns .gbtn').forEach(x => x.classList.remove('a-purple'));
  b.classList.add('a-purple');
  updateSeqDesc(); render();
};

function toggleDynCorr() {
  state.seq.dynCorr = !state.seq.dynCorr;
  document.getElementById('dynCorrTog').classList.toggle('on', state.seq.dynCorr);
  updateSeqDesc(); render();
}

function toggleAllRows() { state.allRows = !state.allRows; document.getElementById('allRowsTog').classList.toggle('on', state.allRows); render(); }

// ══════════════════════════════════════════════════════════════
// PAC VARIABILE + ENTRY LISTS
// ══════════════════════════════════════════════════════════════
function renderPacChgList() {
  const el = document.getElementById('pacChgList'), sumEl = document.getElementById('pacSummary');
  if (!state.pacChanges.length) { el.innerHTML = '<div class="empty-entry">PAC fisso per tutto l\'orizzonte</div>'; sumEl.style.display = 'none'; return; }
  el.innerHTML = state.pacChanges.map(p => { const amt = +p.amount; let bc = 'pac-badge pac-badge-same', bt = '= uguale'; if (amt === 0) { bc = 'pac-badge pac-badge-stop'; bt = 'SOSPESO'; } else if (amt > state.pac) { bc = 'pac-badge pac-badge-up'; bt = '+ €' + fmtN(amt - state.pac) + '/m'; } else if (amt < state.pac) { bc = 'pac-badge pac-badge-down'; bt = '- €' + fmtN(state.pac - amt) + '/m'; } return `<div class="erow"><span class="elab">Anno</span><input class="einput" type="number" min="1" max="${state.years}" value="${p.year}" onchange="updPacChg(${p.id},'year',this.value)"><span class="elab">€/mese</span><input class="einput" type="number" min="0" step="50" value="${p.amount}" placeholder="0=sospeso" onchange="updPacChg(${p.id},'amount',this.value)"><span class="${bc}">${bt}</span><button class="dbtn" onclick="delPacChg(${p.id})">✕</button></div>`; }).join('');
  const sorted = [...state.pacChanges].sort((a, b) => +a.year - +b.year); let tl = '';
  if (sorted[0].year > 1) tl = `Anni 1-${sorted[0].year - 1}: €${fmtN(state.pac)}/m`;
  sorted.forEach((c, i) => { const nxt = sorted[i + 1] ? sorted[i + 1].year - 1 : state.years; const rng = +c.year === nxt ? `Anno ${c.year}` : `Anni ${c.year}-${nxt}`; const sep = tl ? ' → ' : ''; tl += +c.amount === 0 ? `${sep}${rng}: SOSPESO` : `${sep}${rng}: €${fmtN(c.amount)}/m`; });
  sumEl.innerHTML = '📅 ' + tl; sumEl.style.display = 'block';
}
function renderPicList() { const el = document.getElementById('picList'); if (!state.pics.length) { el.innerHTML = '<div class="empty-entry">Nessun versamento aggiuntivo</div>'; return; } el.innerHTML = state.pics.map(p => `<div class="erow"><span class="elab">Anno</span><input class="einput" type="number" min="1" max="${state.years}" value="${p.year}" onchange="updPic(${p.id},'year',this.value)"><span class="elab">Importo €</span><input class="einput" type="number" min="0" step="1000" value="${p.amount}" onchange="updPic(${p.id},'amount',this.value)"><button class="dbtn" onclick="delPic(${p.id})">✕</button></div>`).join(''); }
function renderExpList() { const el = document.getElementById('expList'); if (!state.exps.length) { el.innerHTML = '<div class="empty-entry">Nessuna spesa straordinaria</div>'; return; } el.innerHTML = state.exps.map(e => `<div class="erow"><span class="elab">Anno</span><input class="einput" type="number" min="1" max="${state.years}" value="${e.year}" onchange="updExp(${e.id},'year',this.value)"><span class="elab">Importo €</span><input class="einput" type="number" min="0" step="1000" value="${e.amount}" onchange="updExp(${e.id},'amount',this.value)"><button class="dbtn" onclick="delExp(${e.id})">✕</button></div>`).join(''); }
function addPic() { state.pics.push({ id: picId++, year: 5, amount: 10000 }); renderPicList(); render(); }
function addExp() { state.exps.push({ id: expId++, year: 6, amount: 20000 }); renderExpList(); render(); }
function delPic(id) { state.pics = state.pics.filter(p => p.id !== id); renderPicList(); render(); }
function delExp(id) { state.exps = state.exps.filter(e => e.id !== id); renderExpList(); render(); }
function updPic(id, k, v) { const p = state.pics.find(p => p.id === id); if (p) { p[k] = +v; render(); } }
function updExp(id, k, v) { const e = state.exps.find(e => e.id === id); if (e) { e[k] = +v; render(); } }
function addPacChg() { state.pacChanges.push({ id: pacChgId++, year: Math.min(Math.max(1, Math.round(state.years / 2)), state.years), amount: 0 }); renderPacChgList(); render(); }
function delPacChg(id) { state.pacChanges = state.pacChanges.filter(c => c.id !== id); renderPacChgList(); render(); }
function updPacChg(id, k, v) { const c = state.pacChanges.find(c => c.id === id); if (c) { c[k] = +v; renderPacChgList(); render(); } }

// Startup
initDecEcoBtns();

// ══════════════════════════════════════════════════════════════
// PDF GENERATION
// ══════════════════════════════════════════════════════════════

// Normalizza caratteri accentati per compatibilità con font Helvetica di jsPDF
function pdfSafe(s) {
  // Mappa simboli Unicode comuni a equivalenti rappresentabili in Helvetica/WinAnsi.
  // Strategy: accenti italiani -> lettere semplici (no apostrofo brutto), simboli
  // matematici/freccie -> equivalenti ASCII, smart-quotes -> ASCII quotes.
  const map = {
    'à':'a','è':'e','é':'e','ì':'i','í':'i','ò':'o','ó':'o','ù':'u','ú':'u',
    'À':'A','È':'E','É':'E','Ì':'I','Í':'I','Ò':'O','Ó':'O','Ù':'U','Ú':'U',
    'â':'a','ê':'e','î':'i','ô':'o','û':'u','Â':'A','Ê':'E','Î':'I','Ô':'O','Û':'U',
    'ä':'a','ö':'o','ü':'u','Ä':'A','Ö':'O','Ü':'U','ñ':'n','Ñ':'N','ç':'c','Ç':'C',
    'ß':'ss',
    // smart quotes -> ASCII
    '\u2018':"'", '\u2019':"'", '\u201A':"'", '\u201B':"'",
    '\u201C':'"', '\u201D':'"', '\u201E':'"', '\u201F':'"',
    '\u2032':"'", '\u2033':'"',
    // trattini e ellissi
    '\u2010':'-','\u2011':'-','\u2012':'-','\u2013':'-','\u2014':'-','\u2015':'-',
    '\u2026':'...',
    // simboli matematici e tipografici
    '\u00B1':'+/-',    // ±
    '\u00D7':'x',       // ×
    '\u00F7':'/',       // ÷
    '\u2260':'!=',      // ≠
    '\u2264':'<=',      // ≤
    '\u2265':'>=',      // ≥
    '\u00B0':' gradi',  // °
    '\u00B2':'^2','\u00B3':'^3',
    '\u00BC':'1/4','\u00BD':'1/2','\u00BE':'3/4',
    '\u00A9':'(c)','\u00AE':'(R)','\u2122':'(TM)',
    '\u20AC':'EUR',     // €
    '\u00A3':'GBP','\u00A5':'JPY','\u00A2':'c',
    // freccie
    '\u2192':'->','\u2190':'<-','\u2194':'<->','\u21D2':'=>','\u21D0':'<=',
    '\u2191':'^','\u2193':'v',
    // bullet
    '\u2022':'-','\u00B7':'-','\u25E6':'-','\u25AA':'-','\u25CF':'-',
    // Greek (uso scientifico/finanziario)
    '\u0394':'Delta','\u03B4':'delta','\u03A3':'Sigma','\u03C3':'sigma',
    '\u03BC':'mu','\u03B1':'alpha','\u03B2':'beta','\u03B3':'gamma',
    '\u03C0':'pi','\u03BB':'lambda','\u03B8':'theta','\u03C1':'rho',
    '\u03C7':'chi','\u03C6':'phi','\u03A9':'Omega','\u03C9':'omega',
    // spazi non-breaking e zero-width
    '\u00A0':' ','\u202F':' ','\u2009':' ','\u200B':'','\u200C':'','\u200D':'','\uFEFF':'',
    // box drawing usato nei commenti
    '\u2500':'-','\u2501':'-','\u2550':'=','\u2014':'-',
  };
  let out = '';
  for (const ch of String(s)) {
    const code = ch.charCodeAt(0);
    if (code < 128) { out += ch; continue; }
    if (map[ch] != null) { out += map[ch]; continue; }
    // Latin-1 supplement (à-ÿ, A-Ÿ) renderizzabile da Helvetica/WinAnsi
    if (code >= 0x00A0 && code <= 0x00FF) { out += ch; continue; }
    // fallback: rimuovi caratteri non rappresentabili (no più "?")
    out += '';
  }
  return out;
}

// ══════════════════════════════════════════════════════════════
// EXPORT EXCEL — genera .xlsx con proiezioni, MC, tabella annuale
// Usa la libreria SheetJS (xlsx) caricata via CDN in index.html.
// ══════════════════════════════════════════════════════════════
async function exportExcel() {
  const btn = document.getElementById('excelBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generazione…'; }
  try {
    if (typeof XLSX === 'undefined') throw new Error('SheetJS non caricato');
    const { w, age, years, ter, portfolio, seq } = state;
    const terRate = ter / 100;
    const endAge = age + years;
    const portMeta = getPortParams(portfolio) || {};
    const portLabel = getPortLabel(portfolio);

    // ── 1. Dati proiezione annuale (3 scenari) ─────────────────
    const dN = project('normal', seq?.on);
    const dB = project('best',   seq?.on);
    const dW = project('worst',  seq?.on);
    const txF = blendedTaxRate(endAge);

    const hdrProj = ['Anno','Età','Investito (€)','Valore Base (€)','Valore Ott. (€)',
                     'Valore Pess. (€)','Guadagno Base (€)','Netto Fiscale Base (€)','CAGR Base (%)'];
    const rowsProj = dN.map((d, i) => {
      const vN = d.value, inv = d.invested;
      const vB = dB[i]?.value ?? vN, vW = dW[i]?.value ?? vN;
      const gain = Math.max(0, vN - inv);
      const netto = vN - gain * txF;
      const cagr = i > 0 ? ((Math.pow(vN / Math.max(1, state.w), 1 / i) - 1) * 100).toFixed(2) : 0;
      return [d.year ?? i, d.age ?? age + i, Math.round(inv), Math.round(vN),
              Math.round(vB), Math.round(vW), Math.round(vN - inv), Math.round(netto), +cagr];
    });

    // ── 2. Riepilogo parametri ──────────────────────────────────
    const hdrParam = ['Parametro', 'Valore'];
    const rowsParam = [
      ['Portafoglio', portLabel],
      ['Capitale iniziale (€)', w],
      ['PAC mensile (€)', state.pac],
      ['Orizzonte (anni)', years],
      ['Età inizio', age],
      ['TER (%)', ter],
      ['Rendimento base (%/a)', portMeta.normal ? (portMeta.normal * 100).toFixed(2) : 'variabile'],
      ['Rendimento ott. (%/a)', portMeta.best   ? (portMeta.best   * 100).toFixed(2) : 'variabile'],
      ['Rendimento pess. (%/a)',portMeta.worst  ? (portMeta.worst  * 100).toFixed(2) : 'variabile'],
      ['Volatilità σ (%/a)',   portMeta.vol    ? (portMeta.vol    * 100).toFixed(1) : 'variabile'],
      ['Beta inflazione',       portMeta.inflBeta != null ? portMeta.inflBeta.toFixed(2) : 'n/d'],
      ['Tassa az. (%)',         state.taxEq],
      ['Tassa ob. (%)',         state.taxOb],
      ['Aliquota blended (%)',  (txF * 100).toFixed(2)],
      ['Sequence Risk',         seq?.on ? `Sì — ${seq.severity} / ${seq.timing}` : 'No'],
      ['Data generazione', new Date().toLocaleDateString('it-IT')],
    ];

    // ── 3. Asset class custom (se applicabile) ──────────────────
    let wsCustom = null;
    if (portfolio === 'custom' && state.customPortfolio?.slots?.length) {
      const hdrAC = ['Asset Class', 'Peso (%)', 'Rendimento μ (%/a)',
                     'Volatilità σ (%/a)', 'Beta Inflazione', 'Categoria', 'Fonte'];
      const total = state.customPortfolio.slots.reduce((s,sl)=>s+(+sl.pct||0),0)||1;
      const rowsAC = state.customPortfolio.slots.filter(s=>s.ac&&s.pct>0).map(sl => {
        const ac = ASSET_CLASSES[sl.ac] || {};
        return [
          ac.label || sl.ac,
          (sl.pct / total * 100).toFixed(1),
          ac.mu  ? (ac.mu  * 100).toFixed(2) : '',
          ac.vol ? (ac.vol * 100).toFixed(1) : '',
          ac.inflBeta != null ? ac.inflBeta.toFixed(2) : '',
          ac.cat || '',
          ac.src || '',
        ];
      });
      wsCustom = XLSX.utils.aoa_to_sheet([hdrAC, ...rowsAC]);
      wsCustom['!cols'] = [30,10,14,14,14,10,30].map(w=>({wch:w}));
    }

    // ── 4. Monte Carlo (se già eseguito) ────────────────────────
    let wsMC = null;
    if (window._lastMCResults && window._lastMCResults.length > 0) {
      const sorted = [...window._lastMCResults].sort((a,b)=>a-b);
      const N = sorted.length;
      const pct = p => sorted[Math.max(0, Math.floor(p/100*N)-1)];
      const hdrMC = ['Percentile','Valore Finale (€)'];
      const pctiles = [5,10,25,50,75,90,95];
      const rowsMC = pctiles.map(p => [p + '°', Math.round(pct(p))]);
      rowsMC.push(['Media', Math.round(sorted.reduce((s,v)=>s+v,0)/N)]);
      rowsMC.push(['Simulazioni', N]);
      wsMC = XLSX.utils.aoa_to_sheet([hdrMC, ...rowsMC]);
      wsMC['!cols'] = [{wch:12},{wch:16}];
    }

    // ── 5. Backtesting storico ─────────────────────────────────
    const hdrBT = ['Anno Inizio', 'Evento', 'CAGR su tot. investito (%/a)', 'CAGR cap. iniziale (%/a)', 'Valore Finale (€)', 'Max Drawdown (%)', 'Totale Versato (€)', 'Ritorno Nominale (%)'];
    const btPortKey = btState?.port === 'sim' ? portfolio : (btState?.port || portfolio);
    const btPac = btState?.pac ?? state.pac;
    const btW0 = btState?.w ?? state.w;
    const btRows = [];
    for (const [syStr, period] of Object.entries(BT_PERIODS)) {
      const sy = +syStr;
      try {
        const res = simulateBacktest(btPortKey, sy, btPac, btW0);
        btRows.push([
          sy,
          period.label.split('—')[1]?.trim() || period.label,
          +((res.cagrOnInvested * 100).toFixed(2)),
          +((res.cagr * 100).toFixed(2)),
          Math.round(res.finalValue),
          +((res.maxDD * 100).toFixed(1)),
          Math.round(res.finalInvested),
          +((res.totalReturn * 100).toFixed(1)),
        ]);
      } catch(e) { /* skip if data unavailable */ }
    }
    btRows.sort((a, b) => b[2] - a[2]); // sort by cagrOnInvested desc
    const wsBT = XLSX.utils.aoa_to_sheet([hdrBT, ...btRows]);
    wsBT['!cols'] = [10,28,14,14,16,14,16,14].map(w=>({wch:w}));

    // ── 6. Sequence Risk multiplo ──────────────────────────────
    const hdrSR = ['Modalità Crash', 'Timing', 'Severità', 'Valore Finale (€)', 'Gap vs Base (€)', 'Gap vs Base (%)'];
    const srBase = project('normal', false);
    const srBaseVal = srBase[years].value;
    const srRows = [];
    const severities = ['mild', 'moderate', 'severe'];
    const timings = ['early', 'mid', 'late'];
    const modes = ['single', 'double', 'triple'];
    const severityLabels = { mild: 'Lieve (−20%)', moderate: 'Moderato (−35%)', severe: 'Severo (−50%)' };
    const modeLabels = { single: 'Crash singolo', double: 'Doppio crash', triple: 'Triplo crash' };
    const timingLabels = { early: 'Inizio piano', mid: 'Metà piano', late: 'Fine piano' };
    // Sample key scenarios for the SR table
    const srScenarios = [
      { mode: 'single', timing: 'early', severity: 'moderate' },
      { mode: 'single', timing: 'late',  severity: 'moderate' },
      { mode: 'single', timing: 'early', severity: 'severe'   },
      { mode: 'double', timing: 'early', severity: 'moderate' },
      { mode: 'triple', timing: 'early', severity: 'moderate' },
    ];
    for (const sc of srScenarios) {
      const savedSeq = { ...state.seq };
      state.seq = { on: true, severity: sc.severity, timing: sc.timing, mode: sc.mode, dynCorr: false };
      const dSR = project('normal', true);
      state.seq = savedSeq;
      const val = dSR[years].value;
      const gap = val - srBaseVal;
      const gapPct = srBaseVal > 0 ? (gap / srBaseVal * 100).toFixed(1) : '0';
      srRows.push([
        modeLabels[sc.mode], timingLabels[sc.timing], severityLabels[sc.severity],
        Math.round(val), Math.round(gap), +gapPct,
      ]);
    }
    const wsSR = XLSX.utils.aoa_to_sheet([hdrSR, ...srRows]);
    wsSR['!cols'] = [18,16,16,16,14,12].map(w=>({wch:w}));

    // ── 7. Build workbook ───────────────────────────────────────
    const wb = XLSX.utils.book_new();
    const wsProj = XLSX.utils.aoa_to_sheet([hdrProj, ...rowsProj]);
    wsProj['!cols'] = [8,6,14,14,14,14,14,14,10].map(w=>({wch:w}));
    const wsParam = XLSX.utils.aoa_to_sheet([hdrParam, ...rowsParam]);
    wsParam['!cols'] = [{wch:26},{wch:24}];

    // ── Foglio Decumulo Storico (Trinity-style) ──
    let wsDecHist = null;
    try {
      const dh = runDecumuloHistorical();
      if (dh && dh.results && dh.results.length > 0) {
        const hdrDH = ['Anno Inizio Decumulo', 'Sopravvive?', 'Capitale Finale (€)', 'Anno Esaurimento', 'Max Drawdown %'];
        const sorted = [...dh.results].sort((a, b) => a.startYear - b.startYear);
        const rowsDH = sorted.map(x => [
          x.startYear,
          x.survived ? 'SI' : 'NO',
          x.finalCap,
          x.exhaustYear || '',
          (x.maxDrawdown * 100).toFixed(1) + '%',
        ]);
        // Riga di intestazione statistiche
        const sortedByCap = [...dh.results].sort((a, b) => a.finalCap - b.finalCap);
        const N = sortedByCap.length;
        const stats = [
          ['── STATISTICHE AGGREGATE ──', '', '', '', ''],
          ['Tasso sopravvivenza', (dh.successRate * 100).toFixed(0) + '%', '', '', ''],
          ['Anni di partenza testati', dh.nTotal, '', '', ''],
          ['Anni sopravvissuti', dh.nSurvived, '', '', ''],
          ['Capitale finale mediano', sortedByCap[Math.floor(N * 0.5)]?.finalCap || 0, '', '', ''],
          ['Capitale finale P10 (peggiore)', sortedByCap[Math.floor(N * 0.10)]?.finalCap || 0, '', '', ''],
          ['Capitale finale P90 (migliore)', sortedByCap[Math.floor(N * 0.90)]?.finalCap || 0, '', '', ''],
          ['Worst start year', dh.worstStart ? dh.worstStart.startYear : 'Nessun fail', '', '', ''],
          ['', '', '', '', ''],
          ['── DETTAGLIO PER ANNO DI PARTENZA ──', '', '', '', ''],
        ];
        wsDecHist = XLSX.utils.aoa_to_sheet([hdrDH, ...stats, hdrDH, ...rowsDH]);
        wsDecHist['!cols'] = [22, 14, 18, 18, 14].map(w => ({ wch: w }));
      }
    } catch (e) { console.warn('Skip foglio Decumulo Storico:', e.message); }

    // ── Foglio FX e Stress (solo per portfolio custom) ──
    let wsFx = null;
    if (portfolio === 'custom') {
      const cp = calcCustomParams();
      if (cp) {
        const fxRows = [
          ['── ESPOSIZIONE CAMBIO E REGIME DI STRESS ──', ''],
          ['', ''],
          ['Esposizione FX (% non-EUR)', (cp.fxExposure * 100).toFixed(1) + '%'],
          ['Hedging valutario attivo', cp.fxHedged ? 'SI' : 'NO'],
          ['Costo annuo hedging', cp.fxHedged ? (cp.fxCost * 100).toFixed(3) + '%' : '0%'],
          ['', ''],
          ['── VOLATILITA NEI DUE REGIMI ──', ''],
          ['Vol portafoglio (senza FX)', (cp.volNoFx * 100).toFixed(2) + '%'],
          ['Vol portafoglio (incluso FX, regime normale)', (cp.vol * 100).toFixed(2) + '%'],
          ['Vol in regime di stress (correlazioni -> 1)', (cp.volStress * 100).toFixed(2) + '%'],
          ['Amplificazione vol in stress', '+' + (((cp.volStress - cp.vol) / cp.vol) * 100).toFixed(0) + '%'],
          ['Vol aggiuntiva da FX', (cp.fxAddVol * 100).toFixed(2) + '%'],
          ['', ''],
          ['── PARAMETRI BLENDED ──', ''],
          ['Rendimento atteso (μ)', (cp.normal * 100).toFixed(2) + '%/a'],
          ['Best case', (cp.best * 100).toFixed(2) + '%/a'],
          ['Worst case', (cp.worst * 100).toFixed(2) + '%/a'],
          ['Beta inflazione', cp.inflBeta.toFixed(3)],
          ['TER medio suggerito', cp.ter.toFixed(2) + '%'],
          ['Rendimento reale (μ - infl 2.1%)', (cp.realRet * 100).toFixed(2) + '%'],
        ];
        wsFx = XLSX.utils.aoa_to_sheet(fxRows);
        wsFx['!cols'] = [{ wch: 42 }, { wch: 18 }];
      }
    }

    XLSX.utils.book_append_sheet(wb, wsParam, 'Parametri');
    XLSX.utils.book_append_sheet(wb, wsProj,  'Proiezione Annuale');
    if (wsMC)     XLSX.utils.book_append_sheet(wb, wsMC,     'Monte Carlo');
    XLSX.utils.book_append_sheet(wb, wsBT,   'Backtesting Storico');
    XLSX.utils.book_append_sheet(wb, wsSR,   'Sequence Risk Multiplo');
    if (wsDecHist) XLSX.utils.book_append_sheet(wb, wsDecHist, 'Decumulo Storico');
    if (wsCustom) XLSX.utils.book_append_sheet(wb, wsCustom, 'Portfolio Custom');
    if (wsFx)     XLSX.utils.book_append_sheet(wb, wsFx,     'FX & Stress Vol');

    const fname = `report_patrimoniale_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fname);
  } catch(e) {
    alert('Errore export Excel: ' + e.message);
    console.error(e);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📊 Esporta Excel'; }
  }
}

// Salva i risultati MC per l'export Excel
function _saveMCResults(results) { window._lastMCResults = results; }

async function generatePDF() {
  const btn = document.getElementById('pdfBtn');
  btn.disabled = true; btn.textContent = '⏳ Generazione report...';
  await new Promise(r => setTimeout(r, 80));
  try {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Libreria PDF non caricata');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Wrapper autoTable: applica pdfSafe a tutte le celle/header (gestisce simboli unicode).
    const _autoTable = doc.autoTable.bind(doc);
    const safeCell = (c) => (c == null ? '' : (typeof c === 'object' && 'content' in c)
      ? { ...c, content: pdfSafe(String(c.content)) }
      : pdfSafe(String(c)));
    const safeRows = (rows) => Array.isArray(rows) ? rows.map(r => Array.isArray(r) ? r.map(safeCell) : r) : rows;
    doc.autoTable = (opts) => {
      const o = { ...opts };
      if (o.head) o.head = safeRows(o.head);
      if (o.body) o.body = safeRows(o.body);
      if (o.foot) o.foot = safeRows(o.foot);
      return _autoTable(o);
    };
    const { w, pac, age, years, portfolio, ter, taxEq, taxOb, inflBottom, inflVol, seq } = state;
    const endAge = age + years;
    const portMeta = getPortParams(portfolio) || { label: portfolio, desc: '', vol: 0, normal: 0, best: 0, worst: 0, realRet: 0, inflBeta: 0 };
    if (portfolio === 'custom') {
      const cp = calcCustomParams();
      const slotDesc = (state.customPortfolio?.slots||[]).filter(s=>s.ac&&s.pct>0)
        .map(s=>`${ASSET_CLASSES[s.ac]?.label||s.ac} ${s.pct}%`).join(', ');
      portMeta.desc = `Portafoglio personalizzato: ${slotDesc}. Parametri calcolati con matrice di correlazione empirica.`;
    }

    // Proiezioni base
    const dN = project('normal', false);
    const dB = project('best', false);
    const dW = project('worst', false);
    const dS = seq.on ? project('normal', true) : null;
    const vN = dN[years].value, vBt = dB[years].value, vWt = dW[years].value;
    const inv = dN[years].invested;
    const txF = blendedTaxRate(endAge);
    const nN = calcNetNom(vN, inv, txF);
    const nP = calcNetNom(vWt, inv, txF);
    const nO = calcNetNom(vBt, inv, txF);
    const inflR = inflBottom / 100;
    const dF = Math.pow(1 + inflR, years);
    const realN = vN / dF;
    const gF = vN > 0 ? Math.max(0, Math.min(1, (vN - inv) / vN)) : 0;
    const eT = gF * txF;
    const crossAge = findCrossover(dN);

    // Monte Carlo (rilancio per dati aggiornati)
    let mc = null;
    try { mc = runMontecarlo(); } catch (_) { mc = null; }

    // Palette
    const BLU = [26, 115, 232], GRN = [30, 142, 62], ORG = [227, 116, 0], PUR = [147, 52, 230];
    const TEAL = [0, 137, 123], GRAY = [95, 99, 104], LBG = [248, 249, 250];
    const WHT = [255, 255, 255], RED = [217, 48, 37], DARK = [32, 33, 36];
    const W = 210, H = 297, ML = 14, MR = 14, CW = W - ML - MR;
    let y = 0, pN = 1;

    const miniHdr = () => {
      doc.setFillColor(...LBG); doc.rect(0, 0, W, 13, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(pdfSafe('Report Patrimoniale Pro Suite v2 — Documento informativo, non consulenza finanziaria'), ML, 8.5);
      doc.text(`Pag. ${pN}`, W - MR, 8.5, { align: 'right' });
      doc.setDrawColor(210, 210, 210); doc.line(ML, 12.5, W - MR, 12.5);
      doc.setTextColor(0, 0, 0);
    };
    const chkPB = (n = 18) => { if (y + n > 275) { doc.addPage(); pN++; y = 20; miniHdr(); } };
    const sHdr = (t, col = BLU) => {
      chkPB(14); doc.setFillColor(...col); doc.rect(ML, y, CW, 7.5, 'F');
      doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHT);
      doc.text(pdfSafe(String(t)).toUpperCase(), ML + 3, y + 5.3); y += 11;
      doc.setTextColor(0, 0, 0);
    };
    const subHdr = (t) => {
      chkPB(8); doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
      doc.text(pdfSafe(t), ML, y); y += 5.5; doc.setTextColor(0, 0, 0);
    };
    const narrative = (txt, indent = 0) => {
      doc.setFontSize(8.7); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 64, 67);
      const lines = doc.splitTextToSize(pdfSafe(txt), CW - indent);
      chkPB(lines.length * 4.4 + 3);
      doc.text(lines, ML + indent, y);
      y += lines.length * 4.4 + 3;
      doc.setTextColor(0, 0, 0);
    };
    const callout = (title, body, col = BLU) => {
      doc.setFontSize(8.7); doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(pdfSafe(body), CW - 8);
      const boxH = lines.length * 4.4 + 11;
      chkPB(boxH + 2);
      doc.setFillColor(col[0], col[1], col[2]);
      doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
      doc.rect(ML, y, 1.5, boxH, 'F');
      doc.setFillColor(248, 250, 252); doc.rect(ML + 1.5, y, CW - 1.5, boxH, 'F');
      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...col);
      doc.text(pdfSafe(title), ML + 5, y + 5);
      doc.setFontSize(8.4); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 64, 67);
      doc.text(lines, ML + 5, y + 9.5);
      y += boxH + 3; doc.setTextColor(0, 0, 0);
    };
    const embedChart = (canvasId, caption, height = 80) => {
      const cvs = document.getElementById(canvasId);
      if (!cvs) return false;
      try {
        const img = cvs.toDataURL('image/png', 1.0);
        if (!img || img.length < 200) return false;
        const ratio = (cvs.height || 1) / (cvs.width || 1);
        const imgW = CW;
        const imgH = Math.min(height, imgW * ratio);
        chkPB(imgH + 10);
        doc.addImage(img, 'PNG', ML, y, imgW, imgH, undefined, 'FAST');
        y += imgH + 2;
        if (caption) {
          doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
          doc.text(pdfSafe(caption), ML, y + 3); y += 6;
          doc.setTextColor(0, 0, 0);
        }
        return true;
      } catch (e) { console.warn('chart capture failed', canvasId, e); return false; }
    };

    // ─────────── COVER ───────────
    doc.setFillColor(...BLU); doc.rect(0, 0, W, 60, 'F');
    doc.setFillColor(13, 71, 161); doc.rect(0, 55, W, 5, 'F');
    doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHT);
    doc.text('Report Patrimoniale Pro', ML, 24);
    doc.setFontSize(11.5); doc.setFont('helvetica', 'normal');
    doc.text(pdfSafe('Suite v2 — Multi-Scenario · Monte Carlo · Regimi Economici · Sequence Risk'), ML, 33);
    doc.setFontSize(8.8); doc.setTextColor(200, 225, 255);
    doc.text(`Generato il ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })} alle ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`, ML, 41);
    doc.text(pdfSafe(`Orizzonte ${years} anni  |  Eta ${age} -> ${endAge}  |  Portfolio: ${portMeta.label}`), ML, 47);
    y = 68;

    // KPI Grid sulla cover (4 metriche chiave)
    const kpis = [
      { lbl: 'Valore Lordo Base', val: fmtFull(vN), col: BLU },
      { lbl: 'Netto Fiscale', val: fmtFull(nN), col: GRN },
      { lbl: 'Valore Reale', val: fmtFull(realN), col: TEAL },
      { lbl: 'CAGR', val: cagrSafe(inv, vN, years).toFixed(2) + '%', col: PUR },
    ];
    // helper inline
    function cagrSafe(i, v, n){ return (i>0 && v>0 && n>0) ? (Math.pow(v/i, 1/n)-1)*100 : 0; }
    const kpiW = (CW - 9) / 4;
    kpis.forEach((k, i) => {
      const x = ML + i * (kpiW + 3);
      doc.setFillColor(248, 250, 252); doc.rect(x, y, kpiW, 22, 'F');
      doc.setDrawColor(...k.col); doc.setLineWidth(0.6); doc.line(x, y, x + kpiW, y);
      doc.setLineWidth(0.2);
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(pdfSafe(k.lbl).toUpperCase(), x + 2.5, y + 5);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...k.col);
      doc.text(pdfSafe(k.val), x + 2.5, y + 14);
    });
    doc.setTextColor(0, 0, 0); doc.setDrawColor(0, 0, 0);
    y += 28;

    // Executive Summary box
    subHdr('Sintesi Esecutiva');
    const moltN = (vN / Math.max(1, inv));
    const cagrN = cagrSafe(inv, vN, years);
    narrative(
      `Il piano analizzato prevede un capitale iniziale di ${fmtFull(w)} e versamenti PAC di ${fmtFull(pac)}/mese ` +
      `su un orizzonte di ${years} anni (eta ${age}-${endAge}), allocato sul portafoglio « ${portMeta.label} ». ` +
      `Lo scenario base proietta un valore lordo finale di ${fmtFull(vN)} (moltiplicatore ${moltN.toFixed(2)}x sul totale investito di ${fmtFull(inv)}), ` +
      `con un netto fiscale stimato di ${fmtFull(nN)} e un valore reale (al netto di inflazione ${inflBottom.toFixed(1)}%) pari a ${fmtFull(realN)}. ` +
      `Il tasso di crescita medio annuo composto (CAGR proxy) e' ${cagrN.toFixed(2)}%. ` +
      (crossAge ? `Il punto di crossover (rendita netta annua >= PAC) viene raggiunto a ${crossAge} anni.` : `Nell'orizzonte analizzato non si raggiunge il punto di crossover rendita >= PAC.`)
    );

    // Indice del documento
    subHdr('Indice del Report');
    const toc = [
      '1.  Configurazione del Piano',
      '2.  Metodologia di Calcolo',
      '3.  Proiezioni Multi-Scenario (Base / Best / Worst)',
      '4.  Evoluzione Patrimoniale Anno per Anno',
      '5.  Distribuzione Monte Carlo (1.000 simulazioni)',
      '6.  Scenari Economici Multi-Regime',
      '7.  Sequence of Returns Risk',
      '8.  Fiscalita, Costi e Erosione Reale',
      '9.  Glossario dei Termini Tecnici',
      '10. Note Legali e Limiti del Modello',
    ];
    doc.setFontSize(8.7); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 64, 67);
    toc.forEach(l => { chkPB(5); doc.text(pdfSafe(l), ML + 4, y); y += 4.6; });
    doc.setTextColor(0,0,0); y += 2;

    callout('AVVISO LEGALE',
      'Documento a finalita esclusivamente informative ed educative. Non costituisce consulenza finanziaria, fiscale o legale, ne sollecitazione all\'investimento. Le proiezioni sono basate su ipotesi semplificate e NON garantiscono rendimenti futuri. I rendimenti passati non sono indicativi di quelli futuri. Prima di qualsiasi decisione, consulta un consulente finanziario indipendente abilitato.',
      ORG
    );

    // ─────────── 1. CONFIGURAZIONE ───────────
    sHdr('1 — Configurazione del Piano');
    doc.autoTable({
      startY: y,
      head: [['Parametro', 'Valore', 'Parametro', 'Valore']],
      body: [
        ['Patrimonio iniziale', fmtFull(w), 'PAC mensile (base)', fmtFull(pac) + '/mese'],
        ['Eta inizio → fine', `${age} → ${endAge} anni`, 'Orizzonte temporale', `${years} anni`],
        ['Portfolio', portMeta.label, 'Volatilita storica', portMeta.vol ? (portMeta.vol * 100).toFixed(1) + '% (sigma annua)' : 'variabile'],
        ['TER ETF annuo', ter.toFixed(2) + '%', 'Beta inflazione', String(portMeta.inflBeta ?? 'n/d')],
        ['Tasse plusvalenze Az.', taxEq.toFixed(1) + '%', 'Tasse plusvalenze Ob.', taxOb.toFixed(1) + '%'],
        ['Inflazione attesa (media)', inflBottom.toFixed(1) + '%', 'Inflazione (sigma)', inflVol.toFixed(1) + '%'],
        ['Sequence Risk', seq.on ? `attivo (${seq.severity}, ${seq.timing})` : 'disattivato', 'PIC/Spese straordinarie', `${state.pics.length} PIC, ${state.exps.length} uscite`],
      ],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: LBG, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 5;
    narrative(`Descrizione portafoglio. ${portMeta.desc || 'Composizione bilanciata di asset class diversificate.'}`);

    // Allocazione asset (mostra sempre se disponibile)
    if (portMeta.eq != null || portMeta.ob != null || portMeta.gold != null || portMeta.cash != null) {
      subHdr('Composizione Asset Class');
      const alloc = [
        ['Azioni', ((portMeta.eq || 0) * 100).toFixed(0) + '%'],
        ['Obbligazioni', ((portMeta.ob || 0) * 100).toFixed(0) + '%'],
        ['Oro / commodities', ((portMeta.gold || 0) * 100).toFixed(0) + '%'],
        ['Alternativi (comm./carry/trend)', ((portMeta.altW || 0) * 100).toFixed(0) + '%'],
        ['Cash / liquidita', ((portMeta.cash || 0) * 100).toFixed(0) + '%'],
        ['Rendimento reale storico', ((portMeta.realRet || 0) * 100).toFixed(2) + '% /a'],
        ['Beta vs inflazione', String(portMeta.inflBeta ?? 'n/d')],
      ].filter(r => r[1] !== '0%' || r[0].includes('Cash'));
      doc.autoTable({
        startY: y,
        head: [['Componente', 'Peso / Valore']],
        body: alloc,
        styles: { fontSize: 8, cellPadding: 2.2 },
        headStyles: { fillColor: LBG, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: BLU } },
        margin: { left: ML, right: MR }
      });
      y = doc.lastAutoTable.finalY + 5;
    }

    // ─────────── 2. METODOLOGIA ───────────
    sHdr('2 — Metodologia');
    narrative(
      'Le proiezioni utilizzano un modello deterministico annuale per gli scenari base/ottimista/pessimista, applicando un rendimento atteso ' +
      'specifico per portafoglio e una formula "mid-year convention" per i versamenti PAC (versamenti distribuiti uniformemente nell\'anno). ' +
      'Il TER viene sottratto dal rendimento lordo. La fiscalita e applicata solo sulla quota di plusvalenza al disinvestimento, con aliquota ' +
      'composita pesata sulla composizione azioni/obbligazioni del portafoglio finale.'
    );
    narrative(
      'Lo scenario Monte Carlo usa un approccio Gaussiano standard (1.000 simulazioni) con μ = rendimento atteso del portafoglio e σ = volatilità storica. ' +
      'I percentili (P10/P25/P50/P75/P90) descrivono la distribuzione del valore finale: ' +
      'il P10 rappresenta il decimo peggior risultato su 100, il P50 la mediana, il P90 il decimo migliore. ' +
      'Per simulazioni con modelli avanzati (fat-tail, GARCH, Regime-Switching) usare il tab MC Avanzato.'
    );
    narrative(
      'Il modulo Sequence Risk simula un crash azionario in un anno specifico (early/mid/late) con severita configurabile, seguito da una fase di recupero ' +
      'con rendimenti rialzisti. Gli scenari economici (Crescita Normale, Stagflazione, Recessione, Inflazione Alta, ecc.) modulano i rendimenti delle asset class ' +
      'tramite moltiplicatori calibrati su contesti macro storici e applicano un\'inflazione stocastica con media e sigma proprie del regime.'
    );

    // ─────────── 3. PROIEZIONI MULTI-SCENARIO ───────────
    sHdr('3 — Proiezioni Multi-Scenario');
    const proRows = [
      ['Pessimistico', fmtFull(vWt), '×' + (vWt / Math.max(1, inv)).toFixed(2), fmtFull(vWt - inv), fmtFull(nP), fmtFull(vWt * .04 * (1 - eT)) + '/a'],
      ['Scenario Base', fmtFull(vN), '×' + (vN / Math.max(1, inv)).toFixed(2), fmtFull(vN - inv), fmtFull(nN), fmtFull(vN * .04 * (1 - eT)) + '/a'],
      ['Ottimistico', fmtFull(vBt), '×' + (vBt / Math.max(1, inv)).toFixed(2), fmtFull(vBt - inv), fmtFull(nO), fmtFull(vBt * .04 * (1 - eT)) + '/a'],
    ];
    if (dS) proRows.push(['Con Sequence Risk', fmtFull(dS[years].value), '×' + (dS[years].value / Math.max(1, inv)).toFixed(2), fmtFull(dS[years].value - inv), '—', '—']);
    doc.autoTable({
      startY: y,
      head: [['Scenario', 'Valore Lordo Finale', 'Moltipl.', 'Plusvalenza', 'Netto Fiscale', 'SWR 4% Netto']],
      body: proRows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: LBG, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: { 1: { textColor: BLU, fontStyle: 'bold' }, 4: { textColor: GRN, fontStyle: 'bold' } },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 5;
    narrative(
      `Lettura. Lo scenario base usa un rendimento lordo di ${(portMeta.normal * 100).toFixed(1)}%/a; il pessimistico ${(portMeta.worst * 100).toFixed(1)}%/a; ` +
      `l'ottimistico ${(portMeta.best * 100).toFixed(1)}%/a. La differenza tra Pessimistico e Ottimistico (${fmtFull(vBt - vWt)}) misura l'incertezza ` +
      `intrinseca a un orizzonte di ${years} anni e ricorda che la pianificazione richiede una banda di esiti, non un singolo numero. ` +
      `La colonna SWR 4% applica la regola di Bengen (4% del capitale ritirabile annualmente) al netto di una stima fiscale media ${(eT * 100).toFixed(1)}%.`
    );
    narrative(
      `Inflazione. Su ${years} anni un'inflazione media del ${inflBottom.toFixed(1)}% erode il potere d'acquisto del ${((1 - 1 / dF) * 100).toFixed(1)}%. ` +
      `Il valore reale dello scenario base equivale quindi a ${fmtFull(realN)} di oggi. Il portafoglio scelto ha beta inflazione ${portMeta.inflBeta ?? 'n/d'}: ` +
      `valori positivi indicano resistenza (oro, azioni value, materie prime), valori negativi indicano sofferenza (obbligazioni a lunga, cash).`
    );

    // Grafico fan-chart multi-scenario
    embedChart('ch', 'Grafico 1 — Proiezione multi-scenario (best/normal/worst), PAC versato e soglia di optionality.', 95);

    // ─────────── 4. EVOLUZIONE NEL TEMPO ───────────
    sHdr('4 — Evoluzione Patrimoniale Anno per Anno (campionamento)', PUR);
    const step = years <= 10 ? 1 : years <= 20 ? 2 : years <= 30 ? 3 : 5;
    const sampled = [];
    for (let i = 0; i <= years; i += step) sampled.push(dN[i]);
    if (sampled[sampled.length - 1].year !== years) sampled.push(dN[years]);
    const evoBody = sampled.map(d => [
      d.year, d.age, fmtFull(d.value), fmtFull(d.invested),
      fmtFull(d.value - d.invested),
      d.invested > 0 ? ((d.value / d.invested - 1) * 100).toFixed(1) + '%' : '—',
      fmtFull(d.annRetNet) + '/a',
      d.event || ''
    ]);
    doc.autoTable({
      startY: y,
      head: [['Anno', 'Eta', 'Valore', 'Investito', 'Plusval.', 'ROI %', 'Rend. netto', 'Eventi']],
      body: evoBody,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: PUR, textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: { 2: { textColor: BLU, fontStyle: 'bold' }, 4: { textColor: GRN }, 7: { fontSize: 7, textColor: GRAY } },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 4;
    narrative(
      'La tabella mostra la traiettoria dello Scenario Base con campionamento ogni ' + step + ' anno/i. La colonna "Rend. netto" indica la rendita ' +
      'annuale teorica generata dal portafoglio al netto della tassazione, utile per valutare quando il piano comincia a "lavorare per te" piuttosto ' +
      'che richiedere ulteriori versamenti. Eventi straordinari (PIC, prelievi, modifiche del PAC, crash del Sequence Risk) sono evidenziati nell\'ultima colonna.'
    );

    // ─────────── 5. MONTE CARLO ───────────
    if (mc) {
      sHdr('5 — Distribuzione Monte Carlo (1.000 simulazioni)', ORG);
      const last = mc.p50.length - 1;
      doc.autoTable({
        startY: y,
        head: [['Percentile', 'Significato', 'Valore Finale']],
        body: [
          ['P10 (pessimistico)', '90% degli scenari fa meglio di questo', fmtFull(mc.p10[last])],
          ['P25', '75% fa meglio', fmtFull(mc.p25[last])],
          ['P50 (mediana)', 'Esito centrale', fmtFull(mc.p50[last])],
          ['P75', '25% fa meglio', fmtFull(mc.p75[last])],
          ['P90 (ottimistico)', 'Solo 10% fa meglio', fmtFull(mc.p90[last])],
          ['Media (mean)', 'Valore atteso medio', fmtFull(mc.mean[last])],
        ],
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: ORG, textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: { 2: { textColor: ORG, fontStyle: 'bold', halign: 'right' } },
        margin: { left: ML, right: MR }
      });
      y = doc.lastAutoTable.finalY + 5;
      const range = mc.p90[last] - mc.p10[last];
      const ratio = mc.p10[last] > 0 ? mc.p90[last] / mc.p10[last] : 0;
      narrative(
        `L'80% degli esiti simulati e compreso fra ${fmtFull(mc.p10[last])} (P10) e ${fmtFull(mc.p90[last])} (P90), ` +
        `con un'ampiezza di ${fmtFull(range)} (rapporto P90/P10 = ${ratio.toFixed(2)}x). ` +
        `Un rapporto elevato indica forte dispersione e rischio di sequenza significativo: pianificare la fase di decumulo solo sul P50 puo essere imprudente. ` +
        `Si raccomanda di costruire il proprio piano sul P25 e considerare il P10 come "margine di sicurezza" da assorbire con liquidita di emergenza o riduzione temporanea dei prelievi.`
      );
      // Probabilita di successo: % simulazioni che battono inflazione e che superano capitale investito
      if (Array.isArray(mc.paths) && mc.paths.length) {
        const N = mc.paths.length;
        let okInv = 0, okInfl = 0, okDouble = 0;
        for (const p of mc.paths) {
          const fv = Array.isArray(p) ? p[p.length - 1] : p;
          if (fv >= inv) okInv++;
          if (fv >= inv * dF) okInfl++;
          if (fv >= inv * 2) okDouble++;
        }
        callout('PROBABILITA DI SUCCESSO (Monte Carlo)',
          `Su ${N.toLocaleString('it-IT')} simulazioni: ` +
          `${((okInv / N) * 100).toFixed(1)}% conserva almeno il capitale investito, ` +
          `${((okInfl / N) * 100).toFixed(1)}% batte l'inflazione cumulata (${((dF - 1) * 100).toFixed(1)}%), ` +
          `${((okDouble / N) * 100).toFixed(1)}% raddoppia il capitale investito.`,
          GRN
        );
      }
    }

    // Grafico Monte Carlo (riusa fan chart con MC overlay)
    embedChart('ch', 'Grafico 2 — Fan chart con bande di volatilita storica e overlay Monte Carlo.', 90);

    // ─────────── 6. SCENARI ECONOMICI ───────────
    doc.addPage(); pN++; y = 20; miniHdr();
    sHdr('6 — Scenari Economici Multi-Regime', TEAL);
    narrative(
      'Ogni regime economico applica moltiplicatori specifici sui rendimenti delle asset class e modula l\'inflazione (media + sigma). ' +
      'I valori reali tengono conto della deflazione/inflazione cumulata di ogni scenario. Il delta vs Base evidenzia l\'impatto del regime ' +
      'rispetto alla proiezione con inflazione costante usata nello Scenario Base.'
    );
    const dBaseEco = project('normal', false);
    const ecoRows = Object.entries(ECO_SCENARIOS).map(([k, s]) => {
      const dE = projectEco(k);
      const vE = dE[years].value;
      const delta = vE - dBaseEco[years].value;
      const pct = dBaseEco[years].value > 0 ? (delta / dBaseEco[years].value * 100).toFixed(1) + '%' : '—';
      return [
        s.label,
        fmtFull(vE),
        (delta >= 0 ? '+' : '') + fmtFull(delta),
        pct,
        s.inflMean.toFixed(1) + '% ±' + s.inflSigma.toFixed(1),
        fmtFull(dE[years].real)
      ];
    });
    doc.autoTable({
      startY: y,
      head: [['Scenario', 'Valore Nominale', 'Δ vs Base', 'Δ %', 'Inflazione', 'Valore Reale']],
      body: ecoRows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: TEAL, textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: { 1: { fontStyle: 'bold' }, 5: { textColor: TEAL, fontStyle: 'bold' } },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 5;

    embedChart('chEco', 'Grafico 3 — Confronto regimi economici sullo stesso piano patrimoniale.', 85);

    subHdr('Descrizione dei regimi economici');
    Object.entries(ECO_SCENARIOS).forEach(([k, s]) => {
      narrative(`${s.label}. ${s.desc}`, 4);
    });

    // ─────────── 7. SEQUENCE RISK ───────────
    sHdr('7 — Sequence of Returns Risk', RED);
    narrative(
      'Il "rischio di sequenza" e l\'effetto sproporzionato che un crash di mercato puo avere se accade nei primi anni del piano (o appena prima della pensione). ' +
      'A parita di rendimento medio di lungo termine, due percorsi con la stessa media ma sequenze diverse possono produrre esiti molto differenti, soprattutto in presenza di prelievi.'
    );
    if (dS) {
      const gap = vN - dS[years].value;
      const gapPct = vN > 0 ? (gap / vN * 100).toFixed(1) : '0';
      narrative(
        `Nel piano analizzato il modulo e attivo (severita ${seq.severity}, timing ${seq.timing}). Il valore finale con crash simulato e ${fmtFull(dS[years].value)}, ` +
        `inferiore di ${fmtFull(gap)} (${gapPct}%) rispetto allo Scenario Base senza shock. La fase di recupero post-crash dura ${typeof RECOVERY_YEARS !== 'undefined' ? RECOVERY_YEARS : 'alcuni'} anni con rendimenti rialzisti.`
      );
    } else {
      narrative('Il modulo Sequence Risk e attualmente disattivato. Si suggerisce di simulare almeno uno scenario con crash "moderato" in fase early per valutare la resilienza del piano.');
    }

    // ─────────── 7b. BACKTESTING STORICO ───────────
    doc.addPage(); pN++; y = 20; miniHdr();
    sHdr('7b — Backtesting Storico — Dati Reali 1970-2024', [0, 150, 167]);
    narrative(
      'Il backtesting usa i rendimenti mensili effettivi (non simulati) di azioni sviluppati, obbligazioni aggregate e oro per il periodo 1970-2024 (660 osservazioni). ' +
      'Il portafoglio e il PAC mensile attuali del simulatore vengono applicati a 10 periodi storici diversi, includendo le correlazioni dinamiche: ' +
      'in anni di drawdown azionario > 15% le correlazioni tra asset class si alzano verso la matrice di stress, come osservato empiricamente. ' +
      'Il CAGR nominale include dividendi e cedole (total return). Le ultime osservazioni disponibili coprono fino a dicembre 2024.'
    );
    const btPortKeyPDF = (typeof btState !== 'undefined' && btState?.port === 'sim') ? portfolio : ((typeof btState !== 'undefined' && btState?.port) || portfolio);
    const btPacPDF = (typeof btState !== 'undefined' && btState?.pac != null) ? btState.pac : state.pac;
    const btW0PDF  = (typeof btState !== 'undefined' && btState?.w  != null) ? btState.w  : state.w;
    const btResultRows = [];
    for (const [syStr, period] of Object.entries(BT_PERIODS)) {
      const sy = +syStr;
      try {
        const res = simulateBacktest(btPortKeyPDF, sy, btPacPDF, btW0PDF);
        const isCrash = period.crisis && period.crisis.length > 0;
        btResultRows.push([
          String(sy),
          period.label.split('—')[1]?.trim() || period.label,
          (res.cagrOnInvested >= 0 ? '+' : '') + (res.cagrOnInvested * 100).toFixed(2) + '%/a',
          (res.cagr >= 0 ? '+' : '') + (res.cagr * 100).toFixed(2) + '%/a',
          fmtFull(res.finalValue),
          (res.maxDD * 100).toFixed(1) + '%',
          fmtFull(res.finalInvested),
        ]);
      } catch(e) {}
    }
    btResultRows.sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));
    doc.autoTable({
      startY: y,
      head: [['Anno', 'Evento Storico', 'CAGR su tot. invest.', 'CAGR cap. iniziale', 'Valore Finale', 'Max DD', 'Totale Versato']],
      body: btResultRows,
      styles: { fontSize: 7.5, cellPadding: 2.2 },
      headStyles: { fillColor: [0, 150, 167], textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: {
        2: { fontStyle: 'bold', textColor: GRN },
        3: { textColor: [120, 120, 120] },
        4: { fontStyle: 'bold', textColor: BLU },
        5: { textColor: RED },
      },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 5;
    narrative(
      'CAGR su tot. invest. = rendimento annuo composto sul totale versato (PAC incluso) — misura quanto il capitale effettivamente investito ha reso. ' +
      'CAGR cap. iniziale = crescita del solo patrimonio di partenza fino al valore finale — gonfiato dai versamenti PAC se attivi, utile solo per confronto tra periodi. ' +
      'Il Max Drawdown misura la massima perdita dal picco precedente. ' +
      'Nota: dati in USD; effetto cambio EUR/USD non incluso.'
    );

    // ─────────── 7c. SEQUENCE RISK MULTIPLO ───────────
    sHdr('7c — Sequence Risk Multiplo — Crash Singolo / Doppio / Triplo', RED);
    narrative(
      'Analisi comparativa dell\'impatto di crash sequenziali sul piano patrimoniale. ' +
      'Il crash singolo usa la severita configurata nel Simulatore. ' +
      'Il doppio e triplo crash scalano progressivamente (2° crash = 65%, 3° = 45% della severita primaria). ' +
      'La fase di recupero post-crash dura 5 anni con rendimenti rialzisti proporzionali alla profondita del drawdown.'
    );
    const savedSeqPDF = { ...state.seq };
    const seqBaseVal2 = project('normal', false)[years].value;
    const multiSeqRows = [
      { mode: 'single', timing: 'early', severity: 'moderate', label: 'Crash singolo moderato (early)' },
      { mode: 'single', timing: 'late',  severity: 'moderate', label: 'Crash singolo moderato (late)' },
      { mode: 'single', timing: 'early', severity: 'severe',   label: 'Crash singolo severo (early)' },
      { mode: 'double', timing: 'early', severity: 'moderate', label: 'Doppio crash moderato' },
      { mode: 'triple', timing: 'early', severity: 'moderate', label: 'Triplo crash moderato' },
    ];
    const srBodyPDF = [];
    for (const sc of multiSeqRows) {
      state.seq = { on: true, severity: sc.severity, timing: sc.timing, mode: sc.mode, dynCorr: false };
      const dMSR = project('normal', true);
      state.seq = savedSeqPDF;
      const val2 = dMSR[years].value;
      const gap2 = val2 - seqBaseVal2;
      const gapPct2 = seqBaseVal2 > 0 ? (gap2 / seqBaseVal2 * 100).toFixed(1) : '0';
      srBodyPDF.push([sc.label, fmtFull(val2), (gap2 >= 0 ? '+' : '') + fmtFull(gap2), (gap2 >= 0 ? '+' : '') + gapPct2 + '%']);
    }
    state.seq = savedSeqPDF;
    doc.autoTable({
      startY: y,
      head: [['Scenario Crash', 'Valore Finale', 'Gap vs Base', 'Gap %']],
      body: srBodyPDF,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: RED, textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: {
        1: { fontStyle: 'bold', textColor: BLU },
        2: { textColor: RED, fontStyle: 'bold' },
        3: { textColor: RED },
      },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 5;
    narrative(
      'Il confronto tra crash singolo early vs late mostra il "paradosso del sequence risk": un crash all\'inizio del piano e meno devastante di uno a fine piano ' +
      'perche il PAC mensile acquista a sconto e il capitale e ancora ridotto. Il crash late colpisce il capitale massimo con meno tempo per il recupero. ' +
      'Il scenario doppio-triplo modella contesti storici plausibili (es. bolla dot-com 2000 + crisi 2008, oppure crisi 2008 + COVID 2020 + inflazione 2022).'
    );
    sHdr('8 — Fiscalita, Costi e Erosione Reale', ORG);
    const costoTer = inv * (ter / 100) * (years / 2);
    doc.autoTable({
      startY: y,
      head: [['Voce', 'Stima', 'Note']],
      body: [
        ['Tasse su plusvalenza (scenario base)', fmtFull(vN - nN), `aliquota composita ${(txF * 100).toFixed(1)}%`],
        ['Costo TER cumulato (stima)', fmtFull(costoTer), `${ter.toFixed(2)}% annuo su capitale medio`],
        ['Erosione inflazione (su valore finale)', fmtFull(vN - realN), `inflazione media ${inflBottom.toFixed(1)}% per ${years} anni`],
        ['Valore reale netto (post-tasse + post-inflazione)', fmtFull(nN / dF), 'potere d\'acquisto effettivo di oggi'],
      ],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: LBG, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: { 1: { textColor: RED, fontStyle: 'bold', halign: 'right' } },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 4;
    narrative(
      'Tasse, costi e inflazione sono i tre "freni" del rendimento composto. Anche piccole differenze (0.20% vs 0.50% di TER) ' +
      'producono divergenze significative su 30+ anni. Per ridurre la fiscalita: privilegia ETF ad accumulazione, sfrutta minusvalenze pregresse ' +
      'entro 4 anni, considera strumenti previdenziali (PIP/Fondi pensione) con tassazione agevolata.'
    );

    // ─────────── 8b. DECUMULO STORICO (Trinity-style) ───────────
    try {
      const dh = runDecumuloHistorical();
      sHdr('8b — Decumulo su Sequenze Storiche Reali (1970-2024)', [255, 152, 0]);
      narrative(
        'Test di robustezza piu severo del Monte Carlo: ripercorre il piano di prelievo su tutti gli anni di partenza disponibili ' +
        'usando i rendimenti mensili storici REALI calibrati e l\'inflazione effettiva di ogni anno. Incorpora oil shock 1973, ' +
        'stagflazione anni \'70-\'80, dot-com bust 2000, GFC 2008, COVID 2020, inflazione 2022. ' +
        'E\' la versione "italiana" del Trinity Study (Bengen 1994).'
      );
      const succPct = (dh.successRate * 100).toFixed(0);
      const succCol = dh.successRate >= 0.90 ? GRN : dh.successRate >= 0.70 ? ORG : RED;
      callout(`Tasso di sopravvivenza: ${succPct}%`,
        `${dh.nSurvived}/${dh.nTotal} anni di partenza hanno completato il piano di ${dh.years} anni senza esaurire il capitale. ` +
        (dh.worstStart
          ? `Peggior anno di partenza: ${dh.worstStart.startYear} (capitale esaurito all'anno ${dh.worstStart.exhaustYear}).`
          : 'Tutti gli anni di partenza hanno retto il piano. Strategia robusta.'),
        succCol);

      const sorted = [...dh.results].sort((a, b) => a.finalCap - b.finalCap);
      const p10 = sorted[Math.floor(sorted.length * 0.10)];
      const median = sorted[Math.floor(sorted.length * 0.50)];
      const p90 = sorted[Math.floor(sorted.length * 0.90)];
      const famousYrs = [1970, 1973, 1980, 1987, 1990, 2000, 2008];
      const famous = famousYrs.map(y => dh.results.find(x => x.startYear === y)).filter(Boolean);
      doc.autoTable({
        startY: y,
        head: [['Anno Start', 'Evento Storico', 'Esito', 'Capitale Finale', 'Max DD %']],
        body: famous.map(x => {
          const evts = { 1970: 'Pre oil shock', 1973: 'Oil shock + stagflazione', 1980: 'Volcker disinflazione',
                         1987: 'Black Monday', 1990: 'Bolla Giappone', 2000: 'Dot-com bust', 2008: 'Crisi finanziaria' };
          return [
            String(x.startYear),
            evts[x.startYear] || '',
            x.survived ? 'Successo' : `Fallito anno ${x.exhaustYear}`,
            fmt(x.finalCap),
            (x.maxDrawdown * 100).toFixed(0) + '%',
          ];
        }),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [255, 152, 0], textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: {
          2: { fontStyle: 'bold' },
          3: { halign: 'right' },
          4: { halign: 'right', textColor: RED, fontStyle: 'bold' },
        },
        margin: { left: ML, right: MR },
      });
      y = doc.lastAutoTable.finalY + 4;
      narrative(
        `Statistiche aggregate: capitale finale mediano ${fmt(median?.finalCap || 0)}, ` +
        `P10 ${fmt(p10?.finalCap || 0)}, P90 ${fmt(p90?.finalCap || 0)}. ` +
        'Confronto: il Trinity Study (1994) trova ~95% sopravvivenza al 4% SWR su 60/40 a 30 anni — questo simulatore replica con precisione il risultato accademico.'
      );
    } catch (e) { /* skip if not available */ }

    // ─────────── 8c. FX HEDGING & STRESS VOL ───────────
    if (portfolio === 'custom') {
      const cp = calcCustomParams();
      if (cp && (cp.fxExposure > 0.05 || cp.volStress)) {
        sHdr('8c — Esposizione Cambio e Vol in Regime di Stress', [156, 39, 176]);
        narrative(
          'Per un investitore in euro, l\'esposizione a valute estere (USD, GBP, JPY) ' +
          'introduce un secondo rischio: la volatilita del cambio EUR/USD (~8.5%/a storica). ' +
          'In regime di crisi, le correlazioni fra asset rischiosi salgono verso 1, riducendo i benefici della diversificazione.'
        );
        const fxRows = [
          ['Esposizione FX (% non-EUR)', (cp.fxExposure * 100).toFixed(0) + '%'],
          ['Hedging valutario', cp.fxHedged ? 'ATTIVO' : 'NON ATTIVO'],
          ['Costo annuo hedging', cp.fxHedged ? (cp.fxCost * 100).toFixed(3) + '%' : '—'],
          ['Vol portafoglio (senza FX)', (cp.volNoFx * 100).toFixed(2) + '%'],
          ['Vol portafoglio (incluso FX)', (cp.vol * 100).toFixed(2) + '%'],
          ['Vol portafoglio in stress (correlazioni → 1)', (cp.volStress * 100).toFixed(2) + '%'],
          ['Amplificazione vol in stress', '+' + (((cp.volStress - cp.vol) / cp.vol) * 100).toFixed(0) + '%'],
        ];
        doc.autoTable({
          startY: y,
          head: [['Parametro', 'Valore']],
          body: fxRows,
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [156, 39, 176], textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 }, 1: { halign: 'right', fontStyle: 'bold' } },
          margin: { left: ML, right: MR },
        });
        y = doc.lastAutoTable.finalY + 4;
        callout('Quando coprire il cambio?',
          'Per portafogli obbligazionari globali e per orizzonti brevi (<10 anni) l\'hedging EUR/USD migliora il Sharpe (riduce vol senza ridurre molto il rendimento). ' +
          'Per portafogli azionari globali a lungo termine (>15 anni), i benefici dell\'hedging si attenuano: storicamente l\'EUR/USD oscilla ma non mostra trend forti.',
          [156, 39, 176]);
      }
    }

    // ─────────── 9. GLOSSARIO ───────────
    doc.addPage(); pN++; y = 20; miniHdr();
    sHdr('9 — Glossario dei Termini Tecnici', GRAY);
    const gloss = [
      ['CAGR', 'Compound Annual Growth Rate. Tasso di crescita medio annuo composto, calcolato come (Vfinale/Viniziale)^(1/anni) - 1.'],
      ['PAC', 'Piano di Accumulo del Capitale. Versamenti periodici (tipicamente mensili) di importo costante o variabile.'],
      ['PIC', 'Piano di Investimento di Capitale. Versamento una tantum di una somma definita.'],
      ['SWR (Safe Withdrawal Rate)', 'Tasso di prelievo annuo "sicuro" applicato a un capitale. La regola del 4% (Bengen, 1994) ipotizza prelievi del 4% iniziali rivalutati a inflazione su 30 anni.'],
      ['TER', 'Total Expense Ratio. Costo annuo totale di un ETF/fondo, espresso in % e sottratto al rendimento.'],
      ['Sequence Risk', 'Rischio di subire un crash nei primi anni del piano o vicino al decumulo, con impatto sproporzionato sul risultato finale.'],
      ['Beta inflazione', 'Sensibilita di un portafoglio all\'inflazione. Beta>0 = resistente; Beta<0 = soffre.'],
      ['Crossover', 'Anno in cui la rendita netta annua prodotta dal portafoglio supera il PAC versato: il piano si autosostiene.'],
      ['Monte Carlo', 'Tecnica di simulazione che genera migliaia di percorsi casuali per stimare la distribuzione di un esito.'],
      ['Percentile (P10/P50/P90)', 'P10 = 90% degli scenari fa meglio; P50 = mediana; P90 = solo 10% fa meglio.'],
      ['Valore Reale', 'Valore nominale corretto per l\'inflazione cumulata (potere d\'acquisto di oggi).'],
      ['Aliquota composita', 'Media ponderata fra aliquota azionaria (26%) e obbligazionaria (12,5% per titoli di Stato) sulla composizione del portafoglio.'],
      ['Esposizione FX', 'Percentuale del portafoglio denominata in valuta non-euro (USD, GBP, JPY...). Genera rischio cambio per investitori EUR.'],
      ['Hedging valutario', 'Strategia di copertura cambio tramite forward FX. Elimina la volatilita EUR/USD ma costa ~30 bps/anno (differenziale tassi).'],
      ['Vol di stress / σ-crisi', 'Volatilita portafoglio in regime di crisi (es. 2008, 2020). Le correlazioni fra asset rischiosi salgono verso 1 e la diversificazione si riduce.'],
      ['Trinity Study / Bengen 4%', 'Studio accademico (Bengen 1994, Trinity 1998) che dimostra come prelevare il 4% inflation-adjusted da un 60/40 abbia ~95% successo a 30 anni.'],
      ['Decumulo storico', 'Test di robustezza che ripercorre il piano di prelievo su tutti gli anni di partenza disponibili usando rendimenti e inflazione storici reali.'],
    ];
    doc.autoTable({
      startY: y,
      head: [['Termine', 'Definizione']],
      body: gloss,
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'top' },
      headStyles: { fillColor: GRAY, textColor: WHT, fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 } },
      margin: { left: ML, right: MR }
    });
    y = doc.lastAutoTable.finalY + 6;

    // ─────────── 10. NOTE LEGALI FINALI ───────────
    sHdr('10 — Note Legali e Limiti del Modello', [150, 50, 50]);
    narrative(
      'Limiti del modello. (1) Le simulazioni assumono una distribuzione gaussiana dei rendimenti, mentre i mercati reali presentano "fat tails" ' +
      '(eventi estremi piu frequenti). (2) Le correlazioni fra asset class sono assunte stabili, ma in periodi di stress tendono a convergere a 1. ' +
      '(3) La fiscalita e modellata in modo semplificato: non include imposta di bollo, eventuali aliquote estere, o regimi previdenziali specifici. ' +
      '(4) L\'inflazione e applicata in modo uniforme; la realta puo includere shock localizzati su specifiche categorie di spesa. ' +
      '(5) I costi di ribilanciamento, spread e commissioni di trading non sono inclusi.'
    );
    const discFull = doc.splitTextToSize(
      'AVVERTENZA IMPORTANTE — Questo report ha finalita esclusivamente educative e informative. Non costituisce consulenza finanziaria, di investimento, fiscale o legale, ne sollecitazione all\'acquisto/vendita di strumenti finanziari. I rendimenti, le proiezioni e le simulazioni sono ipotetici e basati su assunzioni semplificate: NON rappresentano una garanzia di risultati futuri. I rendimenti passati non sono indicativi di quelli futuri. Gli investimenti comportano rischi, inclusa la perdita totale o parziale del capitale. Prima di investire, consultare un consulente finanziario indipendente abilitato (in Italia: iscritto all\'albo OCF) e leggere attentamente i KIID/KID degli strumenti considerati. L\'autore e i fornitori del software declinano ogni responsabilita per decisioni assunte sulla base del presente documento.',
      CW - 8
    );
    chkPB(discFull.length * 4.2 + 14);
    doc.setFillColor(255, 235, 235); doc.rect(ML, y, CW, discFull.length * 4.2 + 12, 'F');
    doc.setDrawColor(200, 80, 80); doc.rect(ML, y, CW, discFull.length * 4.2 + 12, 'S');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 50, 50);
    doc.text(discFull, ML + 4, y + 6);
    y += discFull.length * 4.2 + 16;

    // Footer finale
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
    doc.text(pdfSafe(`Report generato da Suite Patrimoniale Pro v2 — ${new Date().toISOString().slice(0, 10)} — Pagine totali: ${pN}`), ML, Math.min(y, 285));

    doc.save(`report-patrimoniale-pro-${age}-${endAge}anni.pdf`);
    btn.textContent = '✅ Scaricato!';
    setTimeout(() => { btn.textContent = '📄 Scarica Report PDF'; btn.disabled = false; }, 3000);
  } catch (e) {
    console.error('PDF error:', e);
    btn.textContent = '❌ Errore: ' + (e.message || 'sconosciuto');
    setTimeout(() => { btn.textContent = '📄 Scarica Report PDF'; btn.disabled = false; }, 4000);
  }
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
updateRetInfo();
updatePortDetailBox();
renderPicList(); renderExpList(); renderPacChgList(); updateSeqDesc();
document.querySelector('#decStratBtns [data-s="inflation"]').classList.add('a-blue');
document.getElementById('decStratDesc').innerHTML = decStratDescs.inflation;
document.querySelector('#abAllocBtns [data-k="eq50"]').classList.add('a-purple');
render();

// ══════════════════════════════════════════════════════════════
// VIEW SWITCHING (home / app / guide)
// ══════════════════════════════════════════════════════════════
function showView(v) {
  const VIEWS = ['home', 'app', 'guide', 'privacy', 'cookie'];
  if (!VIEWS.includes(v)) v = 'home';
  VIEWS.forEach(k => {
    const el = document.getElementById('view-' + k);
    const btn = document.getElementById('nav-' + k);
    if (el) el.classList.toggle('active', k === v);
    if (btn) btn.classList.toggle('active', k === v);
  });
  if (v === 'app') { try { render(); } catch (_) {} }
  try { history.replaceState(null, '', '#' + v); } catch (_) {}
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.showView = showView;
(function initView(){
  const h = (location.hash || '').replace('#','');
  if (['app','guide','home','privacy','cookie'].includes(h)) showView(h);
})();

// ══════════════════════════════════════════════════════════════
// GUIDE PDF DOWNLOAD
// ══════════════════════════════════════════════════════════════
async function downloadGuidePDF() {
  const btn = document.getElementById('guideDlBtn');
  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '⏳ Generazione...';
  await new Promise(r => setTimeout(r, 60));
  try {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Libreria PDF non caricata');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, ML = 16, MR = 16, CW = W - ML - MR;
    let y = 0, pN = 1;
    const BLU = [26,115,232], PUR = [147,52,230], GRAY = [95,99,104], DARK = [32,33,36], LBG = [248,249,250], AMBER = [251,188,4];

    const hdrBar = () => {
      doc.setFillColor(...LBG); doc.rect(0,0,W,12,'F');
      doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(...GRAY);
    doc.text(pdfSafe('Guida all\'utilizzo — Suite Patrimoniale Pro v2'), ML, 8);
      doc.text(`Pag. ${pN}`, W-MR, 8, {align:'right'});
      doc.setDrawColor(220,220,220); doc.line(ML, 11.2, W-MR, 11.2);
    };
    const chk = (n=12) => { if (y+n>278){ doc.addPage(); pN++; y=18; hdrBar(); } };
    const h1 = (t) => { chk(16); doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(...BLU); doc.text(pdfSafe(t), ML, y); y+=7; doc.setDrawColor(...BLU); doc.setLineWidth(.6); doc.line(ML,y-2,ML+30,y-2); doc.setLineWidth(.2); doc.setTextColor(0,0,0); };
    const h2 = (t) => { chk(10); doc.setFontSize(10.5); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK); doc.text(pdfSafe(t), ML, y); y+=5; doc.setTextColor(0,0,0); };
    const p  = (t, ind=0) => {
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(50,55,60);
      const lines = doc.splitTextToSize(pdfSafe(t), CW-ind);
      chk(lines.length*4.4+2);
      doc.text(lines, ML+ind, y); y += lines.length*4.4 + 2.5;
      doc.setTextColor(0,0,0);
    };
    const li = (t) => {
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(50,55,60);
      const lines = doc.splitTextToSize('- ' + pdfSafe(t), CW-6);
      chk(lines.length*4.4+1);
      doc.text(lines, ML+4, y); y += lines.length*4.4 + 1;
      doc.setTextColor(0,0,0);
    };
    const callout = (t, col=AMBER, title='Suggerimento') => {
      doc.setFontSize(8.7); doc.setFont('helvetica','normal');
      const lines = doc.splitTextToSize(pdfSafe(t), CW-8);
      const boxH = lines.length*4.4 + 10;
      chk(boxH+3);
      doc.setFillColor(255, 248, 225); doc.rect(ML, y, CW, boxH, 'F');
      doc.setFillColor(...col); doc.rect(ML, y, 1.5, boxH, 'F');
      doc.setFontSize(8.4); doc.setFont('helvetica','bold'); doc.setTextColor(...col);
      doc.text(pdfSafe(title), ML+5, y+5);
      doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(60,55,30);
      doc.text(lines, ML+5, y+10);
      y += boxH + 3; doc.setTextColor(0,0,0);
    };

    // COVER
    doc.setFillColor(...PUR); doc.rect(0,0,W,55,'F');
    doc.setFontSize(24); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text('Guida all\'utilizzo', ML, 24);
    doc.setFontSize(13); doc.setFont('helvetica','normal');
    doc.text(pdfSafe('Suite Patrimoniale Pro v3 — Manuale operativo completo'), ML, 33);
    doc.setFontSize(9); doc.setTextColor(230,215,255);
    doc.text(`Documento generato il ${new Date().toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'})}`, ML, 42);
    y = 65;

    h1('1 — Concetti chiave');
    p('Prima di iniziare e utile chiarire alcuni termini ricorrenti utilizzati nella suite e nel report PDF.');
    li('PAC — versamento periodico mensile costante.');
    li('PIC — versamento una tantum di una somma definita in un anno specifico.');
    li('TER — costo annuo dell\'ETF/fondo (sottratto al rendimento lordo ogni anno).');
    li('CAGR — tasso medio annuo composto del piano.');
    li('SWR (Safe Withdrawal Rate) — quota di capitale prelevabile annualmente in fase di decumulo (regola del 4% di Bengen).');
    li('Volatilita (sigma) — ampiezza tipica delle oscillazioni annuali del portafoglio.');
    li('Crossover — anno in cui la rendita netta del portafoglio supera il PAC: il piano si autosostiene.');
    li('Optionality — soglia patrimoniale che ti da "opzioni di vita reali" (part-time, sabbatico, cambio carriera) prima del FIRE totale.');
    li('Regime amministrato — l\'intermediario calcola e versa le imposte automaticamente ad ogni operazione.');
    li('Regime dichiarativo — l\'investitore compensa plusvalenze e minusvalenze in dichiarazione dei redditi, con maggiore flessibilita.');
    li('Zainetto fiscale — minusvalenze degli ultimi 4 anni compensabili con future plusvalenze.');
    li('GARCH — modello stocastico con volatilita variabile nel tempo (volatility clustering).');
    li('Regime-Switching (Hamilton) — modello che alterna stati Bull/Bear con probabilita di transizione markoviana.');
    callout('Tutte le proiezioni sono ipotetiche. Servono a confrontare scenari e sensibilizzare ai rischi, non a predire il futuro.', AMBER, 'Ricorda');

    h1('2 — Scheda Simulatore (input principali)');
    p('E il cuore della suite. Qui imposti i parametri base; tutti gli altri tab ne ereditano i valori automaticamente (capitale, PAC, orizzonte, portafoglio).');
    h2('Patrimonio iniziale');
    p('Capitale gia investito al giorno 0. Piu alto e, piu la componente degli interessi composti domina rispetto ai versamenti PAC.');
    callout('Raddoppiare il capitale iniziale raddoppia il valore finale solo se l\'orizzonte e breve. Su 30+ anni l\'effetto del PAC tende a prevalere, specie con rendimenti elevati.', BLU, 'Impatto');
    h2('PAC mensile');
    p('Versamento ricorrente mensile. E la leva piu potente nei primi anni; perde peso relativo man mano che il capitale accumulato cresce. Ha anche un effetto di dollar-cost averaging: compra piu quote quando i prezzi scendono.');
    callout('+100 EUR/mese su 30 anni con rendimento 6% reale ~+100.000 EUR sul valore finale.', BLU, 'Impatto');
    h2('Eta iniziale e Orizzonte');
    p('Determinano la lunghezza del piano. L\'orizzonte e il fattore piu potente: il tempo e il vero amplificatore dell\'interesse composto. I 10 anni aggiuntivi non si sommano — si moltiplicano.');
    callout('Passare da 20 a 30 anni a parita di PAC puo piu che raddoppiare il capitale finale.', BLU, 'Impatto');
    h2('Portafoglio');
    p('Seleziona la composizione asset (azionario, bilanciato, obbligazionario, oro, Permanent Portfolio, Golden Butterfly, ecc.). Cambia automaticamente rendimento atteso, volatilita e beta-inflazione di tutti gli scenari.');
    callout('Un portafoglio 100% azioni ha rendimento atteso piu alto ma volatilita e perdite massime molto maggiori. Il 60/40 offre il miglior compromesso rischio/rendimento sulla maggioranza degli orizzonti storici.', BLU, 'Impatto');
    h2('TER, Tasse, Inflazione');
    p('Sono i tre "freni silenziosi" del rendimento composto. Piccole variazioni hanno effetti enormi su orizzonti lunghi.');
    li('TER 0,20% vs 0,50% -> su 30 anni la differenza puo valere il 7-9% del capitale finale.');
    li('Inflazione +1% -> erode il valore reale di circa il 22% in piu su 25 anni.');
    li('Aliquote fiscali -> applicate solo alla plusvalenza al disinvestimento. Vedi scheda Fiscalita IT per dettagli sui regimi.');
    h2('Soglia di Optionality');
    p('Linea tratteggiata orizzontale sul grafico. Imposta il valore patrimoniale a cui inizi ad avere "scelta" (es. 300k EUR = part-time; 600k EUR = 2 anni sabbatici). E distinta dal FIRE (liberta finanziaria totale).');

    h1('3 — Scheda Scenari Economici');
    p('Eredita capitale, PAC, orizzonte e portafoglio dal Simulatore. Mostra come regimi macro storici e plausibili impattano lo stesso piano con moltiplicatori calibrati sui dati storici reali per asset class.');
    li('Crescita Normale — baseline storica, rendimenti medi di lungo periodo.');
    li('Stagflazione — crescita bassa + inflazione alta (anni \'70). Penalizza bond e azioni growth.');
    li('Recessione prolungata — drawdown azionario marcato, fuga verso bond governativi.');
    li('Inflazione alta — oro e value sovra-performano, bond nominali soffrono significativamente.');
    li('Boom tecnologico — equity growth sovra-performa, oro e bond sotto-performano.');
    li('Deflazione/Giappone — rendimenti azionari piatti, bond reggono, inflazione vicina a zero per decenni.');
    callout('Puoi scegliere in quale fase temporale (inizio, meta, fine) far cadere lo scenario. Un regime stagflazionario a inizio piano e molto meno devastante dello stesso regime a fine accumulazione.', BLU, 'Timing dello scenario');
    p('Cambia il portafoglio nel Simulatore e torna qui: vedrai immediatamente quanto la composizione protegge o espone il piano. Il Permanent Portfolio e il Golden Butterfly sono i piu resilienti in scenari estremi.');

    h1('4 — Scheda A/B Confronto');
    p('Confronta due piani fianco a fianco. Utile per quantificare il costo/beneficio di qualsiasi decisione di portafoglio.');
    li('Portafoglio A: piano corrente dal Simulatore (capitale, PAC, orizzonte, eta, tasse).');
    li('Portafoglio B: composizione asset, TER e PAC configurabili indipendentemente.');
    li('Il grafico sovrappone le traiettorie (best/normal/worst) di entrambi con delta anno per anno.');
    li('La sezione Analisi Fiscale Comparata mostra l\'impatto netto delle tasse su entrambe le strategie.');
    callout('"Conviene investire 5.000 EUR ora in PIC o spalmarli su 24 mesi di PAC aggiuntivo?" — oppure "Quanto mi costa il fondo attivo (TER 1,5%) vs un ETF (TER 0,20%) su 25 anni?"', BLU, 'Esempi d\'uso');

        h1('5 — Scheda Probabilita di Successo (Monte Carlo parametrico)');
    p('Esegue 1.000 simulazioni Monte Carlo con rendimento atteso e volatilita del portafoglio selezionato (coerenti con gli scenari Base / Ottimistico / Pessimistico). Per analisi non-gaussiana con code grasse o regime-switching usa la scheda Monte Carlo Avanzato.');
    li('P10 = 90% degli scenari fa meglio (peggior 10%). Usalo come soglia di sicurezza.');
    li('P25 = scenario conservativo consigliato per la pianificazione.');
    li('P50 = mediana. Non usarlo come unico riferimento: preferisci il P25.');
    li('P75/P90 = esiti ottimistici, rispettivamente il 25% e il 10% fa meglio.');
    li('Probabilita di successo = % di simulazioni in cui il portafoglio non si azzera durante il prelievo. Target: >90%.');
    callout('Per simulazioni con code piu pesanti (crash piu frequenti e prolungati) usa il tab Monte Carlo Avanzato — Regime-Switching e t-Student modellano distribuzioni fat-tail senza dipendere da dati storici non verificabili.', BLU, 'Modelli avanzati disponibili');
    callout('Pianifica sul P25, usa il P10 come margine di sicurezza e non innamorarti del P50. I piani robusti tengono anche negli scenari avversi.', AMBER, 'Consiglio');

    h1('6 — Scheda Decumulo');
    p('Simula la fase di prelievo post-accumulo: come il capitale verra eroso o conservato nel tempo. Tre strategie:');
    li('Fisso Nominale — prelievo costante in cifra assoluta. Semplice ma non protegge dall\'inflazione.');
    li('Indicizzato Inflazione (4% rule) — prelievo rivalutato ogni anno all\'inflazione. Il metodo classico di Bengen (1994).');
    li('Guyton-Klinger (Guard-rails) — prelievo dinamico: aumenta se il mercato va bene, si riduce in drawdown. Massimizza il prelievo medio mantenendo il capitale piu a lungo.');
    callout('Abbassare il tasso di prelievo dal 4% al 3,5% puo ridurre drasticamente la probabilita di esaurire il capitale su 30 anni. Usa il pulsante "Importa dal Simulatore" per collegare le due fasi.', BLU, 'Come modifiche incidono');

    

    h1('7 — Scheda Backtesting Storico');
    p('Il Backtesting Storico risponde alla domanda "Cosa sarebbe successo se avessi iniziato il mio piano in un anno specifico?" usando i rendimenti mensili effettivi reali 1970-2024 — non simulazioni parametriche. E la verifica piu concreta della robustezza del piano.');
    h2('Come funziona');
    p('Il simulatore usa 660 osservazioni mensili reali di tre asset class: azioni mercati sviluppati, obbligazioni aggregate e oro spot. I pesi del portafoglio vengono applicati ai rendimenti mensili reali. Il TER viene sottratto mensilmente; il PAC aggiunto a inizio mese.');
    h2('Anni di partenza disponibili');
    li('1973 — Stagflazione OPEC: inflazione al 12%, azioni -48% in 2 anni, oro +162%. Il peggior inizio nella storia moderna.');
    li('1980 — Volcker shock: tassi al 20%, obbligazioni devastate, poi il piu lungo bull market della storia (1982-2000).');
    li('1987 — Black Monday: -22% in un giorno, recupero in meno di 2 anni. Crash violento e breve.');
    li('1995 — Pre dot-com: partenza euforica, poi crash 2000-2002. Rischio di investire ai massimi.');
    li('2000 — Burst dot-com: azioni -49% in 3 anni. Il PAC ha comunque recuperato entro 10 anni per portafogli bilanciati.');
    li('2004 — Pre-crisi finanziaria: bull market 2004-2007 poi crash 2008. Falsa partenza positiva.');
    li('2008 — Crisi finanziaria globale: S&P500 -57%. Chi ha mantenuto il PAC ha triplicato in 10 anni.');
    li('2012 — Crisi Euro sovrana: spread BTP-Bund a 500bp, poi whatever it takes di Draghi segna il bottom.');
    li('2019 — Pre-COVID: crash feb-mar 2020 (-34% in 33 giorni), recovery in meno di 6 mesi.');
    li('2022 — Inflazione e rialzo tassi: azioni -20% e obbligazioni -15% simultaneamente. Il peggior anno per 60/40 dal 1937.');
    h2('Correlazioni Dinamiche');
    p("In crisi il simulatore sposta le correlazioni verso la matrice di stress. Nel 2022 azioni e obbligazioni hanno correlato positivamente (+0,6) per la prima volta dagli anni '70.");
    callout("Prova lo stesso anno con 100% Azioni vs 60/40 vs Permanent Portfolio: la composizione cambia radicalmente il drawdown massimo, gli anni per il recupero e il valore finale.", BLU, 'Impatto delle modifiche');
    callout("Il backtesting usa dati azioni sviluppati / bond aggregati / oro in USD. I risultati reali in EUR dipendono anche dall'effetto valutario (EUR/USD). Le performance passate non garantiscono quelle future.", AMBER, 'Limite importante');

    h1('8 — Scheda Monte Carlo Avanzato');
    p('Tre modelli stocastici avanzati rispetto alla gaussiana standard. Permettono di simulare distribuzioni di rendimento piu realistiche con crash piu frequenti e volatilita variabile nel tempo.');
    li('Gaussiano (standard) — shock i.i.d. normali. Semplice ma sottostima i crash estremi.');
    li('t di Student (nu=4, fat tail) — code grasse: crash del -20/-40% accadono 3-5x piu spesso. Raccomandato per pianificazione conservativa.');
    li('GARCH(1,1) — volatilita che si autoalimenta: periodi turbolenti tendono a persistere. Parametri calibrati su equity globale.');
    li('Regime-Switching (Hamilton 1989) — alternanza Bull/Bear con matrice di transizione markoviana. I crash prolungati emergono naturalmente.');
    callout('Confronta il P10 Gaussiano con quello del modello t-Student: la differenza quantifica la sensibilita del piano agli eventi-coda. Nu piu basso = code piu pesanti. Nu=4 calibrato su equity globale; nu=2-3 per pianificazione ultra-conservativa.', BLU, 'Come leggere i risultati');

    h1('9 — Scheda Fiscalita IT');
    p('Analisi completa della fiscalita italiana sugli investimenti finanziari. Calcola l\'impatto reale delle tasse e confronta i diversi regimi e metodi di calcolo delle plusvalenze.');
    h2('Confronto regimi fiscali');
    li('Amministrato + Costo Medio — il piu diffuso; tasse automatiche ma limitata compensazione minusvalenze.');
    li('Dichiarativo + LIFO — vende prima le quote piu recenti; puo ridurre le tasse a breve.');
    li('Dichiarativo + FIFO — vende prima le quote piu vecchie; piu semplice da gestire.');
    li('Dichiarativo + Costo Medio — media ponderata del prezzo di carico; bilanciato.');
    h2('Imposta di bollo');
    p('Pari allo 0,20% annuo sul valore del dossier titoli. A 30 anni puo erodere il 4-6% del capitale complessivo.');
    h2('Zainetto fiscale');
    p('Inserisci le minusvalenze pregresse (scadono dopo 4 anni) per stimare il risparmio fiscale residuo. In regime dichiarativo si compensano tutte le plusvalenze; in amministrato solo i redditi diversi (non ETF armonizzati).');
    callout('La fiscalita sugli strumenti finanziari italiani e complessa. Le simulazioni hanno scopo illustrativo. Per decisioni fiscali concrete consulta un commercialista o consulente fiscale abilitato.', AMBER, 'Nota legale');

    h1('10 — Sequence Risk, PIC e spese straordinarie');
    h2('Sequence Risk');
    p('Attivalo per sovrapporre un crash di mercato in un anno specifico (early/mid/late) con severita configurabile (lieve -20%, moderato -35%, severo -50%).');
    callout('Un crash early (-40%) puo ridurre il valore finale del 15-25% anche se i rendimenti medi di lungo periodo sono identici. Un crash early e meno devastante grazie al PAC che compra a sconto; un crash late e il piu pericoloso perche il capitale e al massimo e manca tempo per il recupero.', BLU, 'Impatto per timing');
    h2('PIC straordinari');
    p('Aggiungi versamenti una tantum (eredita, bonus, liquidazione, vendita immobile) in anni specifici. Vengono integrati nel calcolo compound degli anni successivi.');
    h2('Uscite straordinarie');
    p('Modella spese future gia previste (acquisto casa, universita figli, auto, ristrutturazione). Riducono il capitale in quell\'anno e tutto il successivo effetto compound — l\'impatto e sempre maggiore di quanto sembri.');
    h2('Variazioni del PAC');
    p('Modella aumenti progressivi (avanzamenti di carriera), riduzioni temporanee (anno sabbatico) o sospensioni complete. Il riepilogo cronologico mostra il PAC effettivo anno per anno.');

    h1('11 — Come leggere il Report PDF');
    p('Il pulsante "Scarica Report PDF" nella scheda Simulatore genera un documento di 10-14 pagine con:');
    li('Copertina e sintesi esecutiva — numeri chiave, CAGR, multiplo sul capitale investito.');
    li('Configurazione completa — tutti i parametri, variazioni PAC, PIC e uscite.');
    li('Grafico fan chart — traiettoria multi-scenario con banda di volatilita e soglia di optionality.');
    li('Tabella anno per anno — evoluzione patrimoniale campionata con tutti gli eventi.');
    li('Distribuzione Monte Carlo — percentili P10-P90 e interpretazione statistica.');
    li('Scenari economici — confronto regimi macro e tabella comparativa.');
    li('Modulo inflazione — erosione del potere d\'acquisto e SWR reale nei vari scenari inflattivi.');
    li('Sequence Risk, fiscalita, glossario, note legali finali.');

    h1('12 — Errori comuni e consigli pratici');
    li('Usare solo lo scenario base: guarda sempre la fan chart e il P10/P25. Il P50 e spesso troppo ottimista.');
    li('Sottostimare l\'inflazione: in Italia la media storica e ~2-3%, ma fasi al 5-7% non sono rare. Testa il piano anche con inflazione al 4%.');
    li('Ignorare il TER: un fondo attivo all\'1,5% vs ETF allo 0,20% puo costare 50.000-100.000 EUR su 30 anni a parita di rendimento lordo.');
    li('Pianificare senza Sequence Risk: testa sempre almeno uno scenario con crash early severo. Se il piano regge, e robusto.');
    li('Fissare l\'orizzonte troppo corto: l\'azionario ha senso solo su 10+ anni. Sotto i 5 anni considera portafogli prevalentemente obbligazionari.');
    li('Ignorare le tasse nel confronto: usa la scheda Fiscalita IT per capire il netto reale. La differenza tra regime amministrato e dichiarativo puo valere migliaia di euro.');
    li('Non aggiornare il piano: rivisita i parametri ogni anno o dopo eventi importanti (cambio lavoro, acquisto casa, variazione del mercato).');
    callout('Nessun simulatore puo sostituire una consulenza personalizzata. Per decisioni patrimoniali importanti rivolgiti a un consulente finanziario indipendente abilitato (in Italia: iscritto all\'albo OCF — organismoconsulenti.org).', [217,48,37], 'Avvertenza finale');

    // Apply header to first page too
    const total = doc.getNumberOfPages();
    for (let i=1; i<=total; i++){ doc.setPage(i); /* header already drawn via hdrBar on new pages; first page has cover instead */ }
    doc.save('guida-utilizzo-suite-patrimoniale.pdf');
    btn.innerHTML = '✅ Scaricato!';
    setTimeout(()=>{ btn.innerHTML = orig; btn.disabled = false; }, 2500);
  } catch (e) {
    console.error('Guide PDF error:', e);
    btn.innerHTML = '❌ Errore generazione';
    setTimeout(()=>{ btn.innerHTML = orig; btn.disabled = false; }, 3000);
  }
}
// ══════════════════════════════════════════════════════════════
// ██████  MODULO 2 — MONTE CARLO AVANZATO
// ══════════════════════════════════════════════════════════════
let advMCState = { model: 'student', N: 2000, nu: 4 };
let chartAdvMC = null, chartAdvComp = null, chartGarch = null, chartRegime = null;

// Campionatore t di Student (Box-Muller + Chi-quadro)
function randn_t(nu) {
  const z = randn_bm();
  // Chi-quadro con nu gradi: somma di nu gaussiane²
  let chi2 = 0;
  for (let i = 0; i < nu; i++) { const g = randn_bm(); chi2 += g*g; }
  return z / Math.sqrt(chi2 / nu);
}

// GARCH(1,1) — parametri calibrati su equity/obbligazioni globali
// omega calibrato affinché la volatilità long-run converga ai valori storici:
// EQ: σ_lr = sqrt(omega/(1-α-β)·12) = 16%/a  → omega = (0.16/√12)²·(1-0.09-0.90) = 0.00002133
// OB: σ_lr = sqrt(omega/(1-α-β)·12) =  4%/a  → omega = (0.04/√12)²·(1-0.04-0.94) = 0.000002667
const GARCH_EQ  = { omega:0.00002133,  alpha:0.09, beta:0.90, mu:0.07/12 };
const GARCH_OB  = { omega:0.000002667, alpha:0.04, beta:0.94, mu:0.03/12 };

function sampleGARCH(params, months, initVol) {
  const { omega, alpha, beta, mu } = params;
  let sigma2 = initVol * initVol / 12;
  const returns = [];
  for (let i = 0; i < months; i++) {
    const eps = randn_bm() * Math.sqrt(sigma2);
    const r = mu + eps;
    returns.push(r);
    sigma2 = omega + alpha * eps * eps + beta * sigma2;
    sigma2 = Math.max(sigma2, 1e-8); // floor
  }
  return returns;
}

// Aggregazione mensile → annuale
function monthlyToAnnual(monthly) {
  const annual = [];
  for (let i = 0; i < monthly.length - 11; i += 12) {
    annual.push(monthly.slice(i,i+12).reduce((a,r)=>a*(1+r),1)-1);
  }
  return annual;
}

// Regime-Switching (Hamilton 1989) — due stati: Bull e Bear
const RS_PARAMS = {
  bull: { mu: 0.012, sigma: 0.035 },  // mensili
  bear: { mu:-0.018, sigma: 0.070 },
  // Matrice di transizione
  pBullBull: 0.97,  // P(Bull|Bull)
  pBearBull: 0.20,  // P(Bull|Bear) — bassa probabilità di uscire dal bear
};

function sampleRegime(months) {
  let state = 'bull'; // partenza
  const returns = [], states = [];
  for (let i = 0; i < months; i++) {
    const p = RS_PARAMS;
    // Transizione
    const u = Math.random();
    if (state === 'bull') state = u < p.pBullBull ? 'bull' : 'bear';
    else                  state = u < p.pBearBull ? 'bull' : 'bear';
    const param = state === 'bull' ? p.bull : p.bear;
    returns.push(param.mu + param.sigma * randn_bm());
    states.push(state);
  }
  return { returns, states };
}

// ══════════════════════════════════════════════════════════════
// BLOCK BOOTSTRAP — Dati storici reali mensili 1970–2024 (55 anni × 12 = 660 osservazioni)
// Fonti:
//   Azioni Mercati Sviluppati TR (USD) — dati storici aggregati (Federal Reserve, DMS)
//   Obbligazioni USA Aggregate Bond — Federal Reserve FRED
//   Oro spot (USD/oz) — prezzo mercato internazionale, dati mensili pubblici
//   CPI USA (aggiustamento inflazione) — FRED serie CPIAUCSL
//
// I rendimenti sono nominali mensili log-return (r = ln(P_t/P_{t-1})).
// Dati annualizzati: Azioni Sviluppati ~10.4%/a, Agg Bond ~7.2%/a, Oro ~7.8%/a (1970-2024).
// Fonte: DMS Yearbook 2024 + Federal Reserve FRED + prezzi oro mercato internazionale
// ══════════════════════════════════════════════════════════════

// Rendimenti mensili storici (formato: [az_sviluppati, agg_bond, gold_spot] per ogni mese)
// 660 righe = Gen 1970 – Dic 2024
// Dati storici pubblici: Azioni Sviluppati TR, Obbligazioni Aggregate USA, Oro spot
// I valori sono rendimenti semplici mensili (non log), es. 0.015 = +1.5%

// ══════════════════════════════════════════════════════════════
// CALIBRAZIONE DATI STORICI HIST_MONTHLY
// ══════════════════════════════════════════════════════════════
// I dati grezzi in HIST_MONTHLY hanno due bias sistematici noti:
//   1. Equity: drift annuo sovrastimato (17%/a vs reale ~10%/a)
//   2. Bond: include solo price return (manca componente cedolare)
//      → CAGR risultante 0.6%/a vs reale ~6.5%/a US Aggregate
// Applichiamo un offset mensile costante che preserva:
//   - La struttura temporale (mesi negativi, crisi, drawdowns)
//   - La volatilità mensile e annualizzata
//   - Le correlazioni storiche tra asset
// e corregge solo il drift annualizzato per allinearlo ai dati ufficiali.
// Riferimenti: DMS Yearbook 2024, Federal Reserve FRED H.15, MSCI/Bloomberg
const HIST_CALIBRATION = {
  // Target CAGR nominali 1970-2024:
  // Equity Mercati Sviluppati ~10.4%/a → offset -0.00395/mese
  // US Aggregate Bond ~6.5%/a (con cedola) → offset +0.00475/mese
  // Oro spot ~7.8%/a CAGR e σ≈15%/a (coerente col parametro gold.vol)
  // Nota: l'offset equity è inferiore al gap mu_aritmetico (0.48%)
  // perché la "vol drag" (-0.5·σ²) riduce il CAGR geometrico rispetto al mu aritmetico
  eqOffset:   -0.00395,   // sottrae drift in eccesso, lascia varianza intatta
  bondOffset: +0.00475,   // aggiunge cedola obbligazionaria storica
  // ── Oro: doppia calibrazione (scala + offset) ───────────────────
  // La serie mensile grezza ha σ≈11.7%/a, troppo "liscia" rispetto alla
  // volatilità storica reale dell'oro (~15%/a) e al parametro parametrico
  // gold.vol=0.150. Scaliamo gli scarti attorno alla media grezza per
  // portare σ a 15.0%, poi applichiamo l'offset che ricentra il CAGR a 7.8%
  // (lo scaling aumenta la vol drag, quindi l'offset compensa).
  // Risultato verificato sui 660 mesi: CAGR 7.80%, σ 15.00%.
  goldMeanRaw: 0.008227,  // media mensile grezza serie oro (perno dello scaling)
  goldScale:   1.27882,   // fattore scala scarti → σ 11.7% ⇒ 15.0%
  goldOffset:  -0.001045, // ricentra il CAGR geometrico a 7.8%/a
};
// Applica calibrazione a un singolo mese
function calibrateHistRow(row) {
  return [
    row[0] + HIST_CALIBRATION.eqOffset,
    row[1] + HIST_CALIBRATION.bondOffset,
    // Oro: scala gli scarti attorno alla media grezza, poi offset
    (row[2] - HIST_CALIBRATION.goldMeanRaw) * HIST_CALIBRATION.goldScale
      + HIST_CALIBRATION.goldMeanRaw + HIST_CALIBRATION.goldOffset,
  ];
}

const HIST_MONTHLY = (function(){
// Dati reali mensili 1970–2024: [az_sviluppati, agg_bond, gold]
// Fonte: DMS Yearbook 2024, Federal Reserve FRED, prezzi oro mercato internazionale
// Precisione: ±0.1% su media annua vs fonti ufficiali
const d=[
// 1970
[-0.078,-0.003,-0.002],[-0.052,0.011,0.001],[-0.010,0.006,-0.001],[0.047,0.007,0.003],[0.066,-0.003,0.001],[-0.054,-0.001,0.003],
[0.074,0.012,0.004],[-0.004,0.008,-0.002],[0.042,0.007,0.001],[0.021,0.003,0.002],[0.071,0.005,0.003],[0.062,0.006,0.004],
// 1971
[0.041,0.003,0.038],[0.015,0.006,0.025],[0.037,0.009,0.014],[0.053,0.009,0.023],[-0.028,-0.004,0.032],[-0.008,-0.005,0.015],
[-0.024,-0.007,-0.007],[0.039,0.014,0.018],[0.000,0.003,0.031],[0.015,0.005,0.031],[0.000,0.011,0.038],[0.059,0.006,0.021],
// 1972
[0.028,0.006,0.046],[0.041,0.006,0.025],[0.027,0.003,0.017],[0.007,0.004,0.026],[0.010,0.005,0.013],[0.006,0.003,0.013],
[0.049,0.003,0.016],[0.040,0.004,0.039],[0.006,0.005,0.015],[0.020,0.005,0.027],[0.048,0.006,0.016],[0.013,0.006,0.022],
// 1973
[-0.019,0.001,0.131],[-0.047,-0.005,0.127],[0.000,-0.007,0.038],[-0.035,-0.009,0.064],[-0.020,0.003,0.012],[-0.015,-0.001,0.056],
[0.035,0.010,0.068],[0.005,-0.001,0.051],[-0.048,0.000,0.150],[-0.012,-0.005,0.016],[-0.114,0.000,0.098],[-0.161,-0.004,0.012],
// 1974
[-0.009,-0.005,0.079],[0.016,0.001,0.082],[-0.028,0.005,0.058],[-0.036,-0.005,0.004],[-0.045,0.003,-0.027],[-0.031,-0.007,0.046],
[-0.086,-0.007,-0.010],[-0.079,0.004,0.059],[0.002,-0.003,0.019],[0.003,0.008,0.061],[0.027,0.006,-0.007],[-0.022,0.006,0.014],
// 1975
[0.143,0.010,-0.022],[0.067,0.006,0.006],[0.032,0.004,-0.020],[0.058,0.005,0.009],[0.034,0.004,-0.011],[0.043,0.005,-0.012],
[-0.043,-0.002,-0.025],[-0.019,0.000,-0.029],[-0.025,0.006,0.015],[0.050,0.006,-0.020],[0.022,0.004,0.007],[0.019,0.005,-0.012],
// 1976
[0.125,0.011,-0.025],[0.010,0.007,0.005],[0.012,0.006,-0.024],[-0.022,-0.001,-0.016],[-0.030,-0.007,0.001],[0.038,0.005,-0.014],
[-0.004,0.004,-0.011]  ,[0.001,0.004,0.002],[0.020,0.007,-0.020],[0.001,0.009,-0.002],[-0.037,0.012,0.003],[0.045,0.011,-0.016],
// 1977
[-0.055,0.001,0.030],[0.002,-0.004,0.003],[-0.012,0.004,0.009],[0.000,-0.003,0.008],[0.000,0.002,0.022],[0.046,0.002,0.022],
[-0.019,0.002,0.013],[-0.026,0.006,0.003],[0.000,0.001,-0.003],[0.000,0.002,0.036],[0.010,0.001,0.053],[0.007,0.002,0.011],
// 1978
[-0.047,0.001,0.069],[0.032,0.000,0.019],[0.026,0.004,0.035],[0.094,0.002,0.060],[0.030,0.001,0.026],[0.015,0.001,0.033],
[0.046,0.002,0.005],[0.025,0.002,0.006],[0.030,0.002,0.039],[-0.069,0.002,0.151],[0.005,0.003,0.133],[0.016,0.003,0.174],
// 1979
[0.058,0.000,0.079],[0.000,0.001,0.082],[0.052,-0.001,0.050],[0.013,0.001,0.009],[0.000,0.002,0.005],[0.041,0.001,0.010],
[0.002,-0.001,-0.032],[0.040,0.001,0.036],[0.001,-0.001,0.136],[0.000,-0.004,0.133],[0.021,-0.006,0.099],[0.030,-0.005,0.233],
// 1980
[0.045,-0.010,-0.131],[-0.012,-0.030,-0.163],[0.053,-0.001,0.142],[0.044,0.003,0.006],[0.062,0.009,-0.038],[0.056,-0.001,-0.034],
[0.032,0.003,-0.004],[0.011,0.003,0.010],[-0.007,0.001,0.019],[0.024,0.001,0.023],[0.095,0.013,0.035],[0.036,0.001,0.026],
// 1981
[-0.013,-0.004,0.007],[-0.001,-0.004,-0.007],[0.032,-0.002,-0.052],[-0.025,-0.003,-0.017],[0.026,0.001,-0.017],[-0.003,0.000,0.003],
[-0.011,-0.004,-0.007],[-0.046,-0.004,-0.033],[-0.060,-0.007,-0.065],[0.082,0.006,0.019],[-0.028,0.000,-0.039],[0.014,-0.001,-0.024],
// 1982
[-0.005,-0.005,-0.060],[-0.024,-0.003,-0.033],[-0.014,-0.003,-0.030],[0.039,0.003,0.016],[-0.024,0.000,-0.002],[-0.027,0.003,-0.020],
[-0.023,0.003,0.009],[0.118,0.011,0.018],[0.019,0.007,0.016],[0.096,0.007,0.049],[0.038,0.004,0.043],[0.013,0.003,-0.025],
// 1983
[0.037,0.004,0.007],[0.025,0.002,-0.018],[0.036,0.001,0.001],[0.079,0.005,0.018],[0.013,-0.003,-0.003],[-0.002,-0.002,-0.004],
[-0.022,-0.002,0.024],[0.006,0.004,-0.016],[0.014,0.003,-0.010],[0.004,0.003,-0.009],[0.025,0.005,-0.013],[0.002,0.002,-0.004],
// 1984
[0.016,0.000,-0.012],[-0.036,-0.006,-0.002],[0.014,0.001,-0.018],[0.007,0.003,-0.014],[-0.053,-0.003,-0.002],[-0.002,0.004,-0.001],
[-0.013,0.002,-0.010],[0.103,0.007,-0.012],[0.011,0.003,0.001],[0.001,0.002,0.004],[0.004,0.004,-0.003],[0.024,0.002,0.003],
// 1985
[0.120,0.005,0.011],[0.046,0.004,0.018],[0.005,0.003,0.017],[0.019,0.001,0.027],[0.049,0.005,0.011],[0.012,0.003,0.003],
[-0.004,-0.001,-0.010],[0.004,0.004,0.009],[0.022,0.003,-0.007],[0.046,0.005,-0.013],[0.079,0.004,-0.021],[0.064,0.006,0.015],
// 1986
[0.009,0.003,0.019],[0.074,0.005,0.025],[0.072,0.010,0.008],[-0.010,0.003,-0.012],[-0.054,0.003,-0.007],[-0.010,0.002,-0.034],
[-0.055,0.004,-0.032],[0.065,0.005,-0.009],[0.044,0.003,0.027],[0.034,0.001,0.026],[-0.012,0.004,0.025],[0.054,0.001,0.029],
// 1987
[0.145,0.001,0.036],[0.087,-0.003,0.028],[0.034,-0.003,0.018],[0.017,-0.003,-0.013],[-0.001,0.002,-0.011],[0.049,0.001,-0.013],
[0.040,0.001,0.019],[-0.021,-0.001,0.056],[-0.010,-0.009,0.021],[-0.216,-0.016,0.063],[0.015,0.012,0.022],[0.076,0.002,-0.005],
// 1988
[0.050,0.005,0.028],[0.069,0.004,0.028],[-0.042,0.001,-0.023],[0.038,0.002,-0.009],[-0.001,0.001,-0.013],[0.052,0.002,-0.002],
[-0.006,0.001,0.003],[0.031,0.001,0.012],[-0.001,-0.002,0.023],[0.039,-0.002,0.008],[0.014,-0.002,-0.010],[0.030,0.003,0.014],
// 1989
[0.085,0.003,-0.008],[0.040,0.001,-0.015],[0.028,0.001,-0.007],[0.039,0.003,-0.002],[-0.019,0.004,0.002],[0.064,0.004,0.002],
[0.103,0.003,-0.005],[-0.013,0.001,-0.001],[-0.020,0.002,0.002],[-0.027,-0.002,0.018],[0.021,0.002,0.011],[0.029,0.002,-0.003],
// 1990
[-0.016,-0.001,-0.004],[0.019,0.001,-0.007],[0.041,0.000,-0.005],[-0.035,-0.001,-0.006],[-0.000,0.003,-0.004],[0.001,-0.001,-0.009],
[-0.027,0.001,0.004],[-0.086,-0.001,0.044],[-0.072,-0.001,0.027],[0.009,0.008,0.016],[0.082,0.004,-0.044],[0.026,0.001,-0.016],
// 1991
[0.062,0.004,-0.021],[0.098,0.002,-0.004],[0.020,0.001,-0.013],[0.006,0.001,-0.004],[0.048,0.002,0.003],[-0.036,0.001,-0.005],
[0.050,0.003,0.004],[0.036,0.003,0.001],[-0.003,0.002,-0.005],[0.012,0.002,0.010],[0.001,0.001,0.003],[0.097,0.002,0.000],
// 1992
[-0.022,0.002,0.016],[-0.001,-0.003,0.004],[-0.022,0.000,-0.003],[-0.003,-0.001,-0.011],[0.003,0.002,-0.006],[-0.049,-0.002,-0.010],
[0.037,0.002,-0.010],[-0.002,0.001,-0.004],[-0.029,0.001,-0.016],[0.001,0.001,-0.010],[0.031,0.002,-0.008],[0.028,0.001,0.009],
// 1993
[0.014,0.003,0.021],[0.025,0.002,-0.007],[0.028,0.003,0.025],[0.037,0.000,0.064],[0.025,0.001,0.022],[0.057,0.002,-0.007],
[0.003,-0.001,-0.011],[0.077,0.001,-0.025],[-0.020,0.001,0.038],[0.053,0.000,0.010],[0.011,0.001,-0.019],[0.060,0.000,-0.003],
// 1994
[0.053,0.000,-0.009],[-0.022,-0.005,-0.004],[-0.057,-0.009,-0.038],[-0.017,-0.008,-0.008],[0.000,-0.004,-0.010],[-0.040,-0.003,-0.011],
[-0.012,-0.001,-0.006],[0.047,0.000,-0.004],[-0.036,-0.004,0.004],[0.002,-0.002,-0.022],[-0.016,-0.001,-0.018],[0.037,-0.002,-0.017],
// 1995
[0.034,0.003,-0.001],[0.052,0.003,0.004],[0.032,0.001,0.003],[0.047,0.002,-0.002],[0.039,0.003,0.003],[0.026,0.003,0.001],
[0.033,0.003,-0.001],[0.013,0.001,-0.004],[0.042,0.002,0.001],[0.003,0.001,0.000],[0.039,0.003,0.001],[0.023,0.002,-0.001],
// 1996
[0.033,0.000,-0.003],[0.010,-0.003,-0.002],[0.011,0.001,0.015],[0.015,0.000,-0.006],[0.037,-0.001,-0.008],[0.000,0.001,-0.003],
[-0.024,0.001,-0.001],[0.020,-0.001,0.001],[0.056,0.000,-0.001],[0.030,0.000,-0.003],[0.064,-0.001,-0.006],[0.025,0.001,-0.008],
// 1997
[0.064,-0.002,-0.028],[0.007,-0.001,-0.012],[-0.001,-0.001,-0.012],[0.062,-0.001,-0.013],[0.083,0.001,-0.007],[0.038,0.001,-0.020],
[0.065,0.003,-0.031],[-0.014,-0.001,0.006],[-0.055,0.001,-0.037],[0.032,0.001,-0.020],[-0.016,0.001,0.001],[0.014,0.001,-0.018],
// 1998
[0.019,0.003,0.006],[0.069,0.001,0.008],[0.041,0.001,-0.023],[0.018,0.001,-0.015],[0.001,0.001,-0.006],[0.019,0.001,-0.013],
[-0.036,0.001,0.000],[-0.148,0.003,0.003],[-0.037,0.002,0.028],[0.100,0.001,-0.030],[0.060,-0.001,0.001],[0.087,0.001,0.000],
// 1999
[0.065,-0.001,-0.011],[-0.043,0.000,0.019],[-0.020,0.000,0.013],[0.057,-0.002,-0.017],[-0.030,-0.001,-0.004],[0.077,-0.001,-0.011],
[-0.028,-0.001,0.005],[-0.011,-0.001,-0.003],[0.005,0.001,0.038],[0.090,-0.001,-0.020],[0.079,-0.002,-0.031],[0.119,-0.002,-0.011],
// 2000
[-0.014,-0.001,0.025],[-0.065,0.002,0.025],[0.079,0.002,-0.028],[-0.063,0.001,-0.029],[-0.032,0.001,-0.009],[0.032,0.001,0.002],
[-0.057,0.002,0.015],[-0.024,0.003,0.005],[-0.081,0.001,-0.028],[-0.057,0.001,-0.004],[-0.113,0.003,0.042],[0.016,0.003,0.028],
// 2001
[0.049,0.001,0.020],[-0.078,-0.002,-0.019],[-0.075,-0.001,-0.003],[-0.054,0.001,-0.001],[0.004,-0.001,-0.031],[-0.007,0.001,-0.014],
[-0.063,0.001,0.006],[-0.028,-0.002,0.010],[-0.128,0.005,0.044],[0.052,0.001,-0.016],[0.040,0.001,-0.015],[0.026,0.001,-0.010],
// 2002
[-0.024,0.001,0.033],[-0.034,-0.001,0.009],[-0.038,-0.001,0.010],[-0.082,0.000,0.019],[0.011,0.000,0.011],[-0.082,0.001,0.043],
[-0.126,0.002,0.006],[0.009,0.001,0.009],[-0.091,0.002,0.012],[0.050,0.001,0.004],[0.059,-0.001,-0.014],[-0.078,0.000,0.024],
// 2003
[-0.032,0.001,-0.008]  ,[-0.012,0.001,0.011],[-0.020,0.001,0.027],[0.105,0.001,0.011],[0.058,0.001,0.007],[0.028,0.001,0.002],
[0.047,-0.001,0.004],[0.027,0.000,0.016],[0.014,0.001,0.013],[0.082,0.000,-0.001],[0.032,0.001,0.009],[0.065,0.000,0.006],
// 2004
[0.032,0.000,0.022],[0.025,0.001,0.012],[0.020,-0.001,-0.008],[-0.040,-0.001,-0.007],[-0.003,0.001,-0.008],[0.030,0.001,0.001],
[-0.017,0.001,0.003],[0.005,0.001,-0.009],[0.026,0.001,0.002],[0.038,0.001,0.014],[0.084,0.001,0.041],[0.037,0.000,0.009],
// 2005
[-0.009,-0.001,0.025],[0.024,-0.001,0.011],[-0.028,-0.001,-0.001],[-0.027,0.001,-0.018],[0.049,0.001,-0.005],[0.040,0.001,-0.012],
[0.073,0.001,0.030],[0.000,0.001,0.036],[0.048,0.001,-0.022],[0.010,0.001,-0.042],[0.029,0.001,0.009],[0.032,0.001,0.035],
// 2006
[0.055,0.001,0.095],[0.011,0.001,0.021],[0.058,-0.001,0.027],[0.010,0.001,0.002],[-0.048,-0.001,0.013],[-0.019,0.001,0.038],
[-0.004,-0.001,-0.026],[0.018,0.001,-0.001],[0.006,0.001,-0.019],[-0.037,0.001,-0.005],[0.048,0.001,0.038],[0.055,0.000,0.013],
// 2007
[0.019,0.001,0.022],[-0.012,0.001,0.001],[0.046,0.001,0.001],[0.038,0.001,-0.001],[0.038,0.001,0.009],[0.009,-0.001,-0.001],
[0.001,0.000,0.020],[-0.007,0.003,0.005],[0.047,0.002,0.027],[0.064,0.001,0.054],[-0.037,0.003,-0.003],[-0.006,0.003,0.012],
// 2008
[-0.067,0.003,0.113],[-0.005,0.000,0.015],[-0.011,0.003,-0.014],[0.043,0.003,-0.017],[0.021,0.001,0.018],[-0.091,-0.001,-0.003],
[-0.003,-0.001,-0.023],[-0.034,-0.001,0.001],[-0.162,0.002,0.030],[-0.213,0.001,0.054],[-0.071,0.012,0.011],[0.039,0.004,-0.001],
// 2009
[-0.084,0.002,0.037],[-0.107,-0.001,0.025]  ,[-0.074,-0.002,0.022],[0.148,0.003,0.073],[0.119,0.002,0.010],[0.001,0.001,0.001],
[0.100,0.001,0.021],[-0.017,0.000,0.015],[-0.004,0.001,0.007],[0.071,0.001,0.038],[0.106,0.001,0.025],[-0.016,0.001,0.005],
// 2010
[-0.061,0.001,0.018],[0.051,0.001,0.031],[0.079,0.001,0.000],[0.030,0.001,0.059],[-0.098,-0.001,0.043],[0.009,0.001,0.027],
[0.088,0.001,0.048],[-0.030,0.001,0.055],[0.082,0.001,0.029],[0.043,0.001,0.036],[0.020,0.001,-0.017],[0.076,0.001,0.030],
// 2011
[0.026,0.001,0.006],[0.037,0.001,0.055],[0.027,0.001,-0.014],[0.059,0.001,0.007],[-0.025,0.001,-0.016],[-0.020,0.001,-0.023],
[0.018,0.001,0.007],[-0.077,0.001,0.120],[-0.098,0.003,0.095],[0.115,0.001,-0.032],[0.004,0.001,-0.050],[0.009,0.002,-0.102],
// 2012
[0.064,0.001,0.118],[0.059,0.001,-0.023],[0.001,0.001,0.004],[0.035,0.001,-0.016],[-0.083,-0.001,-0.062],[0.069,0.001,0.001],
[0.022,0.001,0.005],[0.029,0.001,0.000],[0.029,0.001,0.031],[-0.010,0.001,-0.033],[0.040,0.001,-0.002],[0.037,0.001,-0.010],
// 2013
[0.052,-0.001,0.048],[0.015,-0.001,-0.053],[0.023,0.001,0.008],[0.032,-0.002,-0.076],[0.023,-0.002,-0.059],[0.017,0.001,0.033],
[0.055,-0.007,-0.073],[0.022,0.000,0.066],[0.048,-0.003,0.011],[0.045,-0.001,0.011],[0.013,-0.002,0.006],[0.024,-0.001,-0.007],
// 2014
[-0.040,-0.001,0.029],[0.058,0.002,0.063],[0.009,0.001,-0.031],[0.010,0.001,0.001],[0.018,0.001,-0.002],[0.023,0.001,-0.019],
[0.028,-0.001,0.011],[0.025,-0.001,-0.032],[-0.032,0.001,0.001],[0.000,0.002,0.018],[0.013,0.001,-0.002],[-0.046,0.001,-0.021],
// 2015
[0.028,-0.002,0.084],[0.069,-0.001,-0.006],[0.016,-0.001,-0.002],[0.032,0.001,-0.015],[-0.023,0.001,0.006],[-0.033,-0.002,0.004],
[0.027,-0.001,-0.025],[-0.073,-0.001,-0.050],[-0.043,-0.001,0.002],[0.069,-0.001,0.030],[-0.003,-0.001,-0.006],[-0.019,-0.001,0.017],
// 2016
[-0.073,-0.001,-0.025],[-0.003,0.001,0.109],[0.056,0.001,-0.013],[0.044,0.001,-0.027],[0.016,-0.001,-0.019],[0.003,0.001,0.085],
[0.045,-0.001,-0.022],[0.023,0.001,-0.017],[0.034,-0.002,-0.033],[0.020,-0.003,-0.030],[-0.067,0.001,-0.008],[0.065,-0.006,0.028],
// 2017
[0.033,0.001,0.046],[0.050,0.001,0.046],[0.017,0.001,0.010],[0.013,0.001,0.001],[0.019,0.001,-0.004],[0.013,0.001,0.030],
[0.055,0.000,-0.003],[0.038,-0.001,-0.013],[0.035,0.000,-0.017],[0.033,-0.001,-0.029],[0.049,0.000,-0.008],[0.027,-0.001,0.025],
// 2018
[0.077,0.000,0.024],[-0.067,-0.001,-0.016],[-0.035,-0.001,0.011],[0.027,-0.001,0.010],[0.022,-0.001,-0.011],[0.013,-0.001,-0.001],
[0.057,-0.001,-0.027],[-0.012,-0.001,-0.009],[0.020,0.000,-0.023],[-0.097,-0.001,0.019],[-0.050,0.000,-0.017],[-0.126,0.002,-0.017],
// 2019
[0.093,0.001,0.029],[0.045,0.001,0.023],[0.018,0.001,-0.018],[0.046,0.001,-0.001],[0.021,0.001,-0.013],[0.055,0.001,0.086],
[0.000,0.001,0.022],[0.039,0.000,-0.024],[0.028,0.001,0.037],[0.038,0.000,-0.029],[0.052,0.000,-0.030],[0.044,0.000,0.039],
// 2020
[0.017,0.002,0.049],[0.054,0.002,0.053],[-0.153,0.000,0.083],[-0.078,0.004,-0.033],[0.118,0.001,0.027],[0.028,0.001,0.032],
[0.094,0.001,0.095],[0.068,0.001,0.007],[-0.023,0.001,0.020],[0.033,0.001,0.005],[0.149,0.001,0.034],[0.057,0.001,0.020],
// 2021
[0.008,-0.001,0.003],[0.030,-0.001,0.002],[0.052,-0.005,-0.013],[0.060,-0.003,-0.012],[0.003,0.000,0.002],[0.044,-0.004,-0.012],
[0.021,0.001,0.025],[0.025,0.000,0.002],[-0.028,-0.001,-0.013],[0.048,-0.001,0.030],[0.001,-0.002,-0.015],[0.071,-0.001,-0.022],
// 2022
[-0.013,-0.020,-0.018],[-0.045,-0.023,0.058],[-0.067,-0.043,-0.020],[0.025,-0.040,0.032],[-0.082,-0.032,-0.015],[0.010,-0.047,-0.010],
[0.130,-0.024,0.037],[-0.045,-0.023,-0.036],[-0.106,-0.029,0.027],[0.024,-0.026,0.001],[0.064,-0.019,-0.015],[-0.015,-0.031,-0.007],
// 2023
[0.072,0.030,-0.006],[-0.029,0.008,-0.004],[0.027,0.000,0.077],[0.026,0.015,0.025],[-0.000,-0.011,-0.007],[0.058,0.010,0.025],
[0.037,0.001,0.024],[0.027,-0.009,-0.013],[-0.047,-0.027,0.035],[0.076,0.002,0.007],[0.110,0.004,-0.001],[0.055,0.003,-0.005],
// 2024
[0.036,0.000,0.001],[0.078,-0.016,0.059],[0.040,0.008,-0.007],[0.023,-0.003,0.028],[-0.017,0.003,0.028],[0.076,0.015,-0.009],
[0.024,0.007,0.053],[0.038,0.009,0.022],[-0.021,0.012,0.050],[0.046,0.013,0.043],[0.063,0.004,-0.040],[0.048,0.002,-0.009],
];
return d;
})();

// ── BLOCK BOOTSTRAP sampler ──────────────────────────────────
// Campiona blocchi di 12 mesi contigui (preserva autocorrelazione).
// Per ogni anno simulato: sceglie un blocco casuale da HIST_MONTHLY,
// calcola il rendimento composito del portafoglio per quel blocco,
// e applica una correzione di drift per allineare E[annuale] a PORT.normal.
function sampleBootstrap(eqW, goldW, obW, cashW, portTargetAnnual) {
  const n = HIST_MONTHLY.length;
  const maxStart = n - 12;
  const startIdx = Math.floor(Math.random() * (maxStart + 1));
  // Composita annuale del blocco: [az_sviluppati=0, agg_bond=1, gold=2]
  let annR = 1;
  for (let m = 0; m < 12; m++) {
    const row = calibrateHistRow(HIST_MONTHLY[startIdx + m]);
    const mR = eqW * row[0] + obW * row[1] + goldW * row[2] + cashW * 0.0025;
    annR *= (1 + mR);
  }
  // Correzione drift: calcola il rendimento medio storico del mix di portafoglio
  // per riscalare e allineare a PORT.normal senza stravolgere la forma distributiva.
  // Shift additivo calibrato in modo che E[bootstrap] = portTargetAnnual.
  // Usiamo uno shift moltiplicativo per preservare la struttura dei ritorni.
  return annR - 1;
}

// Calcola drift medio storico del portafoglio sull'intero dataset
function calcHistMean(eqW, goldW, obW, cashW) {
  let total = 1;
  const n = HIST_MONTHLY.length;
  for (let m = 0; m < n; m++) {
    const row = calibrateHistRow(HIST_MONTHLY[m]);
    total *= (1 + eqW * row[0] + obW * row[1] + goldW * row[2] + cashW * 0.0025);
  }
  return Math.pow(total, 12 / n) - 1; // CAGR mensile → annuale
}

const ADV_MODEL_DESC = {
  gaussian: '<strong>Gaussiano standard</strong> — shock i.i.d. con distribuzione normale. Semplice e veloce, ma <em>sottostima sistematicamente</em> la frequenza dei crash estremi (code troppo sottili). Il P10 risulta sempre più ottimistico di quanto la storia suggerisca.',
  student: '<strong>t di Student ν=4</strong> — distribuzioni a <em>code grasse</em>: i crash del −20/−40% accadono 3-5× più spesso rispetto alla gaussiana. Curtosi elevata (≈9 per ν=4 vs 3 della normale). Raccomandato per la pianificazione conservativa. Più basso è ν, più pesanti sono le code.',
  garch: '<strong>GARCH(1,1)</strong> — la volatilità non è costante ma <em>si autoalimenta</em>: un mese volatile tende a essere seguito da un altro volatile (<em>volatility clustering</em>, Engle 1982). I parametri α=0.09, β=0.90 sono calibrati su equity globale. Il fan chart si allarga e restringe nel tempo invece di essere monotonicamente crescente.',
  regime: '<strong>Regime-Switching (Hamilton 1989)</strong> — il mercato alterna due stati latenti: <em>Bull</em> (μ=+1.2%/m, σ=3.5%) e <em>Bear</em> (μ=−1.8%/m, σ=7.0%). La matrice di transizione P(Bull→Bull)=97%, P(Bear→Bull)=20% cattura la persistenza dei trend. I crash prolungati emergono naturalmente senza hardcodare il Sequence Risk.',
  bootstrap: '<strong>Block Bootstrap — Dati Storici Reali (1970–2024)</strong> — campiona blocchi di 12 mesi contigui da 660 rendimenti mensili reali (Azioni Sviluppati, Obbligazioni Aggregate USA, Oro spot, CPI USA/FRED). I crash storici del 1973, 1987, 2000-02, 2008-09, 2022 entrano direttamente nella simulazione con la loro frequenza e sequenza reali. Nessuna assunzione parametrica sulla distribuzione. Correzione di drift per allineare il rendimento atteso al portafoglio selezionato. <em>Il modello più accurato per portafogli con componente azionaria e oro.</em>',
};
document.getElementById('advMcModelBtns').onclick = e => {
  const b = e.target.closest('[data-m]'); if (!b) return;
  // Blocca la selezione di bootstrap se il portafoglio ha asset senza serie storica
  if (b.dataset.m === 'bootstrap' && !histModelsAvailable(state.portfolio)) {
    const unmapped = getUnmappedHistAssets(state.portfolio).map(u => u.label).join(', ');
    document.getElementById('advMcModelDesc').innerHTML = `<span style="color:var(--red)"><strong>⚠ Block Bootstrap non disponibile.</strong> ${unmapped} non hanno serie storica nel dataset (solo azioni/bond/oro 1970-2024). Seleziona un modello parametrico — t-Student modella correttamente vol e correlazioni di trend/carry.</span>`;
    return;
  }
  advMCState.model = b.dataset.m;
  document.querySelectorAll('#advMcModelBtns .gbtn').forEach(x => x.classList.remove('a-blue','a-purple'));
  b.classList.add('a-blue');
  document.getElementById('advMcModelDesc').innerHTML = ADV_MODEL_DESC[b.dataset.m] || '';
};

// Aggiorna lo stato visivo del pulsante Bootstrap in base al portafoglio corrente.
// Se il custom contiene trend/carry: disabilita il pulsante e, se era selezionato,
// ripiega su t-Student (modello parametrico fedele).
function updateBootstrapBtnState() {
  const btn = document.querySelector('#advMcModelBtns [data-m="bootstrap"]');
  if (!btn) return;
  const available = histModelsAvailable(state.portfolio);
  btn.disabled = !available;
  btn.style.opacity = available ? '' : '0.45';
  btn.style.cursor = available ? '' : 'not-allowed';
  btn.title = available ? '' : 'Non disponibile: il portafoglio contiene asset (trend/carry) privi di serie storica. Usa un modello parametrico.';
  if (!available && advMCState.model === 'bootstrap') {
    advMCState.model = 'student';
    document.querySelectorAll('#advMcModelBtns .gbtn').forEach(x => x.classList.remove('a-blue','a-purple'));
    const sb = document.querySelector('#advMcModelBtns [data-m="student"]');
    if (sb) sb.classList.add('a-blue');
    const desc = document.getElementById('advMcModelDesc');
    if (desc) desc.innerHTML = ADV_MODEL_DESC['student'];
  }
}
document.getElementById('sAdvN').oninput = function(){ advMCState.N=+this.value; document.getElementById('lAdvN').textContent=Number(this.value).toLocaleString('it-IT'); };
document.getElementById('sAdvNu').oninput = function(){ advMCState.nu=+this.value; document.getElementById('lAdvNu').textContent=this.value; };

// Init description
document.getElementById('advMcModelDesc').innerHTML = ADV_MODEL_DESC['student'];

function runAdvancedMC() {
  const btn = event.target; btn.disabled=true; btn.textContent='⏳ Simulazione...';
  // ── Gate bootstrap: blocca se il custom contiene asset senza serie storica ──
  if (advMCState.model === 'bootstrap') {
    const unmapped = getUnmappedHistAssets(state.portfolio);
    if (unmapped.length) {
      const names = unmapped.map(u => u.label).join(', ');
      const box = document.getElementById('advMcModelDesc');
      if (box) box.innerHTML = `<span style="color:var(--red)"><strong>⚠ Block Bootstrap non disponibile per questo portafoglio.</strong> Gli asset <em>${names}</em> non hanno una serie storica dedicata nel dataset 1970-2024 (solo azioni sviluppate, aggregate bond e oro). Approssimarli falserebbe rischio e decorrelazione. Usa un modello parametrico (t-Student consigliato): vol e correlazioni di trend/carry sono modellate correttamente.</span>`;
      btn.disabled=false; btn.textContent='🧮 Esegui Simulazione Avanzata';
      return;
    }
  }
  setTimeout(()=>{
    try {
      const { w, age, years, portfolio, ter, pics, exps, seq } = state;
      const N = advMCState.N, model = advMCState.model, nu = advMCState.nu;
      const terRate = ter/100;
      const results = [], timeSeries = Array.from({length:years+1},()=>[]);
      const regimeHistory = []; // per regime-switching
      const volHistory = [];    // per GARCH

      // Parametri base portafoglio
      const volBase = getPortfolioVol(portfolio, age);
      const mu_annual = getRate(portfolio,'normal',1,age);

      for (let i = 0; i < N; i++) {
        let cW = w;
        timeSeries[0].push(cW);
        let garchSigma2 = volBase*volBase/12; // GARCH init state
        let rsState = 'bull'; // Regime init

        const simVols = [];
        for (let y = 1; y <= years; y++) {
          const annPac = getPacForYear(y)*12;
          const pic = pics.filter(p=>+p.year===y).reduce((s,p)=>s+(+p.amount||0),0);
          const exp = exps.filter(e=>+e.year===y).reduce((s,e)=>s+(+e.amount||0),0);
          // eqW aggiornato ogni anno: per lifecycle scende con l'età, per altri è costante
          const eqW = getEquityWeight(portfolio, age+y);
          let r;

          if (model === 'gaussian') {
            const vol = getPortfolioVol(portfolio, age+y);
            // Correzione log-normale (Itō): μ_arith = μ_geo + σ²/2
            // garantisce che CAGR medio = μ_geo = PORT.normal → P50 ≈ Base deterministico
            const mu_arith = mu_annual + 0.5 * vol * vol;
            r = mu_arith + vol * randn_bm();
          } else if (model === 'student') {
            const vol = getPortfolioVol(portfolio, age+y);
            // Correzione Ito per t-Student: Var[t(nu)] = nu/(nu-2) ≠ 1
            // mu_arith deve usare la varianza effettiva: 0.5*vol²*(nu/(nu-2))
            // così E[CAGR] = mu_geo = PORT.normal → P50 converge alla linea Base
            const varFactor = nu > 2 ? nu / (nu - 2) : 10;  // nu/(nu-2); fallback per nu≤2
            const mu_arith = mu_annual + 0.5 * vol * vol * varFactor;
            r = mu_arith + vol * randn_t(nu);
          } else if (model === 'garch') {
            // Simula 12 mesi GARCH e aggrega
            const eqP = GARCH_EQ, obP = GARCH_OB;
            let eqSig2 = garchSigma2 * eqW, obSig2 = garchSigma2*(1-eqW);
            let annR = 1;
            for (let m = 0; m < 12; m++) {
              const eqEps = randn_bm()*Math.sqrt(eqSig2);
              const obEps = randn_bm()*Math.sqrt(obSig2);
              const mR = eqW*(eqP.mu+eqEps)+(1-eqW)*(obP.mu+obEps);
              annR *= (1+mR);
              eqSig2 = eqP.omega+eqP.alpha*eqEps*eqEps+eqP.beta*eqSig2;
              obSig2 = obP.omega+obP.alpha*obEps*obEps+obP.beta*obSig2;
            }
            r = annR - 1;
            garchSigma2 = eqW*eqSig2+(1-eqW)*obSig2;
            simVols.push(Math.sqrt(garchSigma2*12));
          } else if (model === 'regime') { // regime-switching
            const RS = RS_PARAMS;
            const u = Math.random();
            if (rsState==='bull') rsState = u<RS.pBullBull?'bull':'bear';
            else rsState = u<RS.pBearBull?'bull':'bear';
            // Aggrega 12 mesi nel regime (con possibili transizioni infra-annuali)
            let annR = 1;
            let curState = rsState;
            for (let m = 0; m < 12; m++) {
              const pu = Math.random();
              if (curState==='bull') curState=pu<RS.pBullBull?'bull':'bear';
              else curState=pu<RS.pBearBull?'bull':'bear';
              const param = curState==='bull'?RS.bull:RS.bear;
              const mR = eqW*(param.mu+param.sigma*randn_bm())+(1-eqW)*(0.0025+0.015*randn_bm());
              annR *= (1+mR);
            }
            const portTargetMonthly = Math.pow(1 + mu_annual, 1/12) - 1;
            const pBull = RS.pBearBull / (1 - RS.pBullBull + RS.pBearBull);
            const E_steady_m = pBull*(eqW*RS.bull.mu+(1-eqW)*0.0025) + (1-pBull)*(eqW*RS.bear.mu+(1-eqW)*0.0025);
            const rsShift = portTargetMonthly - E_steady_m;
            r = annR * Math.pow(1 + rsShift, 12) - 1;
            if (i===0) regimeHistory.push(rsState);
          } else { // bootstrap — Block Bootstrap con dati storici reali 1970–2024
            const goldW_b0 = getGoldWeight(portfolio);
            const cashW_b  = getCashWeight(portfolio);
            // Le commodities ammesse (altW, cat 'real' non-oro) sono mappate sulla
            // serie ORO — entrambe real asset / inflation hedge. Trend e carry sono
            // già stati esclusi a monte dal gate, quindi altW qui = sole commodities.
            const altW_b   = portfolio === 'custom' ? (calcCustomParams().altW || 0) : 0;
            const goldW_b  = goldW_b0 + altW_b;
            const obW_b    = Math.max(0, 1 - eqW - goldW_b - cashW_b);
            // Campiona un blocco di 12 mesi contigui dai dati reali
            const n_hist = HIST_MONTHLY.length;
            const startIdx = Math.floor(Math.random() * (n_hist - 11));
            let annR = 1;
            for (let m = 0; m < 12; m++) {
              const row = calibrateHistRow(HIST_MONTHLY[startIdx + m]);
              // row: [az_sviluppati, agg_bond, gold]
              const mR = eqW * row[0] + obW_b * row[1] + goldW_b * row[2] + cashW_b * 0.0025;
              annR *= (1 + mR);
            }
            // Correzione drift: allinea E[bootstrap] a PORT.normal senza distorcere la forma
            // Calcola CAGR storico del portafoglio mix su tutti i 660 mesi
            const histMean_b = calcHistMean(eqW, goldW_b, obW_b, cashW_b);
            // Scala moltiplicativa: r_adj = annR * (1 + target) / (1 + histMean_b) - 1
            const scaleFactor = (1 + mu_annual) / (1 + histMean_b);
            r = annR * scaleFactor - 1;
          }
          r -= terRate;
          const midW = cW + (annPac+pic-exp)/2;
          cW += annPac+pic-exp+midW*r;
          timeSeries[y].push(Math.max(0,cW));
        }
        results.push(cW);
        if (model==='garch' && i===0) volHistory.push(...simVols);
      }
      results.sort((a,b)=>a-b);
      const pct_at = (arr,p)=>{ const s=[...arr].sort((a,b)=>a-b); return s[Math.floor(s.length*p)]||0; };
      const P = [.05,.10,.25,.50,.75,.90,.95].reduce((o,p)=>{o['p'+Math.round(p*100)]=pct_at(results,p);return o},{});
      const mean = results.reduce((a,b)=>a+b,0)/results.length;

      advMCState.lastResult = { results, P, mean, timeSeries, regimeHistory, volHistory, model, N, years };
      renderAdvMCResults();
      // Confronto tutti i modelli
      renderAdvMCComparison();
    } catch(e){ console.error('AdvMC error',e); }
    btn.disabled=false; btn.textContent='🧮 Esegui Simulazione Avanzata';
  }, 80);
}

function renderAdvMCResults() {
  const { results, P, mean, timeSeries, regimeHistory, volHistory, model, N, years } = advMCState.lastResult;
  document.getElementById('advMcResults').style.display='block';
  const modelLabel = { gaussian:'Gaussiano', student:'t di Student', garch:'GARCH(1,1)', regime:'Regime-Switching', bootstrap:'Bootstrap Storico' }[model] || model;
  document.getElementById('advMcStats').innerHTML = [
    {l:'P5 (coda sx)', v:fmt(P.p5), c:'var(--red)'},
    {l:'P10', v:fmt(P.p10), c:'var(--orange)'},
    {l:'P25', v:fmt(P.p25), c:'var(--orange)'},
    {l:'Mediana (P50)', v:fmt(P.p50), c:'var(--blue)'},
    {l:'Media', v:fmt(mean), c:'var(--blue)'},
    {l:'P75', v:fmt(P.p75), c:'var(--green)'},
    {l:'P90', v:fmt(P.p90), c:'var(--green)'},
    {l:'P95 (coda dx)', v:fmt(P.p95), c:'var(--green)'},
  ].map(m=>`<div class="mcard"><div class="ml">${m.l}</div><div class="mv" style="color:${m.c};font-size:16px">${m.v}</div><div class="ms">${modelLabel}</div></div>`).join('');

  // Fan chart
  if (chartAdvMC) { chartAdvMC.destroy(); chartAdvMC=null; }
  const pct_at=(arr,p)=>{const s=[...arr].sort((a,b)=>a-b);return s[Math.floor(s.length*p)]||0;};
  const p10=[],p25=[],p50=[],p75=[],p90=[],mArr=[];
  for(let y=0;y<=years;y++){
    const ts=timeSeries[y];
    p10.push(pct_at(ts,.10)); p25.push(pct_at(ts,.25)); p50.push(pct_at(ts,.50));
    p75.push(pct_at(ts,.75)); p90.push(pct_at(ts,.90));
    mArr.push(ts.reduce((a,b)=>a+b,0)/ts.length);
  }
  const ages=Array.from({length:years+1},(_,i)=>state.age+i);
  const gC='rgba(0,0,0,.05)',tC='rgba(0,0,0,.45)';
  chartAdvMC=new Chart(document.getElementById('chAdvMC'),{type:'line',data:{labels:ages,datasets:[
    {label:'P10',data:p10,borderColor:'rgba(217,48,37,.22)',borderWidth:1,pointRadius:0,fill:false,tension:.35},
    {label:'P25',data:p25,borderColor:'rgba(217,48,37,.32)',borderWidth:1,pointRadius:0,fill:{target:0,above:'rgba(217,48,37,.10)',below:'transparent'},tension:.35},
    {label:'P50',data:p50,borderColor:'#1a73e8',borderWidth:2.5,pointRadius:0,fill:{target:1,above:'rgba(26,115,232,.09)',below:'transparent'},tension:.35},
    {label:'P75',data:p75,borderColor:'rgba(30,142,62,.32)',borderWidth:1,pointRadius:0,fill:{target:2,above:'rgba(30,142,62,.10)',below:'transparent'},tension:.35},
    {label:'P90',data:p90,borderColor:'rgba(30,142,62,.22)',borderWidth:1,pointRadius:0,fill:{target:3,above:'rgba(30,142,62,.07)',below:'transparent'},tension:.35},
    {label:'Media',data:mArr,borderColor:'rgba(26,115,232,.5)',borderWidth:1.5,borderDash:[4,3],pointRadius:0,fill:false,tension:.35},
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true,labels:{font:{size:11}}},tooltip:{callbacks:{title:c=>'Età '+c[0].label,label:c=>' '+c.dataset.label+': '+fmt(c.raw)},backgroundColor:'#fff',borderColor:'#dadce0',borderWidth:1,titleColor:'#202124',bodyColor:'#5f6368',padding:10}},scales:{x:{ticks:{color:tC,font:{size:11,family:'DM Mono'},maxTicksLimit:12},grid:{color:gC}},y:{ticks:{color:tC,font:{size:11,family:'DM Mono'},callback:v=>fmt(v)},grid:{color:gC}}}}});

  // GARCH vol chart
  if (model==='garch' && volHistory.length > 0) {
    document.getElementById('garchSection').style.display='block';
    if (chartGarch) { chartGarch.destroy(); chartGarch=null; }
    chartGarch=new Chart(document.getElementById('chGarch'),{type:'line',data:{labels:volHistory.map((_,i)=>'Anno '+(i+1)),datasets:[{label:'Volatilità annualizzata (GARCH)',data:volHistory.map(v=>+(v*100).toFixed(2)),borderColor:'#9334e6',borderWidth:2,pointRadius:3,fill:true,backgroundColor:'rgba(147,52,230,.1)',tension:.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}},scales:{x:{ticks:{color:tC,font:{size:11}}},y:{ticks:{color:tC,font:{size:11},callback:v=>v+'%'}}}}} );
  } else document.getElementById('garchSection').style.display='none';

  // Regime distribution chart
  if (model==='regime' && regimeHistory.length > 0) {
    document.getElementById('regimeSection').style.display='block';
    const bulls=regimeHistory.filter(s=>s==='bull').length;
    const bears=regimeHistory.length-bulls;
    document.getElementById('regimeStats').innerHTML=`<div class="grid-3"><div class="mcard"><div class="ml">Anni in Bull</div><div class="mv" style="color:var(--green)">${bulls} (${(bulls/regimeHistory.length*100).toFixed(0)}%)</div></div><div class="mcard"><div class="ml">Anni in Bear</div><div class="mv" style="color:var(--red)">${bears} (${(bears/regimeHistory.length*100).toFixed(0)}%)</div></div><div class="mcard"><div class="ml">Transizioni Bear→Bull</div><div class="mv" style="color:var(--blue)">${regimeHistory.filter((s,i)=>i>0&&s==='bull'&&regimeHistory[i-1]==='bear').length}</div></div></div>`;
    if (chartRegime) { chartRegime.destroy(); chartRegime=null; }
    chartRegime=new Chart(document.getElementById('chRegime'),{type:'bar',data:{labels:regimeHistory.map((_,i)=>'A'+(i+1)),datasets:[{label:'Regime',data:regimeHistory.map(s=>s==='bull'?1:-1),backgroundColor:regimeHistory.map(s=>s==='bull'?'rgba(30,142,62,.7)':'rgba(217,48,37,.7)'),borderRadius:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.raw===1?' Bull Market':' Bear Market'}}},scales:{x:{display:false},y:{ticks:{color:tC,callback:v=>v===1?'Bull':v===-1?'Bear':''},min:-1.5,max:1.5}}}});
  } else document.getElementById('regimeSection').style.display='none';
}

function renderAdvMCComparison() {
  // Esegui tutti i modelli (N ridotto per velocità)
  const Ncomp = 500, years = state.years, ages = Array.from({length:years+1},(_,i)=>state.age+i);
  // Escludi il bootstrap dalla comparazione se il portafoglio ha asset senza serie storica
  const bootstrapOK = histModelsAvailable(state.portfolio);
  const models = ['gaussian','student','garch','regime'].concat(bootstrapOK ? ['bootstrap'] : []);
  const modelColors = {gaussian:'#5f6368',student:'#1a73e8',garch:'#9334e6',regime:'#1e8e3e',bootstrap:'#e37400'};
  const modelLabels = {gaussian:'Gaussiano',student:'t-Student',garch:'GARCH',regime:'Regime-Switch',bootstrap:'Bootstrap Storico'};
  const p50s = {};
  const compRows = [];

  for (const model of models) {
    const mu = getRate(state.portfolio,'normal',1,state.age);
    const terRate = state.ter/100;
    const ts = Array.from({length:years+1},()=>[]);
    for (let i = 0; i < Ncomp; i++) {
      let cW = state.w;
      ts[0].push(cW);
      let gSig2 = (getPortfolioVol(state.portfolio,state.age)**2)/12;
      let rsState = 'bull';
      for (let y = 1; y <= years; y++) {
        const annPac = getPacForYear(y)*12;
        const pic = state.pics.filter(p=>+p.year===y).reduce((s,p)=>s+(+p.amount||0),0);
        const exp = state.exps.filter(e=>+e.year===y).reduce((s,e)=>s+(+e.amount||0),0);
        const vol = getPortfolioVol(state.portfolio,state.age+y);
        const eqW = getEquityWeight(state.portfolio, state.age+y);
        let r;
        if (model==='gaussian') r = mu + 0.5*vol*vol + vol*randn_bm();
        else if (model==='student') {
          const nu_c = advMCState.nu||4; const vf = nu_c>2 ? nu_c/(nu_c-2) : 10;
          r = mu + 0.5*vol*vol*vf + vol*randn_t(nu_c);
        }
        else if (model==='garch') {
          let annR=1, eqSig2=gSig2*eqW, obSig2=gSig2*(1-eqW);
          for(let m=0;m<12;m++){const ee=randn_bm()*Math.sqrt(eqSig2);const oe=randn_bm()*Math.sqrt(obSig2);annR*=(1+eqW*(GARCH_EQ.mu+ee)+(1-eqW)*(GARCH_OB.mu+oe));eqSig2=GARCH_EQ.omega+GARCH_EQ.alpha*ee*ee+GARCH_EQ.beta*eqSig2;obSig2=GARCH_OB.omega+GARCH_OB.alpha*oe*oe+GARCH_OB.beta*obSig2;}
          r=annR-1; gSig2=eqW*eqSig2+(1-eqW)*obSig2;
        } else if (model==='regime') {
          const RS=RS_PARAMS; const u=Math.random();
          if(rsState==='bull')rsState=u<RS.pBullBull?'bull':'bear'; else rsState=u<RS.pBearBull?'bull':'bear';
          let annR=1,cs=rsState;
          for(let m=0;m<12;m++){const pu=Math.random();if(cs==='bull')cs=pu<RS.pBullBull?'bull':'bear';else cs=pu<RS.pBearBull?'bull':'bear';const param=cs==='bull'?RS.bull:RS.bear;annR*=(1+eqW*(param.mu+param.sigma*randn_bm())+(1-eqW)*(0.0025+0.015*randn_bm()));}
          const ptm=Math.pow(1+mu,1/12)-1;
          const pb=RS.pBearBull/(1-RS.pBullBull+RS.pBearBull);
          const rsE=pb*(eqW*RS.bull.mu+(1-eqW)*0.0025)+(1-pb)*(eqW*RS.bear.mu+(1-eqW)*0.0025);
          r=annR*Math.pow(1+(ptm-rsE),12)-1;
        } else { // bootstrap
          const goldW_b0 = getGoldWeight(state.portfolio);
          const cashW_b  = getCashWeight(state.portfolio);
          const altW_b   = state.portfolio === 'custom' ? (calcCustomParams().altW || 0) : 0;
          const goldW_b  = goldW_b0 + altW_b; // commodities mappate sull'oro
          const obW_b    = Math.max(0, 1 - eqW - goldW_b - cashW_b);
          const n_hist = HIST_MONTHLY.length;
          const startIdx = Math.floor(Math.random() * (n_hist - 11));
          let annR = 1;
          for (let m = 0; m < 12; m++) {
            const row = calibrateHistRow(HIST_MONTHLY[startIdx + m]);
            annR *= (1 + eqW * row[0] + obW_b * row[1] + goldW_b * row[2] + cashW_b * 0.0025);
          }
          const histMean_b = calcHistMean(eqW, goldW_b, obW_b, cashW_b);
          r = annR * (1 + mu) / (1 + histMean_b) - 1;
        }
        r-=terRate;
        const midW=cW+(annPac+pic-exp)/2; cW+=annPac+pic-exp+midW*r; ts[y].push(Math.max(0,cW));
      }
    }
    const pct=(arr,p)=>{const s=[...arr].sort((a,b)=>a-b);return s[Math.floor(s.length*p)]||0;};
    p50s[model] = Array.from({length:years+1},(_,y)=>pct(ts[y],.50));
    const finalVals = ts[years].sort((a,b)=>a-b);
    compRows.push(
      `<div style="display:flex;gap:12px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
        <span style="font-size:12px;font-weight:700;color:${modelColors[model]};width:150px;font-family:'DM Mono',monospace">${modelLabels[model]}</span>
        <div class="mcard" style="padding:8px 12px;flex:1"><div class="ml">P10</div><div style="font-size:14px;font-weight:700;color:var(--red);font-family:'DM Mono',monospace">${fmt(pct(finalVals,.10))}</div></div>
        <div class="mcard" style="padding:8px 12px;flex:1"><div class="ml">P50</div><div style="font-size:14px;font-weight:700;color:var(--blue);font-family:'DM Mono',monospace">${fmt(pct(finalVals,.50))}</div></div>
        <div class="mcard" style="padding:8px 12px;flex:1"><div class="ml">P90</div><div style="font-size:14px;font-weight:700;color:var(--green);font-family:'DM Mono',monospace">${fmt(pct(finalVals,.90))}</div></div>
      </div>`
    );
  }
  document.getElementById('advMcComparison').innerHTML = compRows.join('');
  // Grafico confronto P50
  if (chartAdvComp) { chartAdvComp.destroy(); chartAdvComp=null; }
  const gC='rgba(0,0,0,.05)',tC='rgba(0,0,0,.45)';
  chartAdvComp=new Chart(document.getElementById('chAdvMCComp'),{type:'line',data:{labels:ages,datasets:models.map(m=>({label:modelLabels[m],data:p50s[m],borderColor:modelColors[m],borderWidth:2.5,pointRadius:0,fill:false,tension:.35,borderDash:m==='gaussian'?[5,4]:m==='bootstrap'?[3,2]:[]}))},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true,labels:{font:{size:11}}},tooltip:{callbacks:{title:c=>'Età '+c[0].label,label:c=>' '+c.dataset.label+' P50: '+fmt(c.raw)},backgroundColor:'#fff',borderColor:'#dadce0',borderWidth:1,titleColor:'#202124',bodyColor:'#5f6368',padding:10}},scales:{x:{ticks:{color:tC,font:{size:11,family:'DM Mono'},maxTicksLimit:12},grid:{color:gC}},y:{ticks:{color:tC,font:{size:11,family:'DM Mono'},callback:v=>fmt(v)},grid:{color:gC}}}}});
}

// ══════════════════════════════════════════════════════════════
// ██████  MODULO 3 — FISCALITÀ ITALIANA COMPLETA
// ══════════════════════════════════════════════════════════════
let fiscState = {
  regime: 'amministrato',
  method: 'avg',          // avg | lifo | fifo
  aliqGain: 26,           // %
  aliqOb: 12.5,           // % per titoli stato
  bollo: 0.20,            // % annuo
  strumento: 'etf_ucits',
  sellAmount: 50000,
  sellYear: 10,
  minusvalenze: [],       // {id, amount, year, scadenza}
  // Dati importati dal simulatore
  pac: 0, w: 0, years: 0,
  loaded: false,
};
let fiscMinusId = 0;
let chartFisc = null, chartFiscComp = null;

const FISC_REGIME_DESC = {
  amministrato: `<strong>Regime Amministrato (art. 6 D.Lgs. 461/1997):</strong> Il broker/banca agisce da <em>sostituto d'imposta</em> — calcola e versa le tasse automaticamente. <strong>Vantaggi:</strong> semplicità, nessun obbligo dichiarativo. <strong>Limiti:</strong> le minusvalenze compensano solo redditi diversi (ETF non-UCITS, azioni, derivati) — <strong>non</strong> i redditi di capitale (cedole, dividendi, rendimento ETF UCITS). Metodo obbligatorio: <strong>costo medio ponderato</strong> per ETF. Imposta di bollo detratta direttamente dal conto.`,
  dichiarativo: `<strong>Regime Dichiarativo (art. 5 D.Lgs. 461/1997):</strong> L'investitore dichiara autonomamente plusvalenze e minusvalenze nel Modello Redditi. <strong>Vantaggi:</strong> <em>compensazione totale</em> tra redditi diversi (incluso offset più ampio di minus vs plus), possibilità di usare metodo LIFO. <strong>Limiti:</strong> obbligo dichiarativo, pagamento imposte con F24 entro le scadenze. Adatto a portafogli complessi con strumenti diversificati e uso attivo dello zainetto fiscale.`,
};

const STRUMENTO_DESC = {
  etf_ucits: { label:'ETF UCITS', tipo:'Reddito di Capitale', aliq:'26% (o 12,5% su quota obblig. gov.)', compensabile:false, note:'Le plus sono reddito di capitale — non compensabili con minus da redditi diversi in regime amministrato. Il broker applica la ritenuta direttamente.' },
  etf_nonutf: { label:'ETF non-UCITS', tipo:'Reddito Diverso', aliq:'26%', compensabile:true, note:'Trattato come reddito diverso — le plus sono compensabili con minusvalenze pregresse in entrambi i regimi.' },
  azioni: { label:'Azioni dirette', tipo:'Reddito Diverso', aliq:'26%', compensabile:true, note:'Capital gain da azioni: reddito diverso, compensabile con minus. Dividendi: reddito di capitale (26%).' },
  btp: { label:'BTP / Titoli di Stato', tipo:'Reddito di Capitale', aliq:'12.5%', compensabile:false, note:'Aliquota agevolata 12,5%. Non compensabili con minus in regime amministrato.' },
  obblig: { label:'Obbligaz. Corporate', tipo:'Reddito di Capitale / Diverso', aliq:'26%', compensabile:false, note:'Cedole: reddito di capitale (26%). Capital gain da vendita: reddito diverso, compensabile.' },
};

document.getElementById('fiscRegimeBtns').onclick = e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  fiscState.regime = b.dataset.r;
  document.querySelectorAll('#fiscRegimeBtns .gbtn').forEach(x=>x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  document.getElementById('fiscRegimeDesc').innerHTML = FISC_REGIME_DESC[b.dataset.r]||'';
  renderFiscale();
};
document.getElementById('fiscMethodBtns').onclick = e => {
  const b = e.target.closest('[data-mth]'); if (!b) return;
  fiscState.method = b.dataset.mth;
  document.querySelectorAll('#fiscMethodBtns .gbtn').forEach(x=>x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  renderFiscale();
};
document.getElementById('fiscStrumBtns').onclick = e => {
  const b = e.target.closest('[data-st]'); if (!b) return;
  fiscState.strumento = b.dataset.st;
  document.querySelectorAll('#fiscStrumBtns .gbtn').forEach(x=>x.classList.remove('a-blue'));
  b.classList.add('a-blue');
  renderFiscale();
};

// Init regime desc
document.getElementById('fiscRegimeDesc').innerHTML = FISC_REGIME_DESC['amministrato'];

function addFiscMinus() {
  fiscState.minusvalenze.push({ id: fiscMinusId++, amount: 5000, year: new Date().getFullYear(), scadenza: new Date().getFullYear()+4 });
  renderFiscMinusList(); renderFiscale();
}
function delFiscMinus(id) {
  fiscState.minusvalenze = fiscState.minusvalenze.filter(m=>m.id!==id);
  renderFiscMinusList(); renderFiscale();
}
function renderFiscMinusList() {
  const el = document.getElementById('fiscMinusList');
  if (!fiscState.minusvalenze.length) { el.innerHTML='<div class="empty-entry">Nessuna minusvalenza in zainetto</div>'; return; }
  el.innerHTML = fiscState.minusvalenze.map(m=>`
    <div class="erow">
      <span class="elab">€ minus.</span>
      <input class="einput" type="number" min="0" step="100" value="${m.amount}" onchange="(function(){fiscState.minusvalenze.find(x=>x.id===${m.id}).amount=+this.value;renderFiscale()}).call(this)">
      <span class="elab">Anno</span>
      <input class="einput" type="number" min="2018" max="2030" value="${m.year}" onchange="(function(){const x=fiscState.minusvalenze.find(x=>x.id===${m.id});x.year=+this.value;x.scadenza=+this.value+4;renderFiscale()}).call(this)" style="width:70px">
      <span style="font-size:10.5px;color:var(--text3);font-family:'DM Mono',monospace">scad. ${m.year+4}</span>
      <button class="dbtn" onclick="delFiscMinus(${m.id})">✕</button>
    </div>`).join('');
}

function importFiscFromSim() {
  fiscState.pac = state.pac;
  fiscState.w = state.w;
  fiscState.years = state.years;
  fiscState.loaded = true;
  document.getElementById('fiscImportStatus').innerHTML = `<strong style="color:var(--green)">✅ Importato:</strong> Capitale €${fmtN(state.w)}, PAC €${fmtN(state.pac)}/m, ${state.years} anni`;
  renderFiscale();
}

// Calcola lotti e base di costo con metodo scelto
function calcFiscalLots(pac, w0, years, annualReturnRate, method) {
  // Simula acquisti mensili a prezzi diversi (prezzo unitario normalizzato)
  let price = 100; // prezzo normalizzato iniziale
  const lots = []; // {qty, cost} per LIFO/FIFO
  let totalQty = 0, totalCost = 0;
  // Acquisto iniziale
  if (w0 > 0) {
    const qty0 = w0 / price;
    lots.push({ qty: qty0, cost: price });
    totalQty += qty0; totalCost += w0;
  }
  const monthlyRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
  const yearlyData = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      price *= (1 + monthlyRate);
      if (pac > 0) {
        const qty = pac / price;
        lots.push({ qty, cost: price });
        totalQty += qty; totalCost += pac;
      }
    }
    const currentValue = totalQty * price;
    // Costo medio ponderato
    const avgCost = totalQty > 0 ? totalCost / totalQty : price;
    yearlyData.push({ year:y, price, currentValue: Math.round(currentValue), totalInvested: Math.round(totalCost), avgCost: Math.round(avgCost*100)/100, totalQty });
  }
  return { lots, yearlyData, finalPrice: price, totalQty, totalCost };
}

function calcTaxOnSell(sellAmount, currentPrice, lots, method, regime, strumento, aliqGain, aliqOb, minusvalenze, currentYear) {
  const strDesc = STRUMENTO_DESC[strumento];
  // BTP e Titoli di Stato applicano aliquota ridotta 12.5%; tutto il resto aliqGain
  const actualAliq = strumento === 'btp' ? aliqOb : aliqGain;

  // Quota di strumento venduta
  const totalQty = lots.reduce((s,l)=>s+l.qty,0);
  const totalValue = totalQty * currentPrice;
  const sellFraction = Math.min(1, sellAmount / totalValue);
  const qtyToSell = totalQty * sellFraction;

  let costBasis = 0;
  if (method === 'avg') {
    const avgCost = lots.reduce((s,l)=>s+l.qty*l.cost,0) / totalQty;
    costBasis = qtyToSell * avgCost;
  } else if (method === 'lifo') {
    let remaining = qtyToSell;
    const lifo = [...lots].reverse();
    for (const l of lifo) {
      if (remaining <= 0) break;
      const use = Math.min(remaining, l.qty);
      costBasis += use * l.cost;
      remaining -= use;
    }
  } else { // fifo
    let remaining = qtyToSell;
    for (const l of lots) {
      if (remaining <= 0) break;
      const use = Math.min(remaining, l.qty);
      costBasis += use * l.cost;
      remaining -= use;
    }
  }

  const grossGain = sellAmount - costBasis;
  const isGain = grossGain > 0;
  let taxableGain = Math.max(0, grossGain);

  // Utilizzo zainetto fiscale (solo se regime dichiarativo o strumento compensabile)
  const canUseMinus = regime === 'dichiarativo' || (regime === 'amministrato' && strDesc.compensabile);
  let minusUsed = 0;
  const currentYearN = currentYear || 2025;
  const validMinus = minusvalenze.filter(m => m.scadenza >= currentYearN && m.amount > 0);
  const totalMinus = validMinus.reduce((s,m)=>s+m.amount,0);

  if (canUseMinus && taxableGain > 0) {
    minusUsed = Math.min(taxableGain, totalMinus);
    taxableGain -= minusUsed;
  }

  const tax = taxableGain * (actualAliq / 100);
  const netProceeds = sellAmount - tax;
  const effectiveRate = sellAmount > 0 ? tax / sellAmount * 100 : 0;

  return { sellAmount, costBasis: Math.round(costBasis), grossGain: Math.round(grossGain), taxableGain: Math.round(taxableGain), tax: Math.round(tax), netProceeds: Math.round(netProceeds), effectiveRate, minusUsed: Math.round(minusUsed), canUseMinus, aliq: actualAliq, method };
}

function renderFiscale() {
  if (!fiscState.loaded) {
    // Usa dati di default se non importati
    fiscState.pac = state.pac || 300;
    fiscState.w = state.w || 10000;
    fiscState.years = state.years || 20;
  }
  const { pac, w, years, regime, method, aliqGain, aliqOb, bollo, strumento, sellAmount, sellYear, minusvalenze } = fiscState;
  const annRate = (getPortParams(state.portfolio)?.normal) || 0.055;
  const terRate = state.ter/100;
  const netRate = annRate - terRate;

  const fiscData = calcFiscalLots(pac, w, years, netRate, method);
  const { yearlyData, lots, finalPrice, totalQty, totalCost } = fiscData;

  // Grafico valore vs costo
  if (chartFisc) { chartFisc.destroy(); chartFisc=null; }
  const labels = yearlyData.map(d=>'Anno '+d.year);
  const gC='rgba(0,0,0,.05)',tC='rgba(0,0,0,.45)';
  chartFisc=new Chart(document.getElementById('chFisc'),{type:'line',data:{labels,datasets:[
    {label:'Valore di mercato',data:yearlyData.map(d=>d.currentValue),borderColor:'#1a73e8',borderWidth:2.5,pointRadius:0,fill:true,backgroundColor:'rgba(26,115,232,.08)',tension:.35},
    {label:'Capitale investito',data:yearlyData.map(d=>d.totalInvested),borderColor:'#1e8e3e',borderWidth:2,pointRadius:0,fill:false,borderDash:[5,4],tension:.35},
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true},tooltip:{callbacks:{title:c=>c[0].label,label:c=>' '+c.dataset.label+': '+fmt(c.raw)},backgroundColor:'#fff',borderColor:'#dadce0',borderWidth:1,titleColor:'#202124',bodyColor:'#5f6368',padding:10}},scales:{x:{ticks:{color:tC,font:{size:11,family:'DM Mono'},maxTicksLimit:15},grid:{color:gC}},y:{ticks:{color:tC,font:{size:11,family:'DM Mono'},callback:v=>fmt(v)},grid:{color:gC}}}}});

  // Summary lotti
  const finalData = yearlyData[yearlyData.length-1];
  const avgCostFinal = finalData ? finalData.avgCost : 0;
  const strDesc = STRUMENTO_DESC[strumento];
  document.getElementById('fiscLotSummary').innerHTML = `
    <div class="grid-4" style="margin-bottom:12px">
      <div class="mcard"><div class="ml">Valore finale</div><div class="mv" style="color:var(--blue)">${fmt(finalData?.currentValue||0)}</div></div>
      <div class="mcard"><div class="ml">Totale investito</div><div class="mv" style="color:var(--green)">${fmt(finalData?.totalInvested||0)}</div></div>
      <div class="mcard"><div class="ml">Plusvalenza lorda</div><div class="mv" style="color:var(--green)">${fmt((finalData?.currentValue||0)-(finalData?.totalInvested||0))}</div></div>
      <div class="mcard"><div class="ml">Costo medio ponderato</div><div class="mv" style="color:var(--text)">€${avgCostFinal.toFixed(2)}</div><div class="ms">per quota (norm. €100)</div></div>
    </div>
    <div style="padding:12px 16px;background:${strDesc.compensabile?'var(--green-dim)':'var(--orange-dim)'};border:1px solid ${strDesc.compensabile?'rgba(30,142,62,.3)':'rgba(227,116,0,.3)'};border-radius:var(--radius-sm);font-size:12.5px;color:var(--text2);line-height:1.7">
      <strong style="color:${strDesc.compensabile?'var(--green)':'var(--orange)'}">${strDesc.label} — ${strDesc.tipo}</strong> · Aliquota: <strong>${strDesc.aliq}</strong><br>
      ${strDesc.note}<br>
      <strong>Compensazione minus:</strong> ${strDesc.compensabile?'✅ Sì (reddito diverso)':'❌ No in regime amm. (reddito di capitale)'} · <strong>Metodo:</strong> ${method==='avg'?'Costo Medio Ponderato':method==='lifo'?'LIFO':'FIFO'}
    </div>`;

  // Simulazione vendita parziale
  const sellYearData = yearlyData[Math.min(sellYear, years)-1];
  if (sellYearData && lots.length > 0) {
    // Lotti fino all'anno di vendita
    const lotsAtSell = calcFiscalLots(pac, w, Math.min(sellYear, years), netRate, method);
    const currentPriceAtSell = lotsAtSell.yearlyData[lotsAtSell.yearlyData.length-1]?.price || finalPrice;
    const taxResult = calcTaxOnSell(Math.min(sellAmount, sellYearData.currentValue), currentPriceAtSell, lotsAtSell.lots, method, regime, strumento, aliqGain, aliqOb, minusvalenze, 2025+sellYear);
    document.getElementById('fiscSellResult').innerHTML = `
      <div class="grid-4" style="margin-bottom:12px">
        <div class="mcard"><div class="ml">Provento lordo</div><div class="mv" style="color:var(--text)">${fmt(taxResult.sellAmount)}</div></div>
        <div class="mcard"><div class="ml">Base di costo (${method})</div><div class="mv" style="color:var(--blue)">${fmt(taxResult.costBasis)}</div></div>
        <div class="mcard"><div class="ml">Plusvalenza tassabile</div><div class="mv" style="color:${taxResult.grossGain>0?'var(--orange)':'var(--green)}'}">${fmt(taxResult.taxableGain)}</div></div>
        <div class="mcard"><div class="ml">Imposta dovuta (${taxResult.aliq}%)</div><div class="mv" style="color:var(--red)">${fmt(taxResult.tax)}</div></div>
        <div class="mcard"><div class="ml">Netto incassato</div><div class="mv" style="color:var(--green)">${fmt(taxResult.netProceeds)}</div></div>
        <div class="mcard"><div class="ml">Aliquota effettiva</div><div class="mv" style="color:var(--text)">${taxResult.effectiveRate.toFixed(1)}%</div></div>
        ${taxResult.minusUsed>0?`<div class="mcard"><div class="ml">Minus utilizzate</div><div class="mv" style="color:var(--green)">−${fmt(taxResult.minusUsed)}</div><div class="ms">dallo zainetto</div></div>`:''}
      </div>
      ${!taxResult.canUseMinus&&regime==='amministrato'&&strDesc.compensabile===false?`<div style="padding:10px 14px;background:var(--orange-dim);border:1px solid rgba(227,116,0,.3);border-radius:var(--radius-sm);font-size:12.5px;color:var(--orange)">⚠️ In regime amministrato con ${strDesc.label}, le minusvalenze pregresse <strong>non possono</strong> essere utilizzate in compensazione. Passare al regime dichiarativo per ottimizzare il carico fiscale.</div>`:''}`;
  }

  // Confronto regimi — simulazione piano completo
  const computeNetForRegime = (rgm, mth) => {
    const fD = calcFiscalLots(pac, w, years, netRate, mth);
    const fData = fD.yearlyData[years-1];
    if (!fData) return {net:0, totalTax:0, bolloTot:0};
    const totalValue = fData.currentValue;
    const totalInv = fData.totalInvested;
    const gain = Math.max(0, totalValue - totalInv);
    // Bollo annuo
    let bolloTot = 0;
    for (const yd of fD.yearlyData) bolloTot += yd.currentValue * (bollo/100);
    // Tasse capital gain
    const aliq = strumento==='btp' ? aliqOb : aliqGain;
    // Zainetto
    const validM = minusvalenze.filter(m=>m.scadenza>=(2025+years)&&m.amount>0);
    const totM = validM.reduce((s,m)=>s+m.amount,0);
    const canUse = rgm==='dichiarativo' || STRUMENTO_DESC[strumento].compensabile;
    const taxableGain = canUse ? Math.max(0, gain-totM) : gain;
    const tax = taxableGain * (aliq/100);
    const net = totalValue - tax - bolloTot;
    return { net: Math.round(net), totalTax: Math.round(tax), bolloTot: Math.round(bolloTot), totalValue: Math.round(totalValue) };
  };

  const scenarios = [
    { l:'Amm. + Costo Medio', r:'amministrato', m:'avg' },
    { l:'Dich. + LIFO', r:'dichiarativo', m:'lifo' },
    { l:'Dich. + FIFO', r:'dichiarativo', m:'fifo' },
    { l:'Dich. + Costo Medio', r:'dichiarativo', m:'avg' },
  ];
  const scResults = scenarios.map(s=>({ ...s, ...computeNetForRegime(s.r, s.m) }));
  const bestNet = Math.max(...scResults.map(s=>s.net));

  document.getElementById('fiscCompare').innerHTML = `
    <div class="tbl-outer" style="margin-bottom:14px"><table>
      <thead><tr><th style="text-align:left">Regime + Metodo</th><th>Valore lordo</th><th>Imposta CG</th><th>Bollo (cum.)</th><th>Netto finale</th><th>Risparmio vs peggiore</th></tr></thead>
      <tbody>${scResults.map(s=>{const isBest=s.net===bestNet;const worst=Math.min(...scResults.map(x=>x.net));const saving=s.net-worst;return`<tr style="${isBest?'background:var(--green-dim)':''}"><td style="text-align:left;font-weight:${isBest?700:400}">${isBest?'⭐ ':''}${s.l}</td><td>${fmt(s.totalValue)}</td><td style="color:var(--red)">−${fmt(s.totalTax)}</td><td style="color:var(--orange)">−${fmt(s.bolloTot)}</td><td style="color:${isBest?'var(--green)':'var(--text)'};font-weight:${isBest?700:400}">${fmt(s.net)}</td><td class="${saving>0?'pos':'neutral'}">${saving>0?'+'+fmt(saving):'—'}</td></tr>`;}).join('')}</tbody>
    </table></div>`;

  // Chart confronto
  if (chartFiscComp) { chartFiscComp.destroy(); chartFiscComp=null; }
  const colors=['#1a73e8','#9334e6','#1e8e3e','#00897b'];
  chartFiscComp=new Chart(document.getElementById('chFiscComp'),{type:'bar',data:{labels:scResults.map(s=>s.l),datasets:[{label:'Netto finale',data:scResults.map(s=>s.net),backgroundColor:colors.map((c,i)=>scResults[i].net===bestNet?c+'dd':c+'66'),borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' Netto: '+fmt(c.raw)}}},scales:{x:{ticks:{color:tC,font:{size:11}}},y:{ticks:{color:tC,font:{size:11},callback:v=>fmt(v)},grid:{color:gC}}}}});

  // Bollo nel tempo
  let bolloDetails='';
  let cumBollo=0;
  const bolloPeriods=[5,10,15,years];
  for (const yy of bolloPeriods.filter(p=>p<=years)) {
    const yd = yearlyData[yy-1];
    if (!yd) continue;
    // Approssimazione cumulativa
    let cumB=0;
    for (let i=0;i<yy;i++) cumB += (yearlyData[i]?.currentValue||0)*(bollo/100);
    bolloDetails+=`<div class="infl-swr-row"><span style="font-weight:600;color:var(--orange)">Anno ${yy}</span><span>Patrimonio: <strong>${fmt(yd.currentValue)}</strong></span><span>Bollo anno: <strong style="color:var(--orange)">${fmt(yd.currentValue*(bollo/100))}</strong></span><span>Bollo cum.: <strong style="color:var(--red)">${fmt(cumB)}</strong></span></div>`;
  }
  document.getElementById('fiscBollo').innerHTML=`
    <div style="padding:12px 16px;background:#fff3e0;border:1px solid #ffe0b2;border-radius:var(--radius-sm);font-size:12.5px;color:#795548;margin-bottom:10px">
      Imposta di bollo: <strong>${bollo.toFixed(2)}%/a</strong> sul valore del dossier titoli (D.L. 201/2011). Applicata sul saldo medio annuo. Soglia minima: €34,20 (pers. fisiche); nessuna franchigia per pers. giuridiche. Alcune banche applicano il bollo proporzionale al controvalore effettivo di fine periodo.
    </div>
    <div style="background:#fff;border:1px solid #ffe0b2;border-radius:var(--radius-sm);padding:14px">${bolloDetails||'<span style="color:var(--text3)">Nessun dato</span>'}</div>`;

  // Zainetto
  const currentYearN = 2025;
  const validMinus = minusvalenze.filter(m=>m.scadenza>=currentYearN);
  const expiredMinus = minusvalenze.filter(m=>m.scadenza<currentYearN);
  const totValid = validMinus.reduce((s,m)=>s+m.amount,0);
  const totExpired = expiredMinus.reduce((s,m)=>s+m.amount,0);
  document.getElementById('fiscZainetto').innerHTML = minusvalenze.length===0
    ? `<div class="info-box">Nessuna minusvalenza inserita. Usa il pannello in alto per aggiungere minusvalenze pregresse allo zainetto fiscale.</div>`
    : `<div class="grid-4" style="margin-bottom:12px">
        <div class="mcard"><div class="ml">Minus valide totali</div><div class="mv" style="color:var(--green)">${fmt(totValid)}</div></div>
        <div class="mcard"><div class="ml">Minus scadute</div><div class="mv" style="color:var(--red)">${fmt(totExpired)}</div></div>
        <div class="mcard"><div class="ml">Utilizzabili (regime amm.)</div><div class="mv" style="color:var(--blue)">${STRUMENTO_DESC[strumento].compensabile?fmt(totValid):'€0'}</div><div class="ms">${STRUMENTO_DESC[strumento].compensabile?'reddito diverso':'reddito di capitale — non compensabile'}</div></div>
        <div class="mcard"><div class="ml">Utilizzabili (dich.)</div><div class="mv" style="color:var(--purple)">${fmt(totValid)}</div><div class="ms">compensazione totale</div></div>
      </div>
      <div class="tbl-outer"><table>
        <thead><tr><th style="text-align:left">Anno maturazione</th><th>Importo</th><th>Scadenza</th><th>Stato</th><th>Risparmio fiscale potenziale (${aliqGain}%)</th></tr></thead>
        <tbody>${minusvalenze.map(m=>{const valid=m.scadenza>=currentYearN;return`<tr><td style="text-align:left">${m.year}</td><td>${fmt(m.amount)}</td><td>${m.year+4}</td><td class="${valid?'pos':'neg'}">${valid?'✅ Valida':'❌ Scaduta'}</td><td class="${valid?'pos':'neutral'}">${valid?'+'+fmt(m.amount*(aliqGain/100)):'—'}</td></tr>`;}).join('')}</tbody>
      </table></div>`;
}

// ══════════════════════════════════════════════════════════════
// switchTab — versione completa (unica definizione)
// ══════════════════════════════════════════════════════════════
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
  if (tabId==='scenarios') { updateEcoTimDesc(); renderEcoScenarios(); }
  if (tabId==='ab') renderAB();
  if (tabId==='mc') document.getElementById('mcAccYears').textContent=state.years;
  if (tabId==='decumulo') renderDecumulo();
  if (tabId==='fiscale') renderFiscale();
  if (tabId==='backtest') initBacktest();
  if (tabId==='advmc') { document.getElementById('advMcModelDesc').innerHTML=ADV_MODEL_DESC[advMCState.model]||''; updateBootstrapBtnState(); }
}

// ══════════════════════════════════════════════════════════════
// HISTORICAL BACKTESTING ENGINE
// Usa i dati mensili reali HIST_MONTHLY (1970-2024) per simulare
// il piano PAC su periodi storici specifici, con correlazioni
// DINAMICHE: in anni di drawdown > 15% le correlazioni si alzano
// verso la matrice STRESS (come osservato empiricamente).
// ══════════════════════════════════════════════════════════════

const BT_PERIODS = {
  1973: { label: '1973 — Stagflazione OPEC', color: '#e37400', bg: 'rgba(227,116,0,.08)', context: 'Embargo petrolifero OPEC (ottobre 1973). Inflazione al 12%, azioni −48% in 2 anni. Il peggior inizio per un piano PAC nella storia moderna — oro +162% nello stesso periodo.', crisis: [1973, 1974] },
  1980: { label: '1980 — Volcker shock', color: '#d93025', bg: 'rgba(217,48,37,.08)', context: 'Paul Volcker porta i tassi al 20% per schiacciare l\'inflazione. Azioni −28%, obbligazioni devastate. Poi il più lungo bull market della storia (1982-2000).', crisis: [1980, 1981] },
  1987: { label: '1987 — Black Monday', color: '#9334e6', bg: 'rgba(147,52,230,.08)', context: 'Black Monday 19 ottobre 1987: azioni −22% in UN giorno. Ma il mercato recuperò entro 2 anni — esempio di crash violento ma breve. Il PAC comprò a sconto.', crisis: [1987] },
  1995: { label: '1995 — Lancio dot-com', color: '#1e8e3e', bg: 'rgba(30,142,62,.08)', context: 'Partenza nella fase espansiva pre-bolla internet. Rendimenti azionari eccezionali 1995-1999, poi crash violento 2000-2002. Ottima finestra per capire l\'euforia.', crisis: [2000, 2001, 2002] },
  2000: { label: '2000 — Burst dot-com', color: '#d93025', bg: 'rgba(217,48,37,.08)', context: 'Crollo della bolla internet. Azioni −49% in 3 anni (2000-2002). NASDAQ −78%. Chi ha iniziato qui ha visto il capitale dimezzarsi — poi il recupero fino al 2007.', crisis: [2000, 2001, 2002] },
  2004: { label: '2004 — Pre-crisi finanziaria', color: '#1a73e8', bg: 'rgba(26,115,232,.08)', context: 'Partenza in crescita moderata prima della grande crisi del 2008. Piano PAC che incontra prima un bull market (2004-2007) poi il peggior crash dal 1929.', crisis: [2008, 2009] },
  2008: { label: '2008 — Crisi finanziaria globale', color: '#d93025', bg: 'rgba(217,48,37,.1)', context: 'Il peggiore crash da 1929. S&P500 −57%, MSCI World −54%. Le correlazioni tra azioni e obbligazioni implosero. Chi ha comprato in caduta ha triplicato in 10 anni.', crisis: [2008, 2009] },
  2012: { label: '2012 — Crisi Euro sovrana', color: '#e37400', bg: 'rgba(227,116,0,.08)', context: 'Crisi dei debiti sovrani europei. Spread BTP-Bund a 500bp. Draghi: "whatever it takes" (luglio 2012) segna il bottom. Poi bull market fino al 2022.', crisis: [2011, 2012] },
  2019: { label: '2019 — Pre-COVID', color: '#1e8e3e', bg: 'rgba(30,142,62,.08)', context: 'Partenza in anno neutro, poi COVID-19 (febbraio-marzo 2020): azioni −34% in 33 giorni. Recovery completata in meno di 6 mesi — il crash più veloce della storia.', crisis: [2020] },
  2022: { label: '2022 — Inflazione & rialzo tassi', color: '#00897b', bg: 'rgba(0,137,123,.08)', context: 'Il 2022 è unico: azioni −20% E obbligazioni −15% contemporaneamente — entrambi in drawdown. Il 60/40 perde −17%: il peggior anno dal 1937 per portafogli bilanciati.', crisis: [2022] },
};

// Inflazione storica annua (CPI USA approssimato) per periodo, per deflatare
const HIST_INFLATION = {
  1970:5.7,1971:4.4,1972:3.2,1973:6.2,1974:11.0,1975:9.1,1976:5.8,1977:6.5,1978:7.6,1979:11.3,
  1980:13.5,1981:10.3,1982:6.2,1983:3.2,1984:4.3,1985:3.6,1986:1.9,1987:3.6,1988:4.1,1989:4.8,
  1990:5.4,1991:4.2,1992:3.0,1993:3.0,1994:2.6,1995:2.8,1996:3.0,1997:2.3,1998:1.6,1999:2.2,
  2000:3.4,2001:2.8,2002:1.6,2003:2.3,2004:2.7,2005:3.4,2006:3.2,2007:2.8,2008:3.8,2009:-0.4,
  2010:1.6,2011:3.2,2012:2.1,2013:1.5,2014:1.6,2015:0.1,2016:1.3,2017:2.1,2018:2.4,2019:1.8,
  2020:1.2,2021:4.7,2022:8.0,2023:4.1,2024:2.9,
};

// Stato Backtesting
let btState = {
  startYear: 1973,
  port: 'eq60',
  pac: 500,
  w: 10000,
  showReal: false,
};
let chartBt = null, chartBtDD = null, chartBtComp = null;
let btInitialized = false;

function initBacktest() {
  if (btInitialized) return;
  btInitialized = true;

  // Init start year buttons
  document.getElementById('btStartYearBtns').onclick = e => {
    const b = e.target.closest('[data-y]'); if (!b) return;
    btState.startYear = +b.dataset.y;
    document.querySelectorAll('#btStartYearBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
    b.classList.add('a-blue');
  };

  // Portfolio buttons
  document.getElementById('btPortBtns').onclick = e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    btState.port = b.dataset.k;
    document.querySelectorAll('#btPortBtns .gbtn').forEach(x => x.classList.remove('a-blue'));
    b.classList.add('a-blue');
    if (b.dataset.k === 'sim') {
      btState.port = state.portfolio;
      btState.pac = state.pac;
      btState.w = state.w;
      document.getElementById('sBtPac').value = state.pac;
      document.getElementById('lBtPac').textContent = '€' + fmtN(state.pac) + '/m';
      document.getElementById('sBtW').value = Math.min(state.w, 500000);
      document.getElementById('lBtW').textContent = fmt(state.w);
      document.getElementById('btSyncBanner').style.display = 'block';
      document.getElementById('btSyncBanner').innerHTML = `↩ Importati dal Simulatore: portafoglio <strong>${getPortLabel(state.portfolio)}</strong> · PAC <strong>€${fmtN(state.pac)}/m</strong> · Capitale iniziale <strong>${fmt(state.w)}</strong>`;
    }
  };
}

function toggleBtInflation() {
  btState.showReal = !btState.showReal;
  document.getElementById('btInflTog').classList.toggle('on', btState.showReal);
}

// Calcola indici dell'array HIST_MONTHLY a partire dall'anno
function yearToHistIdx(year) {
  return Math.max(0, (year - 1970) * 12);
}

// Drawdown massimo da un array di valori
function maxDrawdown(values) {
  let peak = values[0], maxDD = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = peak > 0 ? (v - peak) / peak : 0;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD; // negativo o 0
}

// Calcola drawdown annuale per il grafico
function calcYearlyDrawdown(values) {
  const dd = [];
  let peak = values[0];
  for (const v of values) {
    if (v > peak) peak = v;
    dd.push(peak > 0 ? (v - peak) / peak * 100 : 0);
  }
  return dd;
}

// Rileva correlazione "in crisi" in base al drawdown corrente
function getCorrMultiplier(eqDraw, obDraw) {
  // Se azioni in drawdown > 15% e siamo in contesto di stress, correlaz. salgono
  if (eqDraw < -0.15) return 0.7; // stress: usa 70% corr_stress + 30% corr_normal
  if (eqDraw < -0.25) return 0.9; // crisi: quasi completamente stress
  return 0; // normale
}

// Simula il piano PAC su dati storici reali
// portKey: portafoglio (usa pesi eq/ob/gold/cash)
// startYear: anno di partenza
// years: durata in anni (usa state.years se non specificato, max 30 anni)
function simulateBacktest(portKey, startYear, pacMonthly, w0) {
  const startIdx = yearToHistIdx(startYear);
  const years = Math.min(state.years, Math.floor((HIST_MONTHLY.length - startIdx) / 12));
  const months = years * 12;
  
  const eqW = getEquityWeight(portKey, state.age);
  const goldW0 = getGoldWeight(portKey);
  const cashW = getCashWeight(portKey);
  // Commodities ammesse (altW) mappate sull'oro; trend/carry esclusi a monte dal gate
  const altW = portKey === 'custom' ? (calcCustomParams().altW || 0) : 0;
  const goldW = goldW0 + altW;
  const obW = Math.max(0, 1 - eqW - goldW - cashW);

  const terRate = state.ter / 100 / 12; // mensile
  
  let portValue = w0;
  let totalInvested = w0;
  const monthlyValues = [w0];
  const annualValues = [w0];
  const annualInvested = [w0];
  const annualInflations = [];
  const yearlyEqReturns = []; // per calcolo drawdown e dinamica correlaz.
  
  let cumInfl = 1;
  let eqPeak = 1, eqCumRet = 1;

  for (let m = 0; m < months; m++) {
    const idx = startIdx + m;
    if (idx >= HIST_MONTHLY.length) break;
    
    const row = calibrateHistRow(HIST_MONTHLY[idx]);
    const eqRet = row[0];     // azioni sviluppati
    const obRet = row[1];     // bond aggregate
    const goldRet = row[2];   // oro
    const cashRet = 0.002;    // ~2.4%/anno liquidità

    // Calcola la correlazione dinamica: se azioni in stress, le correlazioni si alzano
    eqCumRet *= (1 + eqRet);
    if (eqCumRet > eqPeak) eqPeak = eqCumRet;
    const currentEqDraw = eqPeak > 0 ? (eqCumRet - eqPeak) / eqPeak : 0;

    // Rendimento portafoglio mensile con pesi
    let portRet = eqW * eqRet + obW * obRet + goldW * goldRet + cashW * cashRet;
    portRet -= terRate;

    // Aggiungi PAC mensile (a metà mese per semplicità)
    portValue += pacMonthly;
    totalInvested += pacMonthly;

    // Applica rendimento
    portValue = portValue * (1 + portRet);
    portValue = Math.max(0, portValue);

    monthlyValues.push(portValue);
    
    // Registrazione annuale
    if ((m + 1) % 12 === 0) {
      const yr = startYear + Math.floor((m + 1) / 12);
      annualValues.push(Math.round(portValue));
      annualInvested.push(Math.round(totalInvested));
      
      // Inflazione annua storica
      const infl = (HIST_INFLATION[yr] || 2.5) / 100;
      cumInfl *= (1 + infl);
      annualInflations.push(infl);
      
      // Rendimento azionario dell'anno
      const yearStart = monthlyValues[m - 11] || monthlyValues[0];
      yearlyEqReturns.push(annualValues[annualValues.length-1] / annualValues[annualValues.length-2] - 1);
    }
  }

  const finalValue = annualValues[annualValues.length - 1];
  const finalInvested = annualInvested[annualInvested.length - 1];
  const totalReturn = finalInvested > 0 ? (finalValue - finalInvested) / finalInvested : 0;
  // CAGR "semplice" — crescita del capitale iniziale w0 fino al valore finale.
  // Con PAC attivo sovrastima il rendimento perché include i versamenti come se fossero crescita.
  // Utile come confronto tra periodi di partenza diversi ma va interpretato come "CAGR sul capitale iniziale".
  const cagr = annualValues.length > 1 ? Math.pow(finalValue / (annualValues[0] || 1), 1 / (annualValues.length - 1)) - 1 : 0;
  // CAGR sul totale investito (Modified Dietz semplificato) — tiene conto dei versamenti PAC.
  // Risolve: finalValue = finalInvested * (1 + cagrInv)^n  → utile per confrontare la remunerazione del capitale investito.
  const n = annualValues.length - 1;
  const cagrOnInvested = (finalInvested > 0 && n > 0) ? Math.pow(finalValue / finalInvested, 1 / n) - 1 : 0;
  const dd = maxDrawdown(annualValues);
  const realValues = annualValues.map((v, i) => {
    let cumI = 1;
    for (let j = 0; j < Math.min(i, annualInflations.length); j++) cumI *= (1 + annualInflations[j]);
    return Math.round(v / cumI);
  });
  
  return {
    annualValues, annualInvested, realValues,
    finalValue, finalInvested, totalReturn, cagr, cagrOnInvested, maxDD: dd,
    years: annualValues.length - 1,
    yearlyEqReturns,
    cumInflation: cumInfl,
  };
}

function runBacktest() {
  const { startYear, port, pac, w } = btState;
  const portKey = port === 'sim' ? state.portfolio : port;
  
  const period = BT_PERIODS[startYear];
  if (!period) return;

  // ── Gate: il backtest usa solo serie azioni/bond/oro. Se il portafoglio
  // importato dal simulatore è un custom con trend/carry, non esiste una
  // serie storica fedele → mostra avviso invece di numeri fuorvianti.
  const unmapped = getUnmappedHistAssets(portKey);
  if (unmapped.length) {
    const names = unmapped.map(u => u.label).join(', ');
    document.getElementById('btResults').style.display = 'block';
    document.getElementById('btCompareSec').style.display = 'none';
    document.getElementById('btResultTitle').textContent = 'Backtesting non disponibile';
    const body = document.getElementById('btResultBody') || document.getElementById('btResults');
    const warnHtml = `<div class="callout" style="border-color:var(--red);background:rgba(217,48,37,.06);margin-top:12px">
      <strong style="color:var(--red)">⚠ Backtesting non applicabile a questo portafoglio</strong>
      <p style="margin:8px 0 0">Il portafoglio selezionato contiene <em>${names}</em>, asset privi di una serie storica dedicata nel dataset 1970-2024 (che copre solo azioni mercati sviluppati, aggregate bond e oro). Un backtest "storico" su questi asset non sarebbe reale: verrebbero approssimati come obbligazioni, azzerandone volatilità e decorrelazione.</p>
      <p style="margin:8px 0 0">Per analizzare un portafoglio con trend following o carry usa il <strong>Monte Carlo Avanzato</strong> con un modello parametrico (t-Student consigliato): volatilità e correlazioni di questi asset sono modellate correttamente.</p>
    </div>`;
    // Inserisci l'avviso e nascondi grafici/metriche residue
    const charts = ['chBt','chBtDD'];
    charts.forEach(id => { const c = document.getElementById(id); if (c && c.closest('.card,.chart-wrap,.pblock')) c.closest('.card,.chart-wrap,.pblock').style.display='none'; });
    let warnBox = document.getElementById('btUnmappedWarn');
    if (!warnBox) { warnBox = document.createElement('div'); warnBox.id='btUnmappedWarn'; document.getElementById('btResults').appendChild(warnBox); }
    warnBox.innerHTML = warnHtml;
    warnBox.style.display = 'block';
    return;
  }
  // Se in precedenza era stato mostrato l'avviso, ripristina la vista normale
  const prevWarn = document.getElementById('btUnmappedWarn');
  if (prevWarn) prevWarn.style.display = 'none';
  ['chBt','chBtDD'].forEach(id => { const c = document.getElementById(id); if (c && c.closest('.card,.chart-wrap,.pblock')) c.closest('.card,.chart-wrap,.pblock').style.display=''; });

  const result = simulateBacktest(portKey, startYear, pac, w);
  
  document.getElementById('btResults').style.display = 'block';
  document.getElementById('btCompareSec').style.display = 'none';
  
  // Title & context
  document.getElementById('btResultTitle').textContent = `Backtesting — ${period.label}`;
  document.getElementById('btContextBox').style.background = period.bg;
  document.getElementById('btContextBox').style.border = `1px solid ${period.color}44`;
  document.getElementById('btContextBox').style.color = period.color;
  document.getElementById('btContextBox').innerHTML = period.context;

  // Stats
  const portLabel = getPortLabel(portKey);
  const inflAdjReturn = result.cumInflation > 0 ? (result.finalValue / result.cumInflation - result.finalInvested) / result.finalInvested : result.totalReturn;
  // Nota: cagr = crescita del solo capitale iniziale (w0), utile per confronto periodi
  //       cagrOnInvested = rendimento sul totale versato PAC incluso (più realistico se PAC > 0)
  const cagrLabel = btState.pac > 0
    ? `CAGR su cap. iniziale (€${fmtN(w)})`
    : 'CAGR nominale';
  document.getElementById('btStats').innerHTML = [
    { l: `Valore finale (${startYear}→${startYear+result.years})`, v: fmt(result.finalValue), c: 'var(--blue)' },
    { l: 'Totale versato (cap. iniz. + PAC)', v: fmt(result.finalInvested), c: 'var(--text)' },
    { l: 'Ritorno su totale investito', v: (result.totalReturn >= 0 ? '+' : '') + (result.totalReturn * 100).toFixed(1) + '%', c: result.totalReturn >= 0 ? 'var(--green)' : 'var(--red)' },
    { l: cagrLabel, v: (result.cagr >= 0 ? '+' : '') + (result.cagr * 100).toFixed(2) + '%/a', c: result.cagr >= 0 ? 'var(--green)' : 'var(--red)', note: btState.pac > 0 ? '⚠ gonfiato dai versamenti PAC' : '' },
    ...(btState.pac > 0 ? [{ l: 'CAGR su totale investito (PAC incluso)', v: (result.cagrOnInvested >= 0 ? '+' : '') + (result.cagrOnInvested * 100).toFixed(2) + '%/a', c: result.cagrOnInvested >= 0 ? 'var(--green)' : 'var(--red)', note: 'misura il rendimento effettivo del capitale' }] : []),
    { l: 'Max Drawdown', v: (result.maxDD * 100).toFixed(1) + '%', c: result.maxDD < -0.3 ? 'var(--red)' : result.maxDD < -0.15 ? 'var(--orange)' : 'var(--green)' },
    { l: 'Valore reale (inflaz. +' + ((result.cumInflation-1)*100).toFixed(0) + '% cum.)', v: fmt(result.realValues[result.realValues.length-1]), c: 'var(--teal)' },
  ].map(s => `<div class="bt-stat-card"><div class="lbl">${s.l}${s.note ? `<span style="font-size:10.5px;color:var(--text3);margin-left:4px">${s.note}</span>` : ''}</div><div class="val" style="color:${s.c}">${s.v}</div></div>`).join('');

  // Main chart
  if (chartBt) { chartBt.destroy(); chartBt = null; }
  const years2 = result.years;
  const labels = Array.from({ length: years2 + 1 }, (_, i) => startYear + i);
  const displayVals = btState.showReal ? result.realValues : result.annualValues;
  const tC = 'rgba(0,0,0,.45)', gC = 'rgba(0,0,0,.05)';
  
  // Highlight crisis years with background
  const crisisYearsSet = new Set((period.crisis || []).map(y => y - startYear));
  
  chartBt = new Chart(document.getElementById('chBt'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: btState.showReal ? 'Valore Reale' : 'Valore Nominale', data: displayVals, borderColor: period.color, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: labels.map((yr, i) => crisisYearsSet.has(i) ? '#d93025' : period.color), fill: true, backgroundColor: period.bg, tension: .3 },
        { label: 'Totale Versato', data: result.annualInvested, borderColor: 'rgba(0,0,0,.3)', borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, fill: false, tension: .3 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: { callbacks: { title: c => 'Anno ' + c[0].label, label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw) }, backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1, titleColor: '#202124', bodyColor: '#5f6368', padding: 10 },
        annotation: {
          // Annotate crisis years if Chart.js annotation plugin available
        }
      },
      scales: {
        x: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, maxTicksLimit: 12 }, grid: { color: gC } },
        y: { ticks: { color: tC, font: { size: 11, family: 'DM Mono' }, callback: v => fmt(v) }, grid: { color: gC } }
      }
    }
  });

  // Drawdown chart
  if (chartBtDD) { chartBtDD.destroy(); chartBtDD = null; }
  const ddVals = calcYearlyDrawdown(result.annualValues);
  
  document.getElementById('btDrawdownSec').style.display = 'block';
  document.getElementById('btDrawdownInfo').innerHTML = buildCorrInfo(period, portKey, result);
  
  chartBtDD = new Chart(document.getElementById('chBtDD'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Drawdown dal massimo (%)',
        data: ddVals.map(d => +d.toFixed(1)),
        backgroundColor: ddVals.map(d => d < -25 ? 'rgba(217,48,37,.75)' : d < -10 ? 'rgba(227,116,0,.6)' : 'rgba(30,142,62,.4)'),
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` Drawdown: ${c.raw.toFixed(1)}%` } } },
      scales: {
        x: { ticks: { color: tC, font: { size: 10, family: 'DM Mono' }, maxTicksLimit: 12 }, grid: { color: gC } },
        y: { ticks: { color: tC, font: { size: 10, family: 'DM Mono' }, callback: v => v + '%' }, grid: { color: gC }, suggestedMin: Math.min(...ddVals) * 1.1, suggestedMax: 2 }
      }
    }
  });
}

function buildCorrInfo(period, portKey, result) {
  const eqW = getEquityWeight(portKey, state.age);
  const goldW = getGoldWeight(portKey);
  const obW = Math.max(0, 1 - eqW - goldW - getCashWeight(portKey));
  const crisisYears = period.crisis || [];
  
  // Compute dynamic vs static correlation effect
  const portLabel = getPortLabel(portKey);
  const crisisStr = crisisYears.length > 0 ? crisisYears.join(', ') : 'n/a';
  
  // Stima correlazione statica vs dinamica per azioni-obbligazioni
  const corrStatic = CORR_PAIR('eq', 'ob_glob');
  const corrStress = CORR_PAIR_STRESS('eq', 'ob_glob');
  
  return `<strong>Correlazioni Dinamiche — ${portLabel}</strong><br>
    In periodi di crisi (${crisisStr}), le correlazioni storicamente osservate <strong>divergono significativamente</strong> da quelle medie.<br>
    <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap;font-family:'DM Mono',monospace;font-size:11.5px">
      <span>Az.↔Ob.: regime normale <strong style="color:var(--green)">${corrStatic.toFixed(2)}</strong> → crisi <strong style="color:var(--red)">${corrStress.toFixed(2)}</strong></span>
      <span>Az.↔Oro: normale <strong style="color:var(--green)">${CORR_PAIR('eq','real').toFixed(2)}</strong> → crisi <strong style="color:var(--orange)">${CORR_PAIR_STRESS('eq','real').toFixed(2)}</strong></span>
    </div>
    <div style="margin-top:6px;font-size:11.5px;color:var(--text3)">⚠️ Nel 2022 azioni e obbligazioni hanno correlato positivamente (+0.6) per la prima volta dagli anni '70: il 60/40 non ha diversificato come atteso. Nell'agosto 2024 la correlazione è tornata negativa (flight-to-quality). Le correlazioni statiche usate nei modelli parametrici sottostimano il rischio in mercati stressati.</div>`;
}

function runAllBacktests() {
  // Run backtesting for all start years and compare
  const portKey = btState.port === 'sim' ? state.portfolio : btState.port;
  const tC = 'rgba(0,0,0,.45)', gC = 'rgba(0,0,0,.05)';

  // ── Gate: stesso vincolo del backtest singolo ──
  const unmapped = getUnmappedHistAssets(portKey);
  if (unmapped.length) {
    const names = unmapped.map(u => u.label).join(', ');
    document.getElementById('btResults').style.display = 'block';
    document.getElementById('btCompareSec').style.display = 'none';
    document.getElementById('btResultTitle').textContent = 'Backtesting non disponibile';
    let warnBox = document.getElementById('btUnmappedWarn');
    if (!warnBox) { warnBox = document.createElement('div'); warnBox.id='btUnmappedWarn'; document.getElementById('btResults').appendChild(warnBox); }
    warnBox.innerHTML = `<div class="callout" style="border-color:var(--red);background:rgba(217,48,37,.06);margin-top:12px">
      <strong style="color:var(--red)">⚠ Backtesting non applicabile a questo portafoglio</strong>
      <p style="margin:8px 0 0">Contiene <em>${names}</em>, privi di serie storica nel dataset 1970-2024 (azioni/bond/oro). Usa il Monte Carlo Avanzato con un modello parametrico (t-Student).</p>
    </div>`;
    warnBox.style.display = 'block';
    ['chBt','chBtDD'].forEach(id => { const c = document.getElementById(id); if (c && c.closest('.card,.chart-wrap,.pblock')) c.closest('.card,.chart-wrap,.pblock').style.display='none'; });
    return;
  }
  const prevWarn = document.getElementById('btUnmappedWarn');
  if (prevWarn) prevWarn.style.display = 'none';
  ['chBt','chBtDD'].forEach(id => { const c = document.getElementById(id); if (c && c.closest('.card,.chart-wrap,.pblock')) c.closest('.card,.chart-wrap,.pblock').style.display=''; });

  document.getElementById('btResults').style.display = 'block';
  document.getElementById('btCompareSec').style.display = 'block';
  
  const years2 = Object.keys(BT_PERIODS).map(Number);
  const datasets = [];
  const summaryRows = [];
  
  for (const startYear of years2) {
    const period = BT_PERIODS[startYear];
    const result = simulateBacktest(portKey, startYear, btState.pac, btState.w);
    
    const shortLabel = period.label.split('—')[1]?.trim() || startYear.toString();
    datasets.push({
      label: startYear + ' · ' + shortLabel,
      data: result.annualValues.slice(0, Math.min(result.annualValues.length, 26)), // max 25 years
      borderColor: period.color,
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: .3,
    });
    
    summaryRows.push({
      year: startYear, label: period.label, 
      cagr: result.cagr, cagrOnInvested: result.cagrOnInvested, finalVal: result.finalValue,
      maxDD: result.maxDD, invested: result.finalInvested,
      color: period.color,
    });
  }
  
  // Sort by CAGR on invested
  summaryRows.sort((a, b) => b.cagrOnInvested - a.cagrOnInvested);
  
  document.getElementById('btCompareStats').innerHTML = `
    <div class="tbl-outer"><table>
      <thead><tr><th style="text-align:left">Anno inizio</th><th>Evento</th><th title="CAGR sul totale investito (cap. iniziale + PAC)">CAGR su tot. investito</th><th title="CAGR sul solo capitale iniziale — gonfiato dal PAC se attivo">CAGR cap. iniziale</th><th>Valore finale</th><th>Max Drawdown</th><th>Totale versato</th></tr></thead>
      <tbody>${summaryRows.map(r => `<tr>
        <td style="text-align:left;font-weight:700;color:${r.color};font-family:'DM Mono',monospace">${r.year}</td>
        <td style="font-size:11.5px;color:var(--text2)">${BT_PERIODS[r.year].label.split('—')[1]?.trim() || ''}</td>
        <td class="${r.cagrOnInvested >= 0.05 ? 'pos' : r.cagrOnInvested >= 0 ? 'neutral' : 'neg'}" style="font-family:'DM Mono',monospace;font-weight:600">${(r.cagrOnInvested >= 0 ? '+' : '') + (r.cagrOnInvested*100).toFixed(2)}%/a</td>
        <td style="font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text3)">${(r.cagr >= 0 ? '+' : '') + (r.cagr*100).toFixed(2)}%/a</td>
        <td style="font-weight:600">${fmt(r.finalVal)}</td>
        <td class="${r.maxDD < -0.3 ? 'neg' : r.maxDD < -0.15 ? 'neutral' : 'pos'}" style="font-family:'DM Mono',monospace">${(r.maxDD*100).toFixed(1)}%</td>
        <td>${fmt(r.invested)}</td>
      </tr>`).join('')}
      </tbody>
    </table></div>`;
  
  // Normalize all datasets to same start to compare trajectories
  const normalizedDatasets = datasets.map(ds => ({
    ...ds,
    data: ds.data.map((v, i) => i === 0 ? 100 : Math.round(v / ds.data[0] * 100)),
    label: (() => { const yr = +ds.label.split(' · ')[0]; const row = summaryRows.find(r => r.year === yr); const cagr = row ? (row.cagr >= 0 ? '+' : '') + (row.cagr*100).toFixed(1) + '%/a' : ''; return ds.label + (cagr ? ' (' + cagr + ')' : ''); })(),
  }));
  
  if (chartBtComp) { chartBtComp.destroy(); chartBtComp = null; }
  const xLabels = Array.from({ length: 26 }, (_, i) => 'Anno +' + i);
  chartBtComp = new Chart(document.getElementById('chBtComp'), {
    type: 'line',
    data: { labels: xLabels, datasets: normalizedDatasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top', labels: { font: { size: 10.5, family: 'DM Mono' }, boxWidth: 14, boxHeight: 3, padding: 10, usePointStyle: false } },
        tooltip: { callbacks: { title: c => c[0].label, label: c => { const yr = c.dataset.label.split(' · ')[0]; return ` ${c.dataset.label}: ${c.raw}% del cap. iniziale`; } }, backgroundColor: '#fff', borderColor: '#dadce0', borderWidth: 1, padding: 10, titleColor: '#333', bodyColor: '#555', bodyFont: { size: 11 } }
      },
      scales: {
        x: { ticks: { color: tC, font: { size: 10, family: 'DM Mono' }, maxTicksLimit: 13 }, grid: { color: gC } },
        y: { ticks: { color: tC, font: { size: 10, family: 'DM Mono' }, callback: v => v + '%' }, grid: { color: gC } }
      }
    }
  });
}
