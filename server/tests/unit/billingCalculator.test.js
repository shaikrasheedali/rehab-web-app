import {
  makeBillingProfile,
  normalizeBillingProfile,
  advanceBillingProfile,
  calculatePatientBill
} from '../../src/utils/billingCalculator.js';

describe('billingCalculator Unit Tests', () => {
  const mockAdmission = {
    id: 'ADM-TEST-1',
    patient: 'Test Patient',
    admissionDate: '2026-08-01',
    packageId: 'pkg-recovery',
    offPackageServiceIds: JSON.stringify(['svc-neuro'])
  };

  const mockPackages = [
    {
      id: 'pkg-recovery',
      name: 'Supported Recovery',
      rate: 4750,
      serviceIds: JSON.stringify(['svc-nursing', 'svc-room', 'svc-basic-physio'])
    }
  ];

  const mockServices = [
    { id: 'svc-nursing', name: '24/7 skilled nursing', rate: 2800 },
    { id: 'svc-room', name: 'Assisted living suite', rate: 1900 },
    { id: 'svc-basic-physio', name: 'Daily mobility physiotherapy', rate: 900 },
    { id: 'svc-neuro', name: 'Intensive neuro physiotherapy', rate: 1500 }
  ];

  test('makeBillingProfile creates proper baseline object', () => {
    const profile = makeBillingProfile(mockAdmission, '2026-08-30');
    expect(profile.start).toBe('2026-08-01');
    expect(profile.end).toBe('2026-08-30');
    expect(profile.packageId).toBe('pkg-recovery');
    expect(profile.addOns.length).toBe(1);
    expect(profile.addOns[0].serviceId).toBe('svc-neuro');
  });

  test('advanceBillingProfile extends dates forward properly', () => {
    const initial = makeBillingProfile(mockAdmission, '2026-08-15');
    const advanced = advanceBillingProfile(mockAdmission, initial, '2026-08-30');
    expect(advanced.end).toBe('2026-08-30');
    expect(advanced.addOns[0].end).toBe('2026-08-30');
  });

  test('calculatePatientBill calculates 30-day stay with package, add-ons, and payment', () => {
    const profile = {
      start: '2026-08-01',
      end: '2026-08-30',
      packageId: 'pkg-recovery',
      packageDiscountType: 'percent',
      packageDiscount: 0,
      addOns: [
        {
          id: 'addon-svc-neuro-0',
          serviceId: 'svc-neuro',
          start: '2026-08-01',
          end: '2026-08-30',
          qty: 1,
          discountType: 'percent',
          discount: 0
        }
      ],
      customLines: [],
      globalType: 'percent',
      globalDiscount: 0,
      tax: 0
    };

    // 30 days of pkg-recovery (4750/day = 142500)
    // 30 days of svc-neuro (1500/day = 45000)
    // Total = 187,500
    // Paid = 45,000
    // Due = 142,500
    const bill = calculatePatientBill(mockAdmission, profile, mockPackages, mockServices, 45000);
    expect(bill.days).toBe(30);
    expect(bill.subtotal).toBe(187500);
    expect(bill.total).toBe(187500);
    expect(bill.paid).toBe(45000);
    expect(bill.due).toBe(142500);
    expect(bill.credit).toBe(0);
  });

  test('calculatePatientBill applies discounts and custom items accurately', () => {
    const profile = {
      start: '2026-08-01',
      end: '2026-08-10', // 10 days
      packageId: 'pkg-recovery', // 4750 * 10 = 47500
      packageDiscountType: 'percent',
      packageDiscount: 10, // 10% disc = 4750 => Net pkg = 42750
      addOns: [],
      customLines: [
        {
          id: 'custom-1',
          name: 'Specialist consultation',
          pricingMode: 'fixed',
          rate: 3000,
          qty: 1,
          discountType: 'fixed',
          discount: 500 // Net = 2500
        }
      ],
      globalType: 'fixed',
      globalDiscount: 250, // subtotal = 42750 + 2500 = 45250, minus 250 = 45000
      tax: 5 // 5% of 45000 = 2250 => Total = 47250
    };

    const bill = calculatePatientBill(mockAdmission, profile, mockPackages, mockServices, 50000);
    expect(bill.subtotal).toBe(45250);
    expect(bill.gd).toBe(250);
    expect(bill.taxAmt).toBe(2250);
    expect(bill.total).toBe(47250);
    expect(bill.paid).toBe(50000);
    expect(bill.due).toBe(0);
    expect(bill.credit).toBe(2750);
  });
});
