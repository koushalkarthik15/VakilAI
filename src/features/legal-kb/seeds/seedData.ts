import { ILegalDomain } from '../models/LegalDomain';
import { ILegalSource } from '../models/LegalSource';
import { ILegalRule } from '../models/LegalRule';

export const seedDomains: Partial<ILegalDomain>[] = [
  {
    domain_id: 'DOMAIN_RENTAL',
    name: 'Rental and Lease Agreements',
    description: 'Statutory rules governing residential and commercial leases.',
    status: 'ACTIVE'
  },
  {
    domain_id: 'DOMAIN_FREELANCE',
    name: 'Freelancer and Service Agreements',
    description: 'Statutory rules governing independent professional services and commercial contracts.',
    status: 'ACTIVE'
  }
];

const VERIFIED_DATE = new Date('2026-09-21T00:00:00.000Z');

export const seedSources: Partial<ILegalSource>[] = [
  {
    source_id: 'SRC_CENTRAL_CONTRACT_1872',
    title: 'The Indian Contract Act, 1872',
    authority: 'Parliament of India',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'CENTRAL',
    url: 'https://www.indiacode.nic.in/handle/123456789/2187',
    citation: 'Act No. 9 of 1872',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('1872-09-01T00:00:00.000Z')
  },
  {
    source_id: 'SRC_CENTRAL_TPA_1882',
    title: 'The Transfer of Property Act, 1882',
    authority: 'Parliament of India',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'CENTRAL',
    url: 'https://www.indiacode.nic.in/handle/123456789/2338',
    citation: 'Act No. 4 of 1882',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('1882-07-01T00:00:00.000Z')
  },
  {
    source_id: 'SRC_CENTRAL_MSMED_2006',
    title: 'The Micro, Small and Medium Enterprises Development Act, 2006',
    authority: 'Parliament of India',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'CENTRAL',
    url: 'https://www.indiacode.nic.in/handle/123456789/2013',
    citation: 'Act No. 27 of 2006',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('2006-10-02T00:00:00.000Z')
  },
  {
    source_id: 'SRC_TS_RENT_1960',
    title: 'The Telangana Buildings (Lease, Rent and Eviction) Control Act, 1960',
    authority: 'Telangana State Legislature',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'TELANGANA',
    citation: 'State Act 15 of 1960',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('1960-04-21T00:00:00.000Z')
  },
  {
    source_id: 'SRC_TS_REG_1908',
    title: 'The Registration Act, 1908 (Telangana State Amendments)',
    authority: 'Parliament of India / Telangana State Legislature',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'TELANGANA',
    url: 'https://www.indiacode.nic.in/handle/123456789/2190',
    citation: 'Act No. 16 of 1908',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('1909-01-01T00:00:00.000Z')
  },
  {
    source_id: 'SRC_TS_SHOPS_1988',
    title: 'The Telangana Shops and Establishments Act, 1988',
    authority: 'Telangana State Legislature',
    source_type: 'ACT',
    tier: 1,
    jurisdiction: 'TELANGANA',
    citation: 'State Act 20 of 1988',
    verification_status: 'VERIFIED',
    verified_at: VERIFIED_DATE,
    effective_from: new Date('1988-11-01T00:00:00.000Z')
  }
];

export const seedRules: Partial<ILegalRule>[] = [
  {
    rule_id: 'RULE_CONTRACT_VALIDITY',
    domain_id: 'DOMAIN_FREELANCE',
    title: 'Essential Elements of a Valid Contract',
    description: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not expressly declared to be void.',
    jurisdiction: 'CENTRAL',
    document_types: ['RENTAL_LEASE', 'FREELANCER_SERVICE'],
    source_ids: ['SRC_CENTRAL_CONTRACT_1872'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('1872-09-01T00:00:00.000Z')
  },
  {
    rule_id: 'RULE_LEASE_DEFINITION',
    domain_id: 'DOMAIN_RENTAL',
    title: 'Definition and Creation of Lease',
    description: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised.',
    jurisdiction: 'CENTRAL',
    document_types: ['RENTAL_LEASE'],
    source_ids: ['SRC_CENTRAL_TPA_1882'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('1882-07-01T00:00:00.000Z')
  },
  {
    rule_id: 'RULE_MSME_PAYMENT',
    domain_id: 'DOMAIN_FREELANCE',
    title: 'Liability of Buyer for Timely Payment',
    description: 'Where any supplier supplies any goods or renders any services to any buyer, the buyer shall make payment therefor on or before the date agreed upon between him and the supplier in writing, which shall in no case exceed forty-five days from the day of acceptance.',
    jurisdiction: 'CENTRAL',
    document_types: ['FREELANCER_SERVICE'],
    source_ids: ['SRC_CENTRAL_MSMED_2006'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('2006-10-02T00:00:00.000Z')
  },
  {
    rule_id: 'RULE_TS_RENT_EVICTION',
    domain_id: 'DOMAIN_RENTAL',
    title: 'Statutory Grounds for Tenant Eviction',
    description: 'A tenant shall not be evicted whether in execution of a decree or otherwise except in accordance with the statutory provisions, such as willful default in rent payment, subletting without consent, or using the building for a purpose other than that for which it was leased.',
    jurisdiction: 'TELANGANA',
    document_types: ['RENTAL_LEASE'],
    source_ids: ['SRC_TS_RENT_1960'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('1960-04-21T00:00:00.000Z')
  },
  {
    rule_id: 'RULE_TS_LEASE_REGISTRATION',
    domain_id: 'DOMAIN_RENTAL',
    title: 'Mandatory Registration of Leases',
    description: 'Leases of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, must be registered to be legally valid and admissible as evidence.',
    jurisdiction: 'TELANGANA',
    document_types: ['RENTAL_LEASE'],
    source_ids: ['SRC_TS_REG_1908'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('1909-01-01T00:00:00.000Z')
  },
  {
    rule_id: 'RULE_TS_COMMERCIAL_EST',
    domain_id: 'DOMAIN_FREELANCE',
    title: 'Registration of Commercial Establishments',
    description: 'Establishes the statutory requirement for the registration of commercial establishments. If a freelancer\'s operations legally qualify as an establishment under the Act, state registration is required.',
    jurisdiction: 'TELANGANA',
    document_types: ['FREELANCER_SERVICE'],
    source_ids: ['SRC_TS_SHOPS_1988'],
    status: 'ACTIVE',
    last_verified_at: VERIFIED_DATE,
    effective_from: new Date('1988-11-01T00:00:00.000Z')
  }
];
