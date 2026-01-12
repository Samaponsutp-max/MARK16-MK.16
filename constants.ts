
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
    createMember(203, 3, 'ร้อยตรีสุขะ เพ็งพิพาทรย์')
  ],
  3: [
    createMember(301, 1, 'นางสุดารัตน์ เถระวัลย์'),
    createMember(302, 2, 'นางสาวกมลมาศ มีสวัสดิ์'),
    createMember(303, 3, 'นางสาวนิตา สาระชร')
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
    createMember(602, 2, 'นางสาวนิตา ธีราภักดิ์'),
    createMember(603, 3, 'นางสาวศุภรดา ชมภูพาชน์'),
    createMember(604, 4, 'นายชาตรี ศรีตาคุณ')
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
    createMember(1001, 1, 'นายบุญทิพย์ บุตรัตน์'),
    createMember(1002, 2, 'นางภาวัลย์ เอกทัศน์'),
    createMember(1003, 3, 'นายวีระ ชมภูบุตร')
  ],
  11: [
    createMember(1101, 1, 'นายอนันตชัย ไยเล็กทิม'),
    createMember(1102, 2, 'นางสาวจันทร์เพ็ญ จรูญเพ็ญ'),
    createMember(1103, 3, 'นางจริญญา ศรีรัญรัตน์'),
    createMember(1104, 4, 'ร้อยตรีสมร ภูมิชาติ')
  ],
  12: [
    createMember(1201, 1, 'นางสาวนุชจรี โชติช่วง'),
    createMember(1202, 2, 'นายบุญธรรม ลาวัลย์'),
    createMember(1203, 3, 'นายสำเริง คงโสภา')
  ],
  13: [
    createMember(1301, 1, 'จ่าสิบเอกดาวเทียม จำเริญพัฒน์'),
    createMember(1302, 2, 'นายศรายุทธ ขณะวงค์'),
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
    createMember(1701, 1, 'นางสมหมาย ไขเล็กทิม'),
    createMember(1702, 2, 'นางจิตชนานันท์ อริยพัฒนพร')
  ],
  18: [
    createMember(1801, 1, 'นางสาวชญานุช ดวงดี'),
    createMember(1802, 2, 'นายจงกล มีสวัสดิ์')
  ],
  19: [
    createMember(1901, 1, 'นางพัชรพร พลูลาภ'),
    createMember(1902, 2, 'นางณฤดี นนสุภาพ'),
    createMember(1903, 3, 'นายวิรัช สาศิริ')
  ],
  20: [
    createMember(2001, 1, 'นายวิเชียร ไชยศิรินทร์'),
    createMember(2002, 2, 'ร้อยตำรวจเอกคำอ้าย ศรีปัตถา'),
    createMember(2003, 3, 'นายธีระศักดิ์ อามาตมนตรี')
  ],
  21: [
    createMember(2101, 1, 'นางนางน้อย นีละพันธ์'),
    createMember(2102, 2, 'นางสาวกาญจนา เวียนนนท์'),
    createMember(2103, 3, 'นางสุนีรัตน์ งามผิวเหลือง')
  ],
  22: [
    createMember(2201, 1, 'นางภัคนันท์ นีละพันธ์'),
    createMember(2202, 2, 'นายชัชวาลย์ เชิดพานิชย์'),
    createMember(2203, 3, 'นางจินต์ศุจี จันทะมูล')
  ],
  23: [
    createMember(2301, 1, 'นายวิจิตร์ บรรลือ'),
    createMember(2302, 2, 'นางสาวพิศมร พิมพิลา'),
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
  { id: 19, moo: 19, name: 'บ้านโนนสว่าง (ใหม่)', totalVoters: 573, zone: 'East', location: 'ศาลา วัดบ้านโนนสว่าง หมู่ที่ 19', mapUrl: 'https://maps.app.goo.gl/exZ5wb372SQgum4r7' },
  { id: 20, moo: 20, name: 'บ้านแดง (ใหม่)', totalVoters: 373, zone: 'West', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 20', mapUrl: 'https://maps.app.goo.gl/evh1uxniY6SXfuNRA' },
  { id: 21, moo: 21, name: 'บ้านป่าม่วง', totalVoters: 260, zone: 'South', location: 'ศาลา วัดบ้านป่าม่วง หมู่ที่ 21', mapUrl: 'https://maps.app.goo.gl/QXnkXrzRinmRwWLy8' },
  { id: 22, moo: 22, name: 'บ้านน้อยในเมือง (ใหม่)', totalVoters: 886, zone: 'Central', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 22', mapUrl: 'https://maps.app.goo.gl/bexnbvJ4WqHV6XPW6' },
  { id: 23, moo: 23, name: 'บ้านหนองผักแว่น (ใหม่)', totalVoters: 777, zone: 'North', location: 'ศาลาประชาคมหมู่บ้าน หมู่ที่ 23', mapUrl: 'https://maps.app.goo.gl/Ea86Bpy4kumU79kF9' },
];

export const MOCK_INITIAL_VOTES = () => {
  const records: any[] = [];
  VILLAGES.forEach(v => {
    if (Math.random() > 0.4) {
      const turnoutRate = 0.6 + (Math.random() * 0.25);
      const totalVotes = Math.floor(v.totalVoters * turnoutRate);
      
      let remainingVotesMayor = totalVotes;
      CANDIDATES.forEach((c, idx) => {
        const share = idx === 0 ? 0.35 : (idx === 1 ? 0.3 : 0.15); 
        const count = Math.floor(totalVotes * share * (0.8 + Math.random() * 0.4));
        const actualCount = Math.min(count, remainingVotesMayor);
        
        records.push({
          villageId: v.id,
          candidateId: c.id,
          count: actualCount,
          electionType: 'MAYOR'
        });
        remainingVotesMayor -= actualCount;
      });

      const members = MEMBER_CANDIDATES[v.id] || [];
      if (members.length > 0) {
        let remainingVotesMember = totalVotes;
        members.forEach((m) => {
            const count = Math.floor(remainingVotesMember * (0.5 + Math.random() * 0.4)); 
             records.push({
              villageId: v.id,
              candidateId: m.id,
              count: count,
              electionType: 'MEMBER'
            });
            remainingVotesMember -= count;
        });
      }
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
      isVerified: hasVotes && Math.random() > 0.6,
      lastUpdated: hasVotes ? new Date() : undefined
    };
  });
};
