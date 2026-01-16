
import { Candidate, Village, VillageStatus } from './types';

export const CANDIDATES: Candidate[] = [
  { id: 1, number: 1, name: 'นายไพบูลย์ แน่นอุดร', party: 'คณะเหนือเมืองก้าวหน้า', color: '#be123c', photoUrl: 'https://ui-avatars.com/api/?name=P+N&background=be123c&color=fff&size=128' },
  { id: 2, number: 2, name: 'นายรณวริทธิ์ ปริยฉัตรตระกูล', party: 'กลุ่มอิสระพัฒนา', color: '#1d4ed8', photoUrl: 'https://ui-avatars.com/api/?name=R+P&background=1d4ed8&color=fff&size=128' },
  { id: 3, number: 3, name: 'นายจำรัส บุญกาพิมพ์', party: 'รักษ์ถิ่นเหนือเมือง', color: '#b45309', photoUrl: 'https://ui-avatars.com/api/?name=J+B&background=b45309&color=fff&size=128' },
  { id: 4, number: 4, name: 'นายวิกร ปริยฉัตรตระกูล', party: 'อาสาพัฒนาท้องถิ่น', color: '#047857', photoUrl: 'https://ui-avatars.com/api/?name=V+P&background=047857&color=fff&size=128' },
];

const createMember = (id: number, number: number, name: string): Candidate => ({
  id,
  number,
  name,
  party: 'อิสระ',
  color: ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1', '#ec4899'][number - 1] || '#94a3b8',
  photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(' ')[0])}&background=random&color=fff&size=128`
});

export const MEMBER_CANDIDATES: Record<number, Candidate[]> = {
  1: [
    createMember(101, 1, 'นางสาวจิราวรรณ รัตนโกเศศ'),
    createMember(102, 2, 'นายคมกฤช แย้มโกสุมภ์'),
    createMember(103, 3, 'นางดอกรัก วงษ์ศร')
  ],
  2: [
    createMember(201, 1, 'นางสาวตรีรัตน์ คลังสำโรง'),
    createMember(202, 2, 'นางสาวภัทราวฎี ทองสุข'),
    createMember(203, 3, 'ร้อยตรีสุขะ เพ็งพิพาทย์')
  ],
  3: [
    createMember(301, 1, 'นางสุดารัตน์ เถระวัลย์'),
    createMember(302, 2, 'นางสาวกมลมาศ มีสวัสดิ์'),
    createMember(303, 3, 'นางสาววนิดา สาระชร')
  ],
  4: [
    createMember(401, 1, 'นายจักรภัทร ปิ่นกา')
  ],
  5: [
    createMember(501, 1, 'นางตวงพร มาเจริญ'),
    createMember(502, 2, 'นางสาวดรุณี บัวพัฒน์'),
    createMember(503, 3, 'นางอรทัย อารีเอื้อ')
  ],
  6: [
    createMember(601, 1, 'นายสมศักดิ์ มะลาใส'),
    createMember(602, 2, 'นางสาวธนิดา ธีราภักดิ์'),
    createMember(603, 3, 'นางสาวศุภรดา ชมภูพาชน์'),
    createMember(604, 4, 'นายชาตรี ศรีดาคุณ')
  ],
  7: [
    createMember(701, 1, 'นายกิตติพงศ์ ป้องนานาค'),
    createMember(702, 2, 'นางสาวรวิวรรณ สุคุณา'),
    createMember(703, 3, 'นางหนูพัฒน์ คำบุดดี')
  ],
  8: [
    createMember(801, 1, 'นายสังคม นิลพันธ์'),
    createMember(802, 2, 'นายกฤษณ์ ชัยชาญธรรม'),
    createMember(803, 3, 'นายจักรวาล ชมภูวิเศษ')
  ],
  9: [
    createMember(901, 1, 'นางสาวอุทุมพร ปัตถาวะเร')
  ],
  10: [
    createMember(1001, 1, 'นายบุญทิพย์ บุดรัตน์'),
    createMember(1002, 2, 'นางภาวัลย์ เอกทัศน์'),
    createMember(1003, 3, 'นายวีระ ชมภูบุตร')
  ],
  11: [
    createMember(1101, 1, 'นายอนันตชัย ไซเล็กทิม'),
    createMember(1102, 2, 'นางสาวจันทร์เพ็ญ จรูญเพ็ญ'),
    createMember(1103, 3, 'จริญญา ศรีธัญรัตน์'),
    createMember(1104, 4, 'ร้อยโทสมร ภูชำนิ')
  ],
  12: [
    createMember(1201, 1, 'นางสาวนุชจรี โชติช่วง'),
    createMember(1202, 2, 'นายบุญธรรม ลาวัลย์'),
    createMember(1203, 3, 'นายสำเริง คงโสภา')
  ],
  13: [
    createMember(1301, 1, 'จ่าสิบเอกดาวเทียม จำเริญพัฒน์'),
    createMember(1302, 2, 'นายศราวุทธ ณะวงค์'),
    createMember(1303, 3, 'นายกิตติพงษ์ จงมีเดช')
  ],
  14: [
    createMember(1401, 1, 'นายภูวะศักดิ์ วิชัยภูมิ'),
    createMember(1402, 2, 'นายวชิระ สรภูมิ'),
    createMember(1403, 3, 'นายสมคิด เกตุคำ')
  ],
  15: [
    createMember(1501, 1, 'นางอินทิรา คาดพันโน'),
    createMember(1502, 2, 'นางสุมาลี แซ่โง้ว')
  ],
  16: [
    createMember(1601, 1, 'นายวิรัตน์ เพชรกรรม'),
    createMember(1602, 2, 'นางขวัญจิรา สิงห์ธวัช'),
    createMember(1603, 3, 'นายช่วง บุญมี')
  ],
  17: [
    createMember(1701, 1, 'นางสมหมาย ไซเล็กทิม'),
    createMember(1702, 2, 'นางจิตชนานันท์ อริยพัฒนพร')
  ],
  18: [
    createMember(1801, 1, 'นางสาวชญานุช ดวงดี'),
    createMember(1802, 2, 'นายจงกล สิงห์ธวัช')
  ],
  19: [
    createMember(1901, 1, 'นางสาวพัชรพร พูลลาภ'),
    createMember(1902, 2, 'นางณฤดี นนสุภาพ'),
    createMember(1903, 3, 'นายวิรัช สาศิริ')
  ],
  20: [
    createMember(2001, 1, 'นายวิเชียร ไชยคิรินทร์'),
    createMember(2002, 2, 'ร.ต.อ.คำอ้าย ศรีปัดถา'),
    createMember(2003, 3, 'นายธีระศักดิ์ อามาตมนตรี')
  ],
  21: [
    createMember(2101, 1, 'นางน้อย นิละพันธ์'),
    createMember(2102, 2, 'นางสาวกาญจนา เวียงนนท์'),
    createMember(2103, 3, 'นางสุณีรัตน์ งามผิวเหลือง')
  ],
  22: [
    createMember(2201, 1, 'นางภคนันท์ นีละพันธ์'),
    createMember(2202, 2, 'นายชัชวาลย์ เชิดพานิชย์'),
    createMember(2203, 3, 'นางจินต์ศุจี จันทะมูล')
  ],
  23: [
    createMember(2301, 1, 'นายวิจิตร บรรลือ'),
    createMember(2302, 2, 'นางสาวพิสมร พิมพิลา'),
    createMember(2303, 3, 'นายศุภชัย มีนาวัน')
  ]
};

export const VILLAGES: Village[] = [
  { id: 1, moo: 1, name: 'บ้านน้อยในเมือง', totalVoters: 720, zone: 'Central', location: 'ที่ทำการกองทุนหมู่บ้าน หมู่ที่ 1', mapUrl: 'https://maps.app.goo.gl/n6YYwsYH1rj8JWcA7' },
  { id: 2, moo: 2, name: 'บ้านสามแยก', totalVoters: 805, zone: 'North', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 2', mapUrl: 'https://maps.app.goo.gl/rTbypBQpRMTcE37F6' },
  { id: 3, moo: 3, name: 'บ้านหนองแก', totalVoters: 773, zone: 'Central', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 3', mapUrl: 'https://maps.app.goo.gl/SDUReUK7ZbyX2Qti9' },
  { id: 4, moo: 4, name: 'บ้านหนองผักแว่น', totalVoters: 671, zone: 'East', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 4', mapUrl: 'https://maps.app.goo.gl/f8bMD42vKtC4zA1r9' },
  { id: 5, moo: 5, name: 'บ้านนา', totalVoters: 486, zone: 'East', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 5', mapUrl: 'https://maps.app.goo.gl/kGiNzZpakgn1RW3d8' },
  { id: 6, moo: 6, name: 'บ้านเหล่ากล้วย', totalVoters: 618, zone: 'West', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 6', mapUrl: 'https://maps.app.goo.gl/11fCJJGmgMn1VJ1Y7' },
  { id: 7, moo: 7, name: 'บ้านโนนสว่าง', totalVoters: 336, zone: 'South', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 7', mapUrl: 'https://maps.app.goo.gl/oFuk9T3LJpeK9GsQ6' },
  { id: 8, moo: 8, name: 'บ้านแดง', totalVoters: 610, zone: 'North', location: 'ศาลา วัดศรีจันทร์ หมู่ที่ 8', mapUrl: 'https://maps.app.goo.gl/BM5XZ4nd6kyp2nmz8' },
  { id: 9, moo: 9, name: 'บ้านหนองเรือ', totalVoters: 569, zone: 'West', location: 'ศาลา วัดบ้านหนองเรือ หมู่ที่ 9', mapUrl: 'https://maps.app.goo.gl/vABdjbE89kZaMpmb8' },
  { id: 10, moo: 10, name: 'บ้านหนองนาสร้าง', totalVoters: 732, zone: 'Central', location: 'ศาลา วัดบ้านหนองนาสร้าง หมู่ที่ 10', mapUrl: 'https://maps.app.goo.gl/3xCARkb4Q1QWkmjW8' },
  { id: 11, moo: 11, name: 'บ้านหนองตากล้า', totalVoters: 1171, zone: 'East', location: 'อาคารศูนย์เด็ก ร.ร. บ้านหนองตากร้า ม.11', mapUrl: 'https://maps.app.goo.gl/WERxhyAw8PDdegHf9' },
  { id: 12, moo: 12, name: 'บ้านหนองม่วง', totalVoters: 556, zone: 'South', location: 'ศาลา วัดบ้านหนองม่วง หมู่ที่ 12', mapUrl: 'https://maps.app.goo.gl/G2J9anxo9tJecfD79' },
  { id: 13, moo: 13, name: 'บ้านหนองบัวทอง', totalVoters: 910, zone: 'North', location: 'ศาลา วัดบ้านหนองบัวทอง หมู่ที่ 13', mapUrl: 'https://maps.app.goo.gl/3GGcKutVk5o9i7Nr6' },
  { id: 14, moo: 14, name: 'บ้านห้าแยกกกโพธิ์', totalVoters: 995, zone: 'East', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 14', mapUrl: 'https://maps.app.goo.gl/H6c4QxpGcQt6X3xo8' },
  { id: 15, moo: 15, name: 'บ้านโนนงาม', totalVoters: 918, zone: 'West', location: 'ศาลา วัดบ้านโนนงาม หมู่ที่ 15', mapUrl: 'https://maps.app.goo.gl/2ZMszr99qRK3dKE9A' },
  { id: 16, moo: 16, name: 'บ้านโนนเมือง', totalVoters: 909, zone: 'South', location: 'ศาลา วัดบ้านโนนเมือง หมู่ที่ 16', mapUrl: 'https://maps.app.goo.gl/R5D4CGrHazGFSiRJA' },
  { id: 17, moo: 17, name: 'บ้านไทยอุดม (ที่ตั้ง อบต.เหนือเมือง)', totalVoters: 1063, zone: 'Central', location: 'ศาลา วัดป่าศรีไพรวัน หมู่ที่ 17', mapUrl: 'https://maps.app.goo.gl/ewuP2iTjjQudTcNg8' },
  { id: 18, moo: 18, name: 'บ้านหนองไผ่', totalVoters: 595, zone: 'North', location: 'ปะรำข้างที่ทำการผู้ใหญ่บ้าน 18', mapUrl: 'https://maps.app.goo.gl/413iCj8UEL3bCPkHA' },
  { id: 19, moo: 19, name: 'บ้านโนนสว่าง (ใหม่)', totalVoters: 573, zone: 'East', location: 'ศาลา วัดบ้านโนนว่าง หมู่ที่ 19', mapUrl: 'https://maps.app.goo.gl/exZ5wb372SQgum4r7' },
  { id: 20, moo: 20, name: 'บ้านแดง (ใหม่)', totalVoters: 373, zone: 'West', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 20', mapUrl: 'https://maps.app.goo.gl/evh1uxniY6SXfuNRA' },
  { id: 21, moo: 21, name: 'บ้านป่าม่วง', totalVoters: 260, zone: 'South', location: 'ศาลา วัดบ้านป่าม่วง หมู่ที่ 21', mapUrl: 'https://maps.app.goo.gl/QXnkXrzRinmRwWLy8' },
  { id: 22, moo: 22, name: 'บ้านน้อยในเมือง (ใหม่)', totalVoters: 886, zone: 'Central', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 22', mapUrl: 'https://maps.app.goo.gl/bexnbvJ4WqHV6XPW6' },
  { id: 23, moo: 23, name: 'บ้านหนองผักแว่น (ใหม่)', totalVoters: 777, zone: 'North', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 23', mapUrl: 'https://maps.app.goo.gl/Ea86Bpy4kumU79kF9' },
];

export const MEMBER_VOTE_DATA = [
  { villageId: 2, candidateId: 201, count: 15 },
  { villageId: 2, candidateId: 202, count: 297 },
  { villageId: 2, candidateId: 203, count: 253 },
  { villageId: 3, candidateId: 301, count: 68 },
  { villageId: 3, candidateId: 302, count: 144 },
  { villageId: 3, candidateId: 303, count: 313 },
  { villageId: 4, candidateId: 401, count: 321 },
  { villageId: 5, candidateId: 501, count: 9 },
  { villageId: 5, candidateId: 502, count: 200 },
  { villageId: 5, candidateId: 503, count: 167 },
  { villageId: 6, candidateId: 601, count: 194 },
  { villageId: 6, candidateId: 602, count: 59 },
  { villageId: 6, candidateId: 603, count: 7 },
  { villageId: 6, candidateId: 604, count: 173 },
  { villageId: 7, candidateId: 701, count: 11 },
  { villageId: 7, candidateId: 702, count: 116 },
  { villageId: 7, candidateId: 703, count: 149 },
  { villageId: 8, candidateId: 801, count: 237 },
  { villageId: 8, candidateId: 802, count: 8 },
  { villageId: 8, candidateId: 803, count: 216 },
  { villageId: 9, candidateId: 901, count: 341 },
  { villageId: 10, candidateId: 1001, count: 49 },
  { villageId: 10, candidateId: 1002, count: 227 },
  { villageId: 10, candidateId: 1003, count: 230 },
  { villageId: 11, candidateId: 1101, count: 100 },
  { villageId: 11, candidateId: 1102, count: 75 },
  { villageId: 11, candidateId: 1103, count: 269 },
  { villageId: 11, candidateId: 1104, count: 76 },
  { villageId: 12, candidateId: 1201, count: 148 },
  { villageId: 12, candidateId: 1202, count: 25 },
  { villageId: 12, candidateId: 1203, count: 233 },
  { villageId: 13, candidateId: 1301, count: 351 },
  { villageId: 13, candidateId: 1302, count: 239 },
  { villageId: 13, candidateId: 1303, count: 76 },
  { villageId: 14, candidateId: 1401, count: 210 },
  { villageId: 14, candidateId: 1402, count: 74 },
  { villageId: 14, candidateId: 1403, count: 372 },
  { villageId: 15, candidateId: 1501, count: 344 },
  { villageId: 15, candidateId: 1502, count: 309 },
  { villageId: 16, candidateId: 1601, count: 38 },
  { villageId: 16, candidateId: 1602, count: 213 },
  { villageId: 16, candidateId: 1603, count: 396 },
  { villageId: 17, candidateId: 1701, count: 340 },
  { villageId: 17, candidateId: 1702, count: 412 },
  { villageId: 18, candidateId: 1801, count: 293 },
  { villageId: 18, candidateId: 1802, count: 87 },
  { villageId: 19, candidateId: 1901, count: 20 },
  { villageId: 19, candidateId: 1902, count: 149 },
  { villageId: 19, candidateId: 1903, count: 265 },
  { villageId: 20, candidateId: 2001, count: 74 },
  { villageId: 20, candidateId: 2002, count: 62 },
  { villageId: 20, candidateId: 2003, count: 148 },
  { villageId: 21, candidateId: 2101, count: 108 },
  { villageId: 21, candidateId: 2102, count: 4 },
  { villageId: 21, candidateId: 2103, count: 110 },
  { villageId: 22, candidateId: 2201, count: 24 },
  { villageId: 22, candidateId: 2202, count: 177 },
  { villageId: 22, candidateId: 2203, count: 337 },
  { villageId: 23, candidateId: 2301, count: 90 },
  { villageId: 23, candidateId: 2302, count: 130 },
  { villageId: 23, candidateId: 2303, count: 311 },
];

export const MOCK_INITIAL_VOTES = () => {
  const records: any[] = [];
  
  // ใส่ข้อมูลสมาชิกจริง
  MEMBER_VOTE_DATA.forEach(d => {
    records.push({ ...d, electionType: 'MEMBER' });
  });

  // สุ่มข้อมูลนายกฯ เพื่อความสมบูรณ์ของแดชบอร์ด
  VILLAGES.forEach(v => {
    const turnoutRate = 0.65 + (Math.random() * 0.2);
    const totalVotes = Math.floor(v.totalVoters * turnoutRate);
    
    let remainingVotesMayor = totalVotes;
    CANDIDATES.forEach((c, idx) => {
      const share = idx === 0 ? 0.35 : (idx === 1 ? 0.25 : 0.15); 
      const count = Math.floor(totalVotes * share * (0.9 + Math.random() * 0.2));
      const actualCount = Math.min(count, remainingVotesMayor);
      
      records.push({
        villageId: v.id,
        candidateId: c.id,
        count: actualCount,
        electionType: 'MAYOR'
      });
      remainingVotesMayor -= actualCount;
    });

    // บันทึกบัตรเสีย/ไม่เลือก (นายก)
    records.push({ villageId: v.id, candidateId: -1, count: Math.floor(totalVotes * 0.03), electionType: 'MAYOR' });
    records.push({ villageId: v.id, candidateId: 0, count: Math.floor(totalVotes * 0.02), electionType: 'MAYOR' });
    
    // บันทึกบัตรเสีย/ไม่เลือก (สมาชิก) สำหรับหน่วยที่มีผลสมาชิกแล้ว
    if (MEMBER_VOTE_DATA.some(m => m.villageId === v.id)) {
        records.push({ villageId: v.id, candidateId: -1, count: Math.floor(totalVotes * 0.04), electionType: 'MEMBER' });
        records.push({ villageId: v.id, candidateId: 0, count: Math.floor(totalVotes * 0.02), electionType: 'MEMBER' });
    }
  });

  return records;
};

export const MOCK_INITIAL_STATUSES = (votes: any[]): VillageStatus[] => {
  return VILLAGES.map(v => {
    const hasVotes = votes.some((r: any) => r.villageId === v.id);
    return {
      villageId: v.id,
      isReported: hasVotes,
      isVerified: hasVotes && Math.random() > 0.8,
      lastUpdated: hasVotes ? new Date() : undefined
    };
  });
};
