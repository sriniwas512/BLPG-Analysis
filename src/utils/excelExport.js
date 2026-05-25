// Generates an Excel file replicating the AG - INDIA sheet structure.
// Blue cells receive user input values; all other cells use the original formulas.
import * as XLSX from 'xlsx';

const COMMISSION = 0.96025; // 1 - 3.975%

function cell(v, fmt) {
  const c = { v, t: typeof v === 'number' ? 'n' : 's' };
  if (fmt) c.z = fmt;
  return c;
}

function formula(f, fmt) {
  const c = { f, t: 'n' };
  if (fmt) c.z = fmt;
  return c;
}

const USD0 = '#,##0';
const USD2 = '#,##0.00';
const DEC2 = '0.00';
const PCT  = '0.0%';

export function exportToExcel(inputs, results) {
  const inp = inputs;

  // Port charges from inputs
  const pc = {
    dahej: inp.portDahej ?? 191000,
    nmg:   inp.portNMG   ?? 70000,
    viz:   inp.portViz   ?? 114000,
    hald:  inp.portHald  ?? 94000,
    haldSTS: inp.portHaldSTS ?? 60000,
    mum:   inp.portMumbai ?? 165000,
    krish: inp.portKrishnapatnam ?? 140000,
  };

  const ws = {};
  const range = { s: { r: 0, c: 0 }, e: { r: 71, c: 25 } };

  // ── Header rows ──────────────────────────────────────────────────────────
  ws['B1'] = cell('Ras Tanura');
  ws['D1'] = cell('MAA');
  ws['G1'] = cell('Ruwais');
  ws['I1'] = cell('Ruwais');
  ws['K1'] = cell('MAA');
  ws['M1'] = cell('Ruwais');
  ws['O1'] = cell('Ruwais');
  ws['Q1'] = cell('Ruwais');
  ws['S1'] = cell('Ruwais');
  ws['U1'] = cell('Ruwais');
  ws['W1'] = cell('Ruwais');

  ws['B2'] = cell('Chiba');
  ws['D2'] = cell('Ningbo + Caojing');
  ws['G2'] = cell('NMG + Haldia');
  ws['I2'] = cell('NMG + Mumbai');
  ws['K2'] = cell('Vizag + Haldia');
  ws['M2'] = cell('STS Haldia + Haldia');
  ws['O2'] = cell('New Mangalore');
  ws['Q2'] = cell('NMG + Dahej');
  ws['S2'] = cell('NMG + Krishnapatnam');
  ws['U2'] = cell('NMG + Vizag + Haldia');
  ws['W2'] = cell('Haldia STS + Haldia');

  // ── Port charge reference (Y/Z column) ───────────────────────────────────
  ws['Y3']  = cell('Dahej');      ws['Z3']  = cell(pc.dahej, USD0);
  ws['Y4']  = cell('NMG');        ws['Z4']  = cell(pc.nmg,   USD0);
  ws['Y5']  = cell('Enn');        ws['Z5']  = cell(120000,   USD0);
  ws['Y6']  = cell('Viz');        ws['Z6']  = cell(pc.viz,   USD0);
  ws['Y7']  = cell('Hald');       ws['Z7']  = cell(pc.hald,  USD0);
  ws['Y8']  = cell('Hald STS');   ws['Z8']  = cell(pc.haldSTS, USD0);
  ws['Y9']  = cell('Mumbai');     ws['Z9']  = cell(pc.mum,   USD0);
  ws['Y10'] = cell('Krishnapatnam'); ws['Z10'] = cell(pc.krish, USD0);

  // ── Row labels ────────────────────────────────────────────────────────────
  const labels = {
    A3: 'FRT RATE', A4: 'INTANK(MT)', A5: 'T/C RATE GROSS', A6: 'RATE/DAY GROSS',
    A7: 'LOAD PORT', A8: 'DISPORT', A9: 'IFO PRICE', A10: 'MDO PRICE',
    A11: 'MILE:BALLAST', A12: 'MILE:LADEN', A13: 'LOAD P.CHG', A14: 'DIS P.CHG',
    A15: 'PANAMA CANAL TOLL', A16: 'AWRIP', A17: 'GUARDS', A18: 'OTHER COST',
    A19: 'TIME COST', A20: 'BUNKER COST', A21: 'PORT CHG', A22: 'TOTAL COST',
    A24: 'SPD BLST', A25: 'SPD LADN', A26: 'BLST IFO', A27: 'LADN IFO',
    A28: 'PORT IFO', A29: 'IDLE IFO', A30: 'SEA MDO', A31: 'PORT MDO',
    A32: 'IDLE MDO', A33: 'DAYS:BLST', A34: 'DAYS:LADN', A35: 'VOYAGE DAYS',
    A36: 'NOR PLUS 6', A37: 'DAYS:LOADING', A38: 'DAYS:DISCH', A39: 'DAYS:BUN',
    A40: 'PANAMA CANAL PASS', A41: 'IDLE', A42: 'SEA MARGIN', A43: 'TOTAL DAYS',
    A44: 'BUNKER IFO', A45: 'BUNKER MDO',
    A47: 'TCE', A48: 'TCE + BUNKERS',
    F48: 'TCE', F49: 'TCE+Bunk',
  };
  Object.entries(labels).forEach(([addr, v]) => { ws[addr] = cell(v); });

  // ── Column B – blue inputs ────────────────────────────────────────────────
  ws['B3']  = cell(inp.frtRate,       USD2);
  ws['B4']  = cell(inp.intankMT,      USD0);
  ws['B5']  = formula('B6*30.4166666666', USD2);
  ws['B6']  = formula('B19/B43',          USD2);
  ws['B7']  = cell(1);
  ws['B8']  = cell(1);
  ws['B9']  = cell(inp.ifoPrice,      USD2);
  ws['B10'] = cell(inp.mdoPrice,      USD2);
  ws['B11'] = cell(inp.milesBallastB, DEC2);
  ws['B12'] = cell(inp.milesLadenB,   DEC2);
  ws['B13'] = cell(inp.loadPChgB,     USD0);
  ws['B14'] = cell(inp.disPChgB,      USD0);
  ws['B15'] = cell(0);
  ws['B16'] = cell(inp.awripB,        USD0);
  ws['B17'] = cell(0);
  ws['B18'] = cell(0);
  ws['B19'] = formula('B22-B21-B20',  USD0);
  ws['B20'] = formula('B44*B9+B45*B10', USD0);
  ws['B21'] = formula('B13+B14+B15+B16+B17+B18', USD0);
  ws['B22'] = formula('B3*B4',        USD0);
  ws['B24'] = cell(inp.spdBlst,       DEC2);
  ws['B25'] = cell(inp.spdLadn,       DEC2);
  ws['B26'] = cell(inp.blstIFO,       DEC2);
  ws['B27'] = cell(inp.ladnIFO,       DEC2);
  ws['B28'] = cell(inp.portIFO,       DEC2);
  ws['B29'] = cell(0);
  ws['B30'] = cell(inp.seaMDO,        DEC2);
  ws['B31'] = cell(inp.portMDO,       DEC2);
  ws['B32'] = cell(inp.idleMDO,       DEC2);
  ws['B33'] = formula('((B11*(1+B42))/B24/24)*1.05', DEC2);
  ws['B34'] = formula('((B12*(1+B42))/B25/24)*1.05', DEC2);
  ws['B35'] = formula('B33+B34',      DEC2);
  ws['B36'] = cell(inp.norPlus6B,     DEC2);
  ws['B37'] = cell(inp.daysLoadingB);
  ws['B38'] = cell(inp.daysDischB);
  ws['B39'] = cell(inp.daysBunB,      DEC2);
  ws['B40'] = cell(0);
  ws['B41'] = cell(0);
  ws['B42'] = cell(inp.seaMargin,     PCT);
  ws['B43'] = formula('B35+B36+B37+B38+B39+B40+B41', DEC2);
  ws['B44'] = formula('B26*B33+B27*B34+(B36+B37+B38+B39+B40+B41)*B28', DEC2);
  ws['B45'] = formula('B30*B35+B31*(B36+B37+B38+B39+B40+B41)',           DEC2);
  ws['B47'] = formula('B6', USD2);
  ws['B48'] = formula('B6+B28*B9', USD2);

  // ── Column D ──────────────────────────────────────────────────────────────
  ws['D3']  = formula('ROUND(D22/D4,2)',  USD2);
  ws['D4']  = cell(inp.intankMT,          USD0);
  ws['D5']  = formula('B5',              USD2);
  ws['D6']  = formula('B6',              USD2);
  ws['D7']  = cell(1);
  ws['D8']  = cell(3);
  ws['D9']  = formula('B9',              USD2);
  ws['D10'] = formula('B10',             USD2);
  ws['D11'] = cell(inp.milesBallastD,    DEC2);
  ws['D12'] = cell(inp.milesLadenD,      DEC2);
  ws['D13'] = cell(inp.loadPChgD,        USD0);
  ws['D14'] = cell(inp.disPChgD,         USD0);
  ws['D15'] = cell(0);
  ws['D19'] = formula('ROUND(D6*D43,2)', USD0);
  ws['D20'] = formula('D44*D9+D45*D10',  USD0);
  ws['D21'] = formula('D13+D14+D15',     USD0);
  ws['D22'] = formula('D19+D20+D21',     USD0);
  ws['D24'] = cell(inp.spdBlst,          DEC2);
  ws['D25'] = cell(inp.spdLadn,          DEC2);
  ws['D26'] = formula('B26',             DEC2);
  ws['D27'] = formula('B27',             DEC2);
  ws['D28'] = formula('B28',             DEC2);
  ws['D29'] = formula('B29');
  ws['D30'] = cell(0.1,                  DEC2);
  ws['D31'] = formula('B31',             DEC2);
  ws['D32'] = formula('B32',             DEC2);
  ws['D33'] = formula('((D11*(1+D42))/D24/24)', DEC2);
  ws['D34'] = formula('((D12*(1+D42))/D25/24)', DEC2);
  ws['D35'] = formula('D33+D34',         DEC2);
  ws['D36'] = cell(0.5);
  ws['D37'] = cell(2);
  ws['D38'] = cell(inp.daysDischD,       DEC2);
  ws['D39'] = cell(0.5);
  ws['D40'] = cell(0);
  ws['D41'] = cell(0);
  ws['D42'] = formula('B42',             PCT);
  ws['D43'] = formula('D35+D36+D37+D38+D39+D40+D41', DEC2);
  ws['D44'] = formula('D26*D33+D27*D34+(D36+D37+D38+D39+D40+D41)*D28', DEC2);
  ws['D45'] = formula('D30*D35+D31*(D36+D37+D38+D39+D40+D41)',           DEC2);

  // ── India route fixed data ─────────────────────────────────────────────────
  const indiaFixedData = {
    G: { mb: 3282, ml: 3328, lpc: 32000, disPChgFormula: 'Z4+Z7',    awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'G31' },
    I: { mb: 1362, ml: 2031, lpc: 32000, disPChgFormula: 'Z9+Z4',    awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'I31' },
    K: { mb: 3487, ml: 3580, lpc: 12000, disPChgFormula: 'Z6+Z7',    awrip: 40000, np6: 0.75, dl: 2, dd: 11, seaFactor: '1.05', mdo_cell: 'K32' },
    M: { mb: 3282, ml: 3283, lpc: 32000, disPChgFormula: 'Z7+Z8',    awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'M32' },
    O: { mb: 1612, ml: 1620, lpc: 32000, disPChgFormula: 'Z4',       awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'O32' },
    Q: { mb: 1306, ml: 2221, lpc: 32000, disPChgFormula: 'Z3+Z4',    awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'Q32' },
    S: { mb: 2764, ml: 2809, lpc: 32000, disPChgFormula: 'Z4+Z10',   awrip: 40000, np6: 0.75, dl: 2, dd: 10, seaFactor: '1.05', mdo_cell: 'S32' },
    U: { mb: 3486, ml: 3633, lpc: 40000, disPChgFormula: 'Z4+Z6+Z7', awrip: 40000, np6: 1,    dl: 2, dd: 13, seaFactor: '',     mdo_cell: 'U32' },
    W: { mb: 3486, ml: 3499, lpc: 40000, disPChgFormula: 'Z7+60000', awrip: 40000, np6: 1,    dl: 2, dd: 13, seaFactor: '',     mdo_cell: 'W32' },
  };

  const indiaRefSpeeds = {
    G: 'B24', I: 'B24', K: 'B24', M: 'B24', O: 'D24', Q: 'D24', S: 'D24', U: 'B24', W: 'D24',
  };
  const indiaRefSpeedsL = {
    G: 'B25', I: 'B25', K: 'B25', M: 'B25', O: 'D25', Q: 'D25', S: 'D25', U: 'B25', W: 'D25',
  };
  const indiaRefIFO9 = {
    G: 'B9', I: 'B9', K: 'B9', M: 'B9', O: 'D9', Q: 'F9', S: 'H9', U: 'B9', W: 'D9',
  };
  const indiaRefIFO10 = {
    G: 'B10', I: 'B10', K: 'B10', M: 'B10', O: 'D10', Q: 'F10', S: 'H10', U: 'B10', W: 'D10',
  };
  const indiaRefIFO26 = {
    G: 'B26', I: 'B26', K: 'B26', M: 'B26', O: 'D26', Q: 'D26', S: 'D26', U: 'B26', W: 'D26',
  };
  const indiaRefIFO27 = {
    G: 'B27', I: 'B27', K: 'B27', M: 'B27', O: 'D27', Q: 'D27', S: 'D27', U: 'B27', W: 'D27',
  };
  const indiaRefIFO28 = {
    G: 'B28', I: 'B28', K: 'B28', M: 'B28', O: 'D28', Q: 'D28', S: 'D28', U: 'B28', W: 'D28',
  };
  const indiaRefIFO29 = {
    G: 'B29', I: 'B29', K: 'B29', M: 'B29', O: 'D29', Q: 'F29', S: 'H29', U: 'B29', W: 'D29',
  };
  const indiaRefMDO30 = {
    G: 'B30', I: 'B30', K: 'B30', M: 'B30', O: 'D30', Q: 'D30', S: 'D30', U: 'B30', W: 'D30',
  };
  const indiaRefMDO31 = {
    G: 'B31', I: 'B31', K: 'B31', M: 'B31', O: 'D31', Q: 'D31', S: 'D31', U: 'B31', W: 'D31',
  };
  const indiaRefMDO32 = {
    G: 'B32', I: 'B32', K: 'B32', M: 'B32', O: 'D32', Q: 'D32', S: 'D32', U: 'B32', W: 'D32',
  };
  const indiaRefSM = {
    G: 'B42', I: 'D42', K: 'B42', M: 'D42', O: 'D42', Q: 'D42', S: 'D42', U: 'B42', W: 'D42',
  };

  Object.entries(indiaFixedData).forEach(([col, d]) => {
    const r = (row) => `${col}${row}`;

    ws[r(3)]  = formula(`((${col}48*${col}43)+(${col}15+${col}16+${col}17+${col}19+${col}20+${col}21))/${COMMISSION}`, USD2);
    ws[r(4)]  = cell(45000, USD0);
    ws[r(7)]  = cell(1);
    ws[r(8)]  = cell(col === 'U' || col === 'W' ? 3 : 2);
    ws[r(9)]  = formula(indiaRefIFO9[col], USD2);
    ws[r(10)] = formula(indiaRefIFO10[col], USD2);
    ws[r(11)] = cell(d.mb, DEC2);
    ws[r(12)] = cell(d.ml, DEC2);
    ws[r(13)] = cell(d.lpc, USD0);
    ws[r(14)] = formula(`=${d.disPChgFormula}`.replace('=', ''), USD0);
    ws[r(15)] = cell(0);
    ws[r(16)] = cell(d.awrip, USD0);
    ws[r(17)] = cell(0);
    ws[r(18)] = formula(`(${r(3)}*3.975%)`, USD0);
    ws[r(19)] = cell(0);
    ws[r(20)] = formula(`(${r(44)}*${r(9)})+(${r(45)}*${r(10)})`, USD0);
    ws[r(21)] = formula(`${r(14)}+${r(13)}`, USD0);
    ws[r(22)] = formula(`${r(15)}+${r(16)}+${r(17)}+${r(18)}+${r(19)}+${r(20)}+${r(21)}`, USD0);
    ws[r(24)] = formula(indiaRefSpeeds[col], DEC2);
    ws[r(25)] = formula(indiaRefSpeedsL[col], DEC2);
    ws[r(26)] = formula(indiaRefIFO26[col], DEC2);
    ws[r(27)] = formula(indiaRefIFO27[col], DEC2);
    ws[r(28)] = formula(indiaRefIFO28[col], DEC2);
    ws[r(29)] = formula(indiaRefIFO29[col]);
    ws[r(30)] = formula(indiaRefMDO30[col], DEC2);
    ws[r(31)] = formula(indiaRefMDO31[col], DEC2);
    ws[r(32)] = formula(indiaRefMDO32[col], DEC2);
    const sf = d.seaFactor;
    ws[r(33)] = formula(`${r(11)}/(${r(24)}*24)${sf ? '*' + sf : ''}`, DEC2);
    ws[r(34)] = formula(`${r(12)}/(${r(25)}*24)${sf ? '*' + sf : ''}`, DEC2);
    ws[r(35)] = formula(`(${r(33)}+${r(34)})`, DEC2);
    ws[r(36)] = cell(d.np6);
    ws[r(37)] = cell(d.dl);
    ws[r(38)] = cell(d.dd);
    ws[r(39)] = cell(0);
    ws[r(40)] = cell(0);
    ws[r(41)] = cell(0);
    ws[r(42)] = formula(indiaRefSM[col], PCT);
    ws[r(43)] = formula(`(${r(35)}+${r(36)}+${r(37)}+${r(38)}+${r(39)}+${r(40)}+${r(41)})`, DEC2);
    ws[r(44)] = formula(`(${r(35)}*${r(27)})+((${r(36)}+${r(37)}+${r(38)}+${r(39)}+${r(40)}+${r(41)})*${r(28)})`, DEC2);
    ws[r(45)] = formula(`SUM(${r(33)}:${r(41)})*${d.mdo_cell}`, DEC2);
    ws[r(48)] = formula('$B$6', USD2);
    if (col === 'G') {
      ws['G49'] = formula('G48+(G28*G9)', USD2);
    }
  });

  ws['!ref'] = XLSX.utils.encode_range(range);

  // Column widths
  ws['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 },
    { wch: 14 }, { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 },
    { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 },
    { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 2 },
    { wch: 12 }, { wch: 2 }, { wch: 12 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AG - INDIA');

  XLSX.writeFile(wb, 'AG_INDIA_Analysis.xlsx');
}
