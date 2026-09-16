// Vercel Serverless Function: POST /api/register
module.exports = async (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    } else if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf8'));
      } catch (e) {
        body = {};
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }

    const { userName, userPhone, userBirth, housingType, purpose, userRegion, userMessage } = body;

    if (!userName || !userName.trim()) {
      return res.status(400).json({ error: '성함을 입력해주세요.' });
    }
    if (!userPhone || !userPhone.trim()) {
      return res.status(400).json({ error: '휴대폰 번호를 입력해주세요.' });
    }
    if (!userBirth || !/^\d{6}$/.test(userBirth.trim())) {
      return res.status(400).json({ error: '주민등록상 생년월일 6자리를 정확히 입력해주세요.' });
    }

    const cleanName = userName.trim();
    const cleanPhone = userPhone.trim();
    const cleanBirth = userBirth.trim();
    const cleanHousingType = housingType || '전용 84㎡';
    const cleanPurpose = purpose || '실거주 목적';
    const cleanRegion = userRegion || '울산 남구';
    const cleanMemo = (userMessage || '').trim();

    // Supabase public_inquiries 규격에 맞춘 상세 포맷팅
    const formattedMessage = `[생년월일] ${cleanBirth}\n[희망평형] ${cleanHousingType}\n[분양목적] ${cleanPurpose}\n[거주지역] ${cleanRegion}\n[상담메모] ${cleanMemo || '없음'}`;

    const supabaseUrl = process.env.SUPABASE_URL || 'https://lalmyznpdqzjshewndyp.supabase.co';
    const supabaseKey = process.env.SUPABASE_KEY;

    // Supabase public_inquiries 테이블에 INSERT (이룬다 Land CRM과 100% 동기화)
    const response = await fetch(`${supabaseUrl}/rest/v1/public_inquiries`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: cleanName,
        phone: cleanPhone,
        inquiry_type: 'vista_thepark',
        property_title: '문수로 비스타 더파크 (MGM 계약축하금 대상)',
        message: formattedMessage,
        status: 'pending'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error:', errorText);
      return res.status(500).json({ error: '데이터베이스 저장 중 오류가 발생했습니다.' });
    }

    const data = await response.json();
    return res.status(201).json({
      success: true,
      message: '관심고객 등록이 완료되었습니다.',
      id: data && data[0] ? data[0].id : null,
      created_at: data && data[0] ? data[0].created_at : new Date().toISOString()
    });
  } catch (err) {
    console.error('Register API error:', err);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
};
