/**
 * 문수로 비스타 더파크 - 관심고객 등록 웹사이트 인터랙션 및 관리 스크립트
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. 공인중개사 정보 동적 반영 (대표전화 삭제 -> 휴대폰 직통 일원화)
  initAgencyInfo();

  // 2. 전화번호 및 생년월일 입력 제어
  initInputMasks();

  // 3. 관심고객 등록 폼 제출 처리 (생년월일 포함)
  initCustomerForm();

  // 4. 모달 제어 (등록완료, 개인정보약관, 관리자 패널)
  initModals();

  // 5. 공인중개사용 관리자 대시보드
  initAdminDashboard();

  // 6. 실시간 등록 알림 롤링 티커 (전환율 극대화 장치)
  initLiveTicker();

  // 7. 라이트박스 뷰어 줌/팬 제어 초기화
  initLightboxZoomControls();
});

/**
 * SITE_CONFIG 데이터를 화면 요소에 반영 (일반전화 없이 모바일 직통으로 통일)
 */
function initAgencyInfo() {
  if (typeof SITE_CONFIG === "undefined") return;

  const { agency } = SITE_CONFIG;
  const directPhone = agency.mobile; // 010-2772-1719

  // 헤더 전화
  const headerCallBtn = document.getElementById("headerCallBtn");
  if (headerCallBtn && directPhone) {
    headerCallBtn.href = `tel:${directPhone}`;
  }

  // 히어로 전화
  const heroCallBtn = document.getElementById("heroCallBtn");
  if (heroCallBtn && directPhone) {
    heroCallBtn.href = `tel:${directPhone}`;
  }

  // 푸터 정보
  const footerAgencyName = document.getElementById("footerAgencyName");
  const footerAgencyDetails = document.getElementById("footerAgencyDetails");
  if (footerAgencyName) footerAgencyName.textContent = agency.name;
  if (footerAgencyDetails) {
    footerAgencyDetails.innerHTML = `
      대표: ${agency.representative} | 개설등록번호: ${agency.regNumber} | 상담 직통: ${directPhone}<br>
      사무소 주소: ${agency.address} | ${agency.insurance}
    `;
  }

  // 모바일 하단바
  const mobileCallBtn = document.getElementById("mobileCallBtn");
  const mobileSmsBtn = document.getElementById("mobileSmsBtn");
  if (mobileCallBtn && directPhone) mobileCallBtn.href = `tel:${directPhone}`;
  if (mobileSmsBtn && directPhone) {
    mobileSmsBtn.href = `sms:${directPhone}?body=${encodeURIComponent(
      "[문수로 비스타 더파크] 분양 일정 및 청약 상담 요청합니다."
    )}`;
  }
}

/**
 * 입력 마스크 (휴대폰 자동 하이픈 및 생년월일 6자리 숫자 제어)
 */
function initInputMasks() {
  // 휴대폰 자동 하이픈
  const phoneInput = document.getElementById("userPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (val.length > 11) val = val.substring(0, 11);

      if (val.length < 4) {
        e.target.value = val;
      } else if (val.length < 7) {
        e.target.value = val.substring(0, 3) + "-" + val.substring(3);
      } else if (val.length < 11) {
        e.target.value =
          val.substring(0, 3) +
          "-" +
          val.substring(3, 6) +
          "-" +
          val.substring(6);
      } else {
        e.target.value =
          val.substring(0, 3) +
          "-" +
          val.substring(3, 7) +
          "-" +
          val.substring(7);
      }
    });
  }

  // 주민등록상 생년월일 6자리 숫자만 입력
  const birthInput = document.getElementById("userBirth");
  if (birthInput) {
    birthInput.addEventListener("input", function (e) {
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (val.length > 6) val = val.substring(0, 6);
      e.target.value = val;
    });
  }
}

/**
 * 관심고객 등록 폼 검증 및 데이터 저장 (생년월일 포함)
 */
function initCustomerForm() {
  const form = document.getElementById("customerForm");
  if (!form) return;

  const phoneInput = document.getElementById("userPhone");
  const birthInput = document.getElementById("userBirth");

  // 1. 휴대폰 번호 입력 시 '-' 양식 자동 서식화
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let val = this.value.replace(/[^0-9]/g, "");
      if (val.length > 11) val = val.slice(0, 11);

      if (val.length <= 3) {
        this.value = val;
      } else if (val.length <= 7) {
        this.value = `${val.slice(0, 3)}-${val.slice(3)}`;
      } else if (val.length <= 10) {
        // 10자리 번호 (예: 011-123-4567 또는 010-123-4567)
        this.value = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
      } else {
        // 11자리 번호 (예: 010-1234-5678)
        this.value = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
      }
    });
  }

  // 2. 생년월일 6자리 숫자만 입력 제한
  if (birthInput) {
    birthInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "").slice(0, 6);
    });
  }

  const btnSubmit = form.querySelector(".btn-submit-form");
  const originalBtnText = btnSubmit ? btnSubmit.innerHTML : "관심고객 사전등록 완료하기";

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const birth = document.getElementById("userBirth").value.trim();
    const housingType = form.elements["housingType"].value;
    const purpose = form.elements["purpose"].value;
    const region = document.getElementById("userRegion").value;
    const message = document.getElementById("userMessage").value.trim();
    const agree = document.getElementById("privacyAgree").checked;

    if (!name) {
      alert("고객 성함을 입력해 주세요.");
      document.getElementById("userName").focus();
      return;
    }

    // 휴대폰 번호 유효성 검사
    const rawPhone = phone.replace(/[^0-9]/g, "");
    if (rawPhone.length < 10 || rawPhone.length > 11 || !rawPhone.startsWith("01")) {
      alert("올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)");
      document.getElementById("userPhone").focus();
      return;
    }

    // 생년월일 6자리 검사
    if (!birth || birth.length !== 6) {
      alert("주민등록상 생년월일 6자리를 정확히 입력해 주세요. (예: 850315)");
      document.getElementById("userBirth").focus();
      return;
    }

    if (!agree) {
      alert("개인정보 수집 및 분양정보 안내 수신에 동의해 주세요.");
      return;
    }

    // 가상 키보드 즉시 닫기 (모바일 뷰포트 왜곡 방지)
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    // 전송 중 중복 클릭 방지
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite; vertical-align:middle; margin-right:4px;"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>안전하게 접수 중...</span>
      `;
    }

    // 고객 데이터 객체 생성 (생년월일 포함)
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newCustomer = {
      id: "CUST_" + Date.now(),
      createdAt: formattedDate,
      name: name,
      birthDate: birth,
      phone: phone,
      housingType: housingType,
      purpose: purpose,
      region: region,
      message: message || "없음"
    };

    // 1. 브라우저 로컬 스토리지에 우선 백업 저장
    saveCustomerToStorage(newCustomer);

    // 2. 서버 API 및 Supabase 클라우드 데이터베이스 전송
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: name,
          userPhone: phone,
          userBirth: birth,
          housingType: housingType,
          purpose: purpose,
          userRegion: region,
          userMessage: message
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "데이터베이스 저장 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      if (result && result.id) {
        newCustomer.id = result.id;
      }

      // 등록완료 알림창 표시
      alert(
        `🎉 [문수로 비스타 더파크]\n\n${name} 고객님의 관심고객 사전등록이 정상 접수되었습니다!\n\n이룬다부동산중개 장혜경 소장이 확인 후 맞춤 분양정보 및 일정을 유선으로 신속히 안내해 드리겠습니다.`
      );

      // 성공 모달 띄우기 (상세 내역 표시)
      showSuccessModal(newCustomer);

      // 폼 초기화
      form.reset();
    } catch (apiErr) {
      console.error("Registration error:", apiErr);
      alert(
        apiErr.message ||
        "등록 처리 중 네트워크 오류가 발생했습니다.\n잠시 후 다시 시도해 주시거나 대표번호(010-2772-1719)로 문의해 주세요."
      );
    } finally {
      // 버튼 복구
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnText;
      }
    }
  });
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

/**
 * 로컬스토리지 저장 함수
 */
function saveCustomerToStorage(customer) {
  const key = SITE_CONFIG?.admin?.storageKey || "munsuro_vista_customers_v1";
  let list = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }
  list.unshift(customer);
  localStorage.setItem(key, JSON.stringify(list));
}

function getCustomersFromStorage() {
  const key = SITE_CONFIG?.admin?.storageKey || "munsuro_vista_customers_v1";
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 등록 완료 모달 팝업 표시 (생년월일 추가)
 */
function showSuccessModal(customer) {
  const modal = document.getElementById("successModal");
  const summaryBox = document.getElementById("successSummary");

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div><span>등록일시</span><span>${customer.createdAt}</span></div>
      <div><span>성함</span><span>${customer.name} 고객님</span></div>
      <div><span>생년월일</span><span>${customer.birthDate}</span></div>
      <div><span>연락처</span><span>${customer.phone}</span></div>
      <div><span>관심평형</span><span>${customer.housingType}</span></div>
      <div><span>관심목적</span><span>${customer.purpose}</span></div>
      <div><span>거주지역</span><span>${customer.region}</span></div>
    `;
  }

  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
}

/**
 * 모달창 제어 로직
 */
function initModals() {
  const successModal = document.getElementById("successModal");
  const btnCloseSuccess = document.getElementById("btnCloseSuccess");
  const btnCloseSuccessIcon = document.getElementById("btnCloseSuccessIcon");

  const closeSuccess = () => {
    if (successModal) successModal.classList.remove("active");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  };

  if (btnCloseSuccess) btnCloseSuccess.addEventListener("click", closeSuccess);
  if (btnCloseSuccessIcon) btnCloseSuccessIcon.addEventListener("click", closeSuccess);

  // 개인정보 약관 모달
  const privacyModal = document.getElementById("privacyModal");
  const btnPrivacyModal = document.getElementById("btnPrivacyModal");
  const btnClosePrivacy = document.getElementById("btnClosePrivacy");
  const btnConfirmPrivacy = document.getElementById("btnConfirmPrivacy");

  const closePrivacy = () => {
    if (privacyModal) privacyModal.classList.remove("active");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  };

  if (btnPrivacyModal && privacyModal) {
    btnPrivacyModal.addEventListener("click", () => {
      privacyModal.classList.add("active");
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    });
  }
  if (btnClosePrivacy) btnClosePrivacy.addEventListener("click", closePrivacy);
  if (btnConfirmPrivacy && privacyModal) {
    btnConfirmPrivacy.addEventListener("click", () => {
      closePrivacy();
      const checkbox = document.getElementById("privacyAgree");
      if (checkbox) checkbox.checked = true;
    });
  }

  // 배경 클릭 시 닫기
  [successModal, privacyModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      }
    });
  });
}

/**
 * 공인중개사 전용 고객 관리자 패널
 */
function initAdminDashboard() {
  const adminModal = document.getElementById("adminModal");
  const btnAdminModal = document.getElementById("btnAdminModal");
  const btnCloseAdmin = document.getElementById("btnCloseAdmin");
  const btnAdminLogin = document.getElementById("btnAdminLogin");
  const adminPasswordInput = document.getElementById("adminPasswordInput");

  const adminAuthArea = document.getElementById("adminAuthArea");
  const adminDashboardArea = document.getElementById("adminDashboardArea");
  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnClearAllDb = document.getElementById("btnClearAllDb");

  if (!adminModal) return;

  function openAdminModal() {
    adminModal.classList.add("active");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    adminPasswordInput.value = "";
    adminPasswordInput.focus();
  }

  function closeAdminModal() {
    adminModal.classList.remove("active");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }

  // 관리자 모달 열기
  if (btnAdminModal) {
    btnAdminModal.addEventListener("click", openAdminModal);
  }

  // 단축키 (Ctrl + Shift + A) 또는 URL 해시(#admin) 지원
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      openAdminModal();
    }
  });

  if (window.location.hash === "#admin") {
    setTimeout(openAdminModal, 300);
  }

  // 관리자 모달 닫기
  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener("click", closeAdminModal);
  }

  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) closeAdminModal();
  });

  // 로그인 버튼
  let currentAdminPassword = "";
  if (btnAdminLogin) {
    const doLogin = async () => {
      const inputPw = adminPasswordInput.value.trim();
      const correctPw = SITE_CONFIG?.admin?.password || "1234";

      if (inputPw === correctPw) {
        currentAdminPassword = inputPw;
        adminAuthArea.style.display = "none";
        adminDashboardArea.style.display = "block";
        await renderCustomerTable();
      } else {
        alert("비밀번호가 일치하지 않습니다.");
        adminPasswordInput.value = "";
        adminPasswordInput.focus();
      }
    };

    btnAdminLogin.addEventListener("click", doLogin);
    adminPasswordInput.addEventListener("keyup", e => {
      if (e.key === "Enter") doLogin();
    });
  }

  // CSV 엑셀 다운로드
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", exportCustomersToCsv);
  }

  // 전체 삭제
  if (btnClearAllDb) {
    btnClearAllDb.addEventListener("click", () => {
      if (confirm("정말 모든 관심고객 등록 데이터를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
        const key = SITE_CONFIG?.admin?.storageKey || "munsuro_vista_customers_v1";
        localStorage.removeItem(key);
        renderCustomerTable();
        alert("로컬 보관 데이터가 삭제되었습니다.");
      }
    });
  }
}

/**
 * 관리자 테이블 렌더링 (Supabase 클라우드 DB 실시간 조회 + 로컬스토리지 폴백)
 */
async function renderCustomerTable() {
  const tableBody = document.getElementById("adminCustomerTableBody");
  const countEl = document.getElementById("adminCustomerCount");
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="9" style="text-align:center; padding: 25px; color:#888;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite; vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        클라우드 DB에서 실시간 고객 명단을 불러오는 중입니다...
      </td>
    </tr>
  `;

  let list = [];
  let isFromDatabase = false;

  // 1. 서버 API를 통해 Supabase DB 실시간 조회 시도
  if (window.location.protocol.startsWith("http")) {
    try {
      const res = await fetch("/api/customers", {
        headers: { "x-admin-password": "1234" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.customers) {
          list = data.customers;
          isFromDatabase = true;
        }
      }
    } catch (apiErr) {
      console.log("DB fetch via API skip:", apiErr);
    }
  }

  // 2. 로컬 모드이거나 오프라인인 경우 LocalStorage 폴백
  if (!isFromDatabase) {
    list = getCustomersFromStorage();
  }

  if (countEl) {
    countEl.innerHTML = `${list.length}명 ${isFromDatabase ? '<span style="font-size:12px; color:#10b981; font-weight:normal; margin-left:6px;">● Supabase 클라우드 DB 실시간 연결됨</span>' : '<span style="font-size:12px; color:#888; font-weight:normal; margin-left:6px;">(로컬 보관 모드)</span>'}`;
  }

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 30px; color:#888;">
          현재 접수된 관심고객 데이터가 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = list
    .map(
      (cust) => `
      <tr>
        <td>${cust.created_at ? new Date(cust.created_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : cust.createdAt}</td>
        <td><strong>${escapeHtml(cust.name)}</strong></td>
        <td><span style="font-family:monospace; background:#edf2f7; color:#2d3748; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(cust.birth || cust.birthDate || "-")}</span></td>
        <td><a href="tel:${cust.phone}" style="color:#0d3b2e; font-weight:700; text-decoration:underline;">${cust.phone}</a></td>
        <td>${escapeHtml(cust.housingType)}</td>
        <td>${escapeHtml(cust.purpose)}</td>
        <td>${escapeHtml(cust.region)}</td>
        <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(cust.message)}">
          ${escapeHtml(cust.message)}
        </td>
        <td>
          <button type="button" class="btn-row-del" onclick="deleteCustomerRow('${cust.id}')">삭제</button>
        </td>
      </tr>
    `
    )
    .join("");
}

/**
 * 특정 고객 행 삭제 (Supabase DB 및 로컬스토리지 동시 삭제)
 */
window.deleteCustomerRow = async function (id) {
  if (!confirm("해당 고객 등록 내역을 삭제하시겠습니까?")) return;

  if (window.location.protocol.startsWith("http")) {
    try {
      await fetch(`/api/customers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-password": "1234" }
      });
    } catch (e) {
      console.log("Delete API skip");
    }
  }

  const key = SITE_CONFIG?.admin?.storageKey || "munsuro_vista_customers_v1";
  let list = getCustomersFromStorage();
  list = list.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(list));
  await renderCustomerTable();
};

/**
 * 엑셀(CSV) 파일 다운로드 (Supabase 클라우드 다운로드 + 로컬 한글 UTF-8 BOM 지원)
 */
function exportCustomersToCsv() {
  if (window.location.protocol.startsWith("http")) {
    window.location.href = `/api/customers?export=csv&password=1234`;
    return;
  }

  const list = getCustomersFromStorage();
  if (list.length === 0) {
    alert("내보낼 관심고객 데이터가 없습니다.");
    return;
  }

  const headers = ["등록일시", "고객성함", "생년월일(6자리)", "연락처", "관심평형", "분양목적", "거주지역", "문의사항"];
  const rows = list.map(item => [
    `"${item.createdAt}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.birthDate || ''}"`,
    `"${item.phone}"`,
    `"${item.housingType}"`,
    `"${item.purpose}"`,
    `"${item.region}"`,
    `"${(item.message || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `문수로비스타더파크_관심고객명단_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 주소 클립보드 복사 함수 (오시는 길 카드용)
 */
window.copyAddress = function (elementId, label) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent.trim();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`[${label}]이 복사되었습니다.\n\n${text}`);
    }).catch(() => {
      fallbackCopyText(text, label);
    });
  } else {
    fallbackCopyText(text, label);
  }
};

function fallbackCopyText(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    alert(`[${label}]이 복사되었습니다.\n\n${text}`);
  } catch (err) {
    prompt("아래 주소를 복사하세요 (Ctrl+C):", text);
  }
  document.body.removeChild(textArea);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 실시간 등록 알림 롤링 티커 로직 (Social Proof)
 */
function initLiveTicker() {
  const tickerWrap = document.getElementById("liveTickerWrap");
  const tickerText = document.getElementById("tickerText");
  const btnClose = document.getElementById("btnTickerClose");

  if (!tickerWrap || !tickerText) return;

  const mockEvents = [
    { location: "울산 남구", name: "김*진", type: "전용 84㎡", action: "MGM 계약 축하금 사전등록 완료", time: "방금 전" },
    { location: "울산 중구", name: "이*원", type: "전용 84㎡", action: "스타벅스 쿠폰 이벤트 접수 완료", time: "3분 전" },
    { location: "울산 남구", name: "박*우", type: "84㎡ 로얄동", action: "MGM 축하 지원금 대상자 등록", time: "7분 전" },
    { location: "울산 북구", name: "정*희", type: "전용 84㎡", action: "청약 사전등록 접수 완료", time: "12분 전" },
    { location: "울주군", name: "최*호", type: "전용 84㎡", action: "MGM 리워드 사전신청 완료", time: "18분 전" },
    { location: "울산 남구", name: "강*훈", type: "전용 84㎡", action: "MGM 계약 축하금 사전등록 완료", time: "25분 전" }
  ];

  let curIdx = 0;
  let isClosed = false;
  let showCount = 0;
  const MAX_SHOW_COUNT = 15; // 방문 중 적절히 유지되도록 횟수 상향

  if (btnClose) {
    btnClose.addEventListener("click", () => {
      isClosed = true;
      tickerWrap.style.display = "none";
    });
  }

  function showNextTicker() {
    if (isClosed || showCount >= MAX_SHOW_COUNT) return;

    const item = mockEvents[curIdx];
    tickerText.innerHTML = `
      <div><strong>[${item.location}] ${item.name}님</strong> (${item.type})</div>
      <div>${item.action}</div>
      <span class="ticker-time">${item.time}</span>
    `;

    tickerWrap.style.display = "flex";
    showCount++;

    // 4초 동안 노출 후 숨기기
    setTimeout(() => {
      if (isClosed) return;
      tickerWrap.style.display = "none";

      if (showCount < MAX_SHOW_COUNT) {
        // 숨긴 뒤 9초 후에 다음 알림 표출 (더 자주 생생하게 노출)
        curIdx = (curIdx + 1) % mockEvents.length;
        setTimeout(showNextTicker, 9000);
      }
    }, 4000);
  }

  // 첫 시작은 페이지 접속 3.5초 후
  setTimeout(showNextTicker, 3500);
}

/**
 * 공식 고화질 이미지 Lightbox 팝업 및 줌/팬 인터랙션 제어
 */
let lightboxState = {
  scale: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
  initialDistance: 0,
  initialScale: 1
};

function updateLightboxTransform(animate = false) {
  const transformWrap = document.getElementById("lightboxTransformWrap");
  const badge = document.getElementById("lightboxZoomBadge");
  if (!transformWrap) return;

  if (animate) {
    transformWrap.classList.remove("no-transition");
  } else {
    transformWrap.classList.add("no-transition");
  }

  transformWrap.style.transform = `translate(${lightboxState.panX}px, ${lightboxState.panY}px) scale(${lightboxState.scale})`;
  if (badge) {
    badge.textContent = `${Math.round(lightboxState.scale * 100)}%`;
  }
}

function resetLightboxZoom() {
  lightboxState.scale = 1;
  lightboxState.panX = 0;
  lightboxState.panY = 0;
  updateLightboxTransform(true);
}

function zoomLightbox(delta) {
  let newScale = Math.round((lightboxState.scale + delta) * 10) / 10;
  if (newScale < 0.8) newScale = 0.8;
  if (newScale > 3.5) newScale = 3.5;

  lightboxState.scale = newScale;
  if (newScale <= 1) {
    lightboxState.panX = 0;
    lightboxState.panY = 0;
  }
  updateLightboxTransform(true);
}

window.openLightbox = function (src) {
  const modal = document.getElementById("lightboxModal");
  const img = document.getElementById("lightboxImg");
  if (!modal || !img) return;

  img.src = src;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  resetLightboxZoom();
};

window.closeLightbox = function (e) {
  const modal = document.getElementById("lightboxModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
  resetLightboxZoom();
};

function initLightboxZoomControls() {
  const modal = document.getElementById("lightboxModal");
  const viewport = document.getElementById("lightboxViewport");
  const btnIn = document.getElementById("btnZoomIn");
  const btnOut = document.getElementById("btnZoomOut");
  const btnReset = document.getElementById("btnZoomReset");
  const btnClose = document.getElementById("btnLightboxClose");

  if (!modal || !viewport) return;

  if (btnIn) btnIn.addEventListener("click", () => zoomLightbox(0.3));
  if (btnOut) btnOut.addEventListener("click", () => zoomLightbox(-0.3));
  if (btnReset) btnReset.addEventListener("click", resetLightboxZoom);
  if (btnClose) btnClose.addEventListener("click", window.closeLightbox);

  // 마우스 휠 줌
  viewport.addEventListener("wheel", function (e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    zoomLightbox(delta);
  }, { passive: false });

  // 더블 클릭 시 확대 / 100% 토글
  viewport.addEventListener("dblclick", function (e) {
    e.preventDefault();
    if (lightboxState.scale > 1.2) {
      resetLightboxZoom();
    } else {
      lightboxState.scale = 2.0;
      updateLightboxTransform(true);
    }
  });

  // 마우스 드래그 이동
  viewport.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return; // 좌클릭만
    lightboxState.isDragging = true;
    lightboxState.startX = e.clientX - lightboxState.panX;
    lightboxState.startY = e.clientY - lightboxState.panY;
    viewport.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", function (e) {
    if (!lightboxState.isDragging) return;
    lightboxState.panX = e.clientX - lightboxState.startX;
    lightboxState.panY = e.clientY - lightboxState.startY;
    updateLightboxTransform(false);
  });

  window.addEventListener("mouseup", function () {
    if (lightboxState.isDragging) {
      lightboxState.isDragging = false;
      if (viewport) viewport.classList.remove("is-dragging");
    }
  });

  // 터치 제어 (모바일 핀치 줌 & 드래그 패닝)
  viewport.addEventListener("touchstart", function (e) {
    if (e.touches.length === 1) {
      lightboxState.isDragging = true;
      lightboxState.startX = e.touches[0].clientX - lightboxState.panX;
      lightboxState.startY = e.touches[0].clientY - lightboxState.panY;
    } else if (e.touches.length === 2) {
      lightboxState.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lightboxState.initialDistance = Math.hypot(dx, dy);
      lightboxState.initialScale = lightboxState.scale;
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", function (e) {
    if (e.touches.length === 1 && lightboxState.isDragging) {
      lightboxState.panX = e.touches[0].clientX - lightboxState.startX;
      lightboxState.panY = e.touches[0].clientY - lightboxState.startY;
      updateLightboxTransform(false);
    } else if (e.touches.length === 2 && lightboxState.initialDistance > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / lightboxState.initialDistance;
      let newScale = Math.round(lightboxState.initialScale * factor * 10) / 10;
      if (newScale < 0.8) newScale = 0.8;
      if (newScale > 3.5) newScale = 3.5;
      lightboxState.scale = newScale;
      updateLightboxTransform(false);
    }
  }, { passive: true });

  viewport.addEventListener("touchend", function (e) {
    if (e.touches.length === 0) {
      lightboxState.isDragging = false;
      lightboxState.initialDistance = 0;
    }
  });
}

// ESC 키로 Lightbox 닫기
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    window.closeLightbox();
  }
});

/**
 * 분양안내 공식 탭 전환 (분양일정표 vs 공급안내표)
 */
window.switchGraphicTab = function (type) {
  const frameSchedule = document.getElementById("graphicFrameSchedule");
  const frameSupply = document.getElementById("graphicFrameSupply");
  const btnSchedule = document.getElementById("tabBtnSchedule");
  const btnSupply = document.getElementById("tabBtnSupply");

  if (!frameSchedule || !frameSupply) return;

  if (type === "schedule") {
    frameSchedule.style.display = "flex";
    frameSupply.style.display = "none";
    if (btnSchedule) btnSchedule.classList.add("active");
    if (btnSupply) btnSupply.classList.remove("active");
  } else if (type === "supply") {
    frameSchedule.style.display = "none";
    frameSupply.style.display = "flex";
    if (btnSchedule) btnSchedule.classList.remove("active");
    if (btnSupply) btnSupply.classList.add("active");
  }
};


