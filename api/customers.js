// Vercel Serverless Function: GET/DELETE /api/customers (관리자 전용)
module.exports = async (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 관리자 비밀번호 검증
  const adminPassword = process.env.ADMIN_PASSWORD || '1234';
  const providedPassword = req.headers['x-admin-password'] || req.query.password;

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: '관리자 비밀번호가 일치하지 않습니다.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://lalmyznpdqzjshewndyp.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;

  // 1. DELETE 요청 (특정 고객 삭제)
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: '삭제할 고객 ID가 필요합니다.' });
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/public_inquiries?id=eq.${id}&inquiry_type=eq.vista_thepark`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (!response.ok) {
        return res.status(500).json({ error: '고객 데이터 삭제 중 오류가 발생했습니다.' });
      }

      return res.status(200).json({ success: true, message: '삭제되었습니다.' });
    } catch (err) {
      console.error('Delete customer error:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
  }

  // 2. GET 요청 (고객 명단 조회 또는 CSV 엑셀 다운로드)
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/public_inquiries?inquiry_type=eq.vista_thepark&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        return res.status(500).json({ error: '데이터 조회 실패' });
      }

      const rows = await response.json();

      // 메시지 필드에서 상세 정보 파싱
      const parsedList = rows.map((r, index) => {
        const msg = r.message || '';
        const birthMatch = msg.match(/\[생년월일\]\s*([^\n]+)/);
        const typeMatch = msg.match(/\[희망평형\]\s*([^\n]+)/);
        const purposeMatch = msg.match(/\[분양목적\]\s*([^\n]+)/);
        const regionMatch = msg.match(/\[거주지역\]\s*([^\n]+)/);
        const memoMatch = msg.match(/\[상담메모\]\s*([\s\S]*)$/);

        return {
          no: rows.length - index,
          id: r.id,
          name: r.name,
          phone: r.phone,
          birth: birthMatch ? birthMatch[1].trim() : '-',
          housingType: typeMatch ? typeMatch[1].trim() : '전용 84㎡',
          purpose: purposeMatch ? purposeMatch[1].trim() : '실거주',
          region: regionMatch ? regionMatch[1].trim() : '울산 남구',
          message: memoMatch && memoMatch[1] !== '없음' ? memoMatch[1].trim() : '',
          created_at: r.created_at,
          status: r.status || 'pending'
        };
      });

      // CSV 다운로드 요청인 경우
      if (req.query.export === 'csv') {
        let csvContent = '\uFEFF'; // Excel 한글 깨짐 방지 UTF-8 BOM
        csvContent += '번호,성함,연락처,생년월일,희망평형,목적,거주지역,상담메모,등록일시\n';

        parsedList.forEach(item => {
          const escapeCsv = val => `"${String(val || '').replace(/"/g, '""')}"`;
          const dateStr = new Date(item.created_at).toLocaleString('ko-KR');
          csvContent += [
            item.no,
            escapeCsv(item.name),
            escapeCsv(item.phone),
            escapeCsv(item.birth),
            escapeCsv(item.housingType),
            escapeCsv(item.purpose),
            escapeCsv(item.region),
            escapeCsv(item.message),
            escapeCsv(dateStr)
          ].join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="vista_thepark_customers.csv"');
        return res.status(200).send(csvContent);
      }

      return res.status(200).json({
        success: true,
        count: parsedList.length,
        customers: parsedList
      });
    } catch (err) {
      console.error('Fetch customers error:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
