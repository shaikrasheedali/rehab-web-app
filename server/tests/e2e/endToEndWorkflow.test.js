import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

describe('Comprehensive End-to-End Clinical & Financial Workflow Tests', () => {
  let createdInquiryId;
  let createdAdmissionId;
  const createdAccommodationId = 'ROOM-E2E-101';

  beforeAll(async () => {
    // Ensure clean state
    await prisma.accommodation.deleteMany({ where: { id: createdAccommodationId } });
    await prisma.accommodation.create({
      data: {
        id: createdAccommodationId,
        label: 'E2E Deluxe Room (1st Floor)',
        type: 'Room'
      }
    });
  });

  afterAll(async () => {
    if (createdAdmissionId) {
      await prisma.residentProgress.deleteMany({ where: { admissionId: createdAdmissionId } });
      await prisma.billingProfile.deleteMany({ where: { admissionId: createdAdmissionId } });
      await prisma.payment.deleteMany({ where: { admissionId: createdAdmissionId } });
      await prisma.admission.deleteMany({ where: { id: createdAdmissionId } });
    }
    if (createdInquiryId) {
      await prisma.inquiry.deleteMany({ where: { id: createdInquiryId } });
    }
    await prisma.accommodation.deleteMany({ where: { id: createdAccommodationId } });
  });

  test('Step 1: Public Care Inquiry Submission', async () => {
    const inquiryPayload = {
      patient: 'Srinivas Varma',
      contact: 'Radha Varma',
      phone: '+91 98480 99887',
      need: 'Post-stroke left hemiparesis rehabilitation with intensive physical therapy',
      start: '2026-08-01',
      duration: '30 days',
      room: 'Private room',
      currentLocation: 'Hospital',
      language: 'Telugu',
      packageId: 'pkg-recovery',
      offPackageServiceIds: ['svc-neuro'],
      consent: true
    };

    const res = await request(app)
      .post('/api/inquiries')
      .send(inquiryPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^INQ-/);
    createdInquiryId = res.body.data.id;
  });

  test('Step 2: Admin Triages & Converts Inquiry to Official Inpatient Admission', async () => {
    const admissionPayload = {
      patient: 'Srinivas Varma',
      age: 64,
      gender: 'Male',
      contact: 'Radha Varma',
      phone: '+91 98480 99887',
      admissionDate: '2026-08-01',
      expectedDischarge: '2026-08-30',
      stayType: 'staying',
      accommodationId: createdAccommodationId,
      packageId: 'pkg-recovery',
      offPackageServiceIds: ['svc-neuro'],
      sourceInquiryId: createdInquiryId
    };

    const res = await request(app)
      .post('/api/admissions')
      .send(admissionPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^ADM-/);
    expect(res.body.data.status).toBe('Admitted');
    createdAdmissionId = res.body.data.id;

    // Verify room is now marked occupied
    const accCheck = await request(app).get('/api/accommodations');
    const room = accCheck.body.data.find(x => x.id === createdAccommodationId);
    expect(room.isOccupied).toBe(true);
    expect(room.occupant.patient).toBe('Srinivas Varma');
  });

  test('Step 3: Clinician logs Recovery Progress Milestone', async () => {
    const progressPayload = {
      admissionId: createdAdmissionId,
      date: '2026-08-10',
      title: 'Active Limb Movement Observed',
      note: 'Patient initiated left elbow flexion and weight bearing on parallel bars.',
      author: 'Senior Physiotherapist',
      category: 'Therapy & Mobility'
    };

    const res = await request(app)
      .post('/api/progress')
      .send(progressPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('Step 4: Billing Engine Calculates Live Statement with Add-ons & Custom Line', async () => {
    const billingUpdate = {
      billFrom: '2026-08-01',
      billTo: '2026-08-30',
      packageId: 'pkg-recovery',
      packageRate: 5000,
      addOns: [
        {
          serviceId: 'svc-neuro',
          name: 'Neuro Rehabilitation',
          rate: 1500,
          days: 15
        }
      ],
      customLines: [
        {
          id: 'custom-med-1',
          description: 'Prescription Neuro Medications',
          amount: 6000,
          type: 'fixed'
        }
      ],
      discountType: 'percentage',
      discountValue: 5,
      taxPercent: 5
    };

    const res = await request(app)
      .post(`/api/billing/admission/${createdAdmissionId}`)
      .send(billingUpdate);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const bill = res.body.data.bill;
    expect(bill.days).toBe(30);
    expect(bill.subtotal).toBe(178500); // (5000*30) + (1500*15) + 6000 = 150000 + 22500 + 6000 = 178500
    expect(bill.discountAmount).toBe(8925); // 5% of 178500
    expect(bill.total).toBeCloseTo(178053.75, 1);
    expect(bill.due).toBeCloseTo(178053.75, 1);
  });

  test('Step 5: Discharge Attempt is BLOCKED when Balance Due > 0', async () => {
    const dischargeAttempt = {
      actualDischarge: '2026-08-30',
      dischargeSummary: 'Patient rehabilitated successfully.'
    };

    const res = await request(app)
      .post(`/api/admissions/${createdAdmissionId}/discharge`)
      .send(dischargeAttempt);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot discharge');
  });

  test('Step 6: Payment Settlement Clears Balance Due', async () => {
    // Fetch bill to get exact total
    const billRes = await request(app).get(`/api/billing/admission/${createdAdmissionId}?through=2026-08-30`);
    const totalAmount = billRes.body.data.bill.total;

    const paymentRes = await request(app)
      .post('/api/payments')
      .send({
        admissionId: createdAdmissionId,
        amount: totalAmount,
        method: 'UPI / Bank Transfer',
        notes: 'Full final settlement'
      });

    expect(paymentRes.status).toBe(201);
    expect(paymentRes.body.success).toBe(true);

    // Verify balance due is now 0
    const checkRes = await request(app).get(`/api/billing/admission/${createdAdmissionId}?through=2026-08-30`);
    expect(checkRes.body.data.bill.due).toBeLessThanOrEqual(0.01);
  });

  test('Step 7: Discharge Succeeds, Archives Patient, and Frees up Room', async () => {
    const dischargePayload = {
      actualDischarge: '2026-08-30',
      dischargeSummary: 'Patient achieved independent walking with cane and graduated home.'
    };

    const res = await request(app)
      .post(`/api/admissions/${createdAdmissionId}/discharge`)
      .send(dischargePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Discharged');
    expect(res.body.data.finalBill).toBeDefined();

    // Verify Room is now Vacant
    const accCheck = await request(app).get('/api/accommodations');
    const room = accCheck.body.data.find(x => x.id === createdAccommodationId);
    expect(room.isOccupied).toBe(false);
  });
});
