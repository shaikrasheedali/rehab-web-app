import Decimal from 'decimal.js';
import { currentISODate, inclusiveDays, parseJsonSafe } from './dateUtils.js';

export const makeBillingProfile = (admission, through = currentISODate()) => {
  const offPackages = parseJsonSafe(admission?.offPackageServiceIds, []);
  const start = admission?.admissionDate || through;
  return {
    start,
    end: through,
    billFrom: start,
    billTo: through,
    packageId: admission?.packageId || '',
    packageName: '',
    packageRate: 0,
    packageDiscountType: 'percent',
    packageDiscount: 0,
    addOns: offPackages.map((serviceId, index) => ({
      id: `addon-${serviceId}-${index}`,
      serviceId,
      name: '',
      rate: 0,
      days: inclusiveDays(start, through),
      start,
      end: through,
      qty: 1,
      discountType: 'percent',
      discount: 0
    })),
    customLines: [],
    globalType: 'percent',
    globalDiscount: 0,
    discountType: 'percentage',
    discountValue: 0,
    tax: 0,
    taxPercent: 0
  };
};

export const normalizeBillingProfile = (admission, saved, through = currentISODate()) => {
  const base = makeBillingProfile(admission, through);
  const savedAddOns = parseJsonSafe(saved?.addOns, base.addOns);
  const savedCustomLines = parseJsonSafe(saved?.customLines, []);
  const start = saved?.start || saved?.billFrom || base.start;
  const end = saved?.end || saved?.billTo || through;

  return {
    ...base,
    ...(saved || {}),
    start,
    end,
    billFrom: start,
    billTo: end,
    packageId: saved?.packageId !== undefined ? saved.packageId : base.packageId,
    packageName: saved?.packageName || '',
    packageRate: saved?.packageRate !== undefined ? Number(saved.packageRate) : base.packageRate,
    packageDiscountType: saved?.packageDiscountType || 'percent',
    packageDiscount: Number(saved?.packageDiscount || 0),
    globalType: saved?.globalType || (saved?.discountType === 'fixed' ? 'fixed' : 'percent'),
    globalDiscount: Number(saved?.globalDiscount || saved?.discountValue || 0),
    discountType: saved?.discountType || (saved?.globalType === 'fixed' ? 'fixed' : 'percentage'),
    discountValue: Number(saved?.discountValue || saved?.globalDiscount || 0),
    tax: Number(saved?.tax || saved?.taxPercent || 0),
    taxPercent: Number(saved?.taxPercent || saved?.tax || 0),
    addOns: Array.isArray(savedAddOns) ? savedAddOns : base.addOns,
    customLines: Array.isArray(savedCustomLines) ? savedCustomLines : []
  };
};

export const advanceBillingProfile = (admission, saved, through = currentISODate()) => {
  const profile = normalizeBillingProfile(admission, saved, through);
  const previousEnd = profile.end;
  if (!previousEnd || previousEnd >= through) return profile;
  return {
    ...profile,
    end: through,
    billTo: through,
    addOns: (profile.addOns || []).map(line =>
      line.end === previousEnd ? { ...line, end: through } : line
    ),
    customLines: (profile.customLines || []).map(line =>
      line.pricingMode !== 'fixed' && line.end === previousEnd
        ? { ...line, end: through }
        : line
    )
  };
};

export const calculatePatientBill = (
  admission,
  profile,
  carePackages = [],
  catalogServices = [],
  amountPaid = 0
) => {
  const safe = value => Math.max(0, Number(value) || 0);
  const start = profile?.start || profile?.billFrom || admission?.admissionDate || currentISODate();
  const end = profile?.end || profile?.billTo || currentISODate();
  const days = Math.max(1, inclusiveDays(start, end));

  const discountFor = (gross, type, value) =>
    Decimal.min(
      gross,
      type === 'percent' || type === 'percentage'
        ? gross.times(safe(value)).dividedBy(100)
        : new Decimal(safe(value))
    );

  // Determine Package
  let pkg = carePackages.find(x => x.id === (profile?.packageId || ''));
  let packageRate = profile?.packageRate !== undefined && profile?.packageRate > 0
    ? profile.packageRate
    : (pkg?.rate || 0);
  let packageName = profile?.packageName || pkg?.name || 'No package';

  const packageGross = new Decimal(packageRate).times(days);
  const packageDisc = discountFor(
    packageGross,
    profile?.packageDiscountType || 'percent',
    profile?.packageDiscount || 0
  );
  const packageLine = {
    id: 'package',
    name: packageName,
    description: packageName,
    kind: 'Package',
    rate: packageRate,
    days,
    qty: 1,
    gross: packageGross.toNumber(),
    disc: packageDisc.toNumber(),
    net: packageGross.minus(packageDisc).toNumber(),
    total: packageGross.minus(packageDisc).toNumber(),
    serviceIds: parseJsonSafe(pkg?.serviceIds, [])
  };

  // Add-ons
  const addOnsList = parseJsonSafe(profile?.addOns, []);
  const addOnLines = addOnsList.map(line => {
    const service = catalogServices.find(x => x.id === line.serviceId);
    const serviceRate = line.rate !== undefined && line.rate > 0 ? line.rate : (service?.rate || 0);
    const serviceDays = line.days !== undefined
      ? Number(line.days)
      : inclusiveDays(line.start || start, line.end || end, start, end);
    const qty = safe(line.qty) || 1;
    const gross = new Decimal(serviceRate).times(serviceDays).times(qty);
    const disc = discountFor(gross, line.discountType, line.discount);
    const net = gross.minus(disc).toNumber();

    return {
      ...line,
      name: line.name || service?.name || 'Add-on service',
      description: line.name || service?.name || 'Add-on service',
      kind: 'Catalog add-on',
      rate: serviceRate,
      days: serviceDays,
      qty,
      gross: gross.toNumber(),
      disc: disc.toNumber(),
      net,
      total: net
    };
  });

  // Custom lines
  const customLinesList = parseJsonSafe(profile?.customLines, []);
  const customLines = customLinesList.map(line => {
    const isDaily = line.type === 'daily' || line.pricingMode === 'daily';
    const lineDays = isDaily
      ? (line.days !== undefined ? Number(line.days) : inclusiveDays(line.start || start, line.end || end, start, end))
      : 1;
    const rate = safe(line.amount || line.rate);
    const qty = safe(line.qty) || 1;
    const gross = new Decimal(rate).times(lineDays).times(qty);
    const disc = discountFor(gross, line.discountType, line.discount);
    const net = gross.minus(disc).toNumber();

    return {
      ...line,
      name: line.description || line.name || 'Custom item',
      description: line.description || line.name || 'Custom item',
      kind: isDaily ? 'Custom daily charge' : 'Custom fixed charge',
      rate,
      days: lineDays,
      qty,
      gross: gross.toNumber(),
      disc: disc.toNumber(),
      net,
      total: net
    };
  });

  const computed = [
    ...(pkg || packageRate > 0 ? [packageLine] : []),
    ...addOnLines,
    ...customLines
  ];

  const subtotal = computed.reduce(
    (sum, line) => sum.plus(line.net || line.total || 0),
    new Decimal(0)
  );

  const discountValue = profile?.discountValue || profile?.globalDiscount || 0;
  const discountType = profile?.discountType || profile?.globalType || 'percent';

  const globalDiscount = discountFor(subtotal, discountType, discountValue);
  const taxable = Decimal.max(0, subtotal.minus(globalDiscount));
  const taxRate = safe(profile?.taxPercent || profile?.tax || 0);
  const taxAmt = taxable.times(taxRate).dividedBy(100);
  const total = taxable.plus(taxAmt);
  const paid = new Decimal(safe(amountPaid));
  const due = Decimal.max(0, total.minus(paid));
  const credit = Decimal.max(0, paid.minus(total));

  const lines = computed.map(item => ({
    ...item,
    description: item.description || item.name,
    total: item.total || item.net
  }));

  return {
    start,
    end,
    billFrom: start,
    billTo: end,
    days,
    computed,
    lines,
    packageLine,
    addOnLines,
    customLines,
    subtotal: subtotal.toNumber(),
    gd: globalDiscount.toNumber(),
    discountAmount: globalDiscount.toNumber(),
    taxAmt: taxAmt.toNumber(),
    taxAmount: taxAmt.toNumber(),
    total: total.toNumber(),
    paid: paid.toNumber(),
    due: due.toNumber(),
    credit: credit.toNumber()
  };
};
