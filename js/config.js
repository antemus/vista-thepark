/**
 * 문수로 비스타동원 더파크 - 이룬다 공인중개사사무소 설정 파일
 */
const SITE_CONFIG = {
  // 공인중개사 정보 (실제 공식 등록 정보)
  agency: {
    name: "이룬다 공인중개사사무소",
    representative: "장혜경 소장 (대표 공인중개사)",
    shortRep: "장혜경 소장",
    regNumber: "31140202500096",
    mobile: "010-2772-1719",
    address: "울산광역시 남구 화합로148번길 12, 1층",
    insurance: "100% 부동산 손해배상 보증보험 가입업소",
    regAgency: "울산 남구청 정식 개설 등록 업소",
    businessHoursWeekday: "09:00 ~ 19:00",
    businessHoursWeekend: "예약제 현장 안내",
    specialties: ["울산 상가/점포 전문", "아파트/오피스텔 매매·임대", "수익형 부동산 자산분석", "문수로 비스타동원 청약상담"]
  },

  // 단지 기본 정보
  complex: {
    name: "문수로 비스타동원 더파크",
    engName: "MUNSURO VISTA THE PARK",
    builder: "(주)동원개발 (51년 건설명가 부울경 1위)",
    siteLocation: "울산광역시 남구 무거동 1615-1번지 (무거삼호지구 11BL 일원)",
    modelHouseLocation: "울산광역시 남구 번영로 120 (달동 인근 오픈 예정)",
    scale: "총 700세대 청정 대단지",
    types: "선호도 높은 68㎡ · 84㎡",
    openDate: "2026년 9월 중 OPEN",
    naverMapSite: "https://naver.me/Frio3LNF",
    kakaoMapSite: "https://kko.to/IQ5pyaZZv-",
    naverMapModel: "https://naver.me/G5kF5nTS",
    kakaoMapModel: "https://kko.to/uzV3nGJ2Cu"
  },

  // 관리자 설정
  admin: {
    password: "1234", // 고객 관리자 모드 비밀번호
    storageKey: "munsuro_vista_customers_v1"
  },

  // 구글 스프레드시트 또는 웹훅 연동 URL
  webhookUrl: ""
};
