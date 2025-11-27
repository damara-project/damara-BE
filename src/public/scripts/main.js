// src/public/scripts/main.js
// -----------------------------------------------------------------------------
// 프런트엔드 상호작용을 모두 담당하는 핵심 스크립트
// - 사용자/게시글/이미지 업로드에 대한 이벤트 바인딩 및 API 호출 로직
// - 모든 API 응답을 토대로 화면을 즉시 갱신하고 토스트 알림 제공
// -----------------------------------------------------------------------------

const API_BASE_POSTS = "/api/posts";
const API_BASE_USERS = "/api/users";
const API_BASE_UPLOAD = "/api/upload";

let handlebarsHelpersRegistered = false;

function ensureHandlebarsHelpers() {
  if (handlebarsHelpersRegistered || typeof Handlebars === "undefined") {
    return;
  }

  Handlebars.registerHelper("eq", function (a, b, options) {
    if (options && typeof options.fn === "function") {
      return a === b ? options.fn(this) : options.inverse(this);
    }
    return a === b;
  });

  Handlebars.registerHelper("formatDate", function (dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  });

  Handlebars.registerHelper("truncate", function (str, len) {
    if (!str || str.length <= len) return str;
    return `${str.substring(0, len)}...`;
  });

  Handlebars.registerHelper("formatPrice", function (value) {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return value;
    }
    return num.toLocaleString("ko-KR");
  });

  handlebarsHelpersRegistered = true;
}

// 현재 로그인한 사용자 정보
let currentUser = null;

/**
 * Toast 메시지 표시 함수
 */
function showToast(message, type = "success", duration = 3000) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toastId = `toast-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // 타입에 따른 아이콘과 색상 설정
  const toastConfig = {
    success: {
      icon: "✅",
      bgColor: "bg-success",
      headerColor: "text-white",
    },
    error: {
      icon: "❌",
      bgColor: "bg-danger",
      headerColor: "text-white",
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-warning",
      headerColor: "text-dark",
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-info",
      headerColor: "text-white",
    },
  };

  const config = toastConfig[type] || toastConfig.success;

  const toastHTML = `
    <div id="${toastId}" class="toast ${config.bgColor} ${
    config.headerColor
  }" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${config.bgColor} ${config.headerColor}">
        <strong class="me-auto">${config.icon} ${
    type === "success"
      ? "성공"
      : type === "error"
      ? "오류"
      : type === "warning"
      ? "경고"
      : "안내"
  }</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body ${
        type === "warning" ? "text-dark" : "text-white"
      }" style="font-weight: 500;">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = document.getElementById(toastId);
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: duration,
    });
    toast.show();

    // Toast가 숨겨진 후 DOM에서 제거
    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  }
}

/**
 * 로컬 스토리지에서 사용자 정보 로드
 */
function loadUserFromStorage() {
  const stored = localStorage.getItem("currentUser");
  if (stored) {
    currentUser = JSON.parse(stored);
    updateUIForLoggedInUser();
  }
}

/**
 * 사용자 정보를 로컬 스토리지에 저장
 */
function saveUserToStorage(user) {
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  updateUIForLoggedInUser();
  loadPosts();
}

/**
 * 로그아웃
 */
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUIForLoggedOutUser();
}

/**
 * 로그인 상태 UI 업데이트
 */
function updateUIForLoggedInUser() {
  if (!currentUser) return;

  // 헤더 업데이트
  const loginBtnParent =
    document.getElementById("login-modal-btn")?.parentElement;
  const registerBtnParent =
    document.getElementById("register-modal-btn")?.parentElement;
  const currentUserDisplay = document.getElementById("current-user-display");
  const userNicknameDisplay = document.getElementById("user-nickname-display");

  if (loginBtnParent) loginBtnParent.classList.add("d-none");
  if (registerBtnParent) registerBtnParent.classList.add("d-none");
  if (currentUserDisplay) currentUserDisplay.classList.remove("d-none");
  if (userNicknameDisplay)
    userNicknameDisplay.textContent = currentUser.nickname;

  // 사용자 정보 섹션 표시
  const userInfoSection = document.getElementById("user-info-section");
  const currentUserNickname = document.getElementById("current-user-nickname");
  const currentUserEmail = document.getElementById("current-user-email");

  if (userInfoSection) userInfoSection.classList.remove("d-none");
  if (currentUserNickname)
    currentUserNickname.textContent = currentUser.nickname;
  if (currentUserEmail) currentUserEmail.textContent = currentUser.email;
}

/**
 * 모든 게시글 카드의 참여 상태 초기화 (로그아웃 시)
 */
function resetAllPostParticipationStatus() {
  // 모든 참여 상태 컨테이너 숨기기
  const allJoinedContainers = document.querySelectorAll(
    ".joined-status-container"
  );
  allJoinedContainers.forEach((container) => {
    container.classList.add("d-none");
  });

  // 모든 참여하기 버튼 표시
  const allJoinBtns = document.querySelectorAll(".join-post-btn");
  allJoinBtns.forEach((btn) => {
    btn.classList.remove("d-none");
  });

  // 모든 관리하기 버튼 숨기기
  const allManageBtns = document.querySelectorAll(".manage-post-btn");
  allManageBtns.forEach((btn) => {
    btn.classList.add("d-none");
  });

  // 상세 모달이 열려있으면 닫기
  const detailModal = bootstrap.Modal.getInstance(
    document.getElementById("postDetailModal")
  );
  if (detailModal) {
    detailModal.hide();
  }
}

/**
 * 로그아웃 상태 UI 업데이트
 */
function updateUIForLoggedOutUser() {
  const loginBtnParent =
    document.getElementById("login-modal-btn")?.parentElement;
  const registerBtnParent =
    document.getElementById("register-modal-btn")?.parentElement;
  const currentUserDisplay = document.getElementById("current-user-display");
  const userInfoSection = document.getElementById("user-info-section");

  if (loginBtnParent) loginBtnParent.classList.remove("d-none");
  if (registerBtnParent) registerBtnParent.classList.remove("d-none");
  if (currentUserDisplay) currentUserDisplay.classList.add("d-none");
  if (userInfoSection) userInfoSection.classList.add("d-none");

  // 게시글 참여 상태 초기화
  resetAllPostParticipationStatus();

  // 게시글 목록 다시 로드하여 UI 초기화
  loadPosts();
}

/**
 * 게시글의 참여 여부 확인
 */
async function checkParticipationStatus(postId) {
  if (!currentUser || !currentUser.id) {
    return false;
  }

  try {
    const checkUrl = `${API_BASE_POSTS}/${postId}/participate/${currentUser.id}`;
    const checkResponse = await fetch(checkUrl);

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      return checkData.isParticipant || false;
    }
    return false;
  } catch (error) {
    console.warn(`참여 여부 확인 실패 (postId: ${postId}):`, error);
    return false;
  }
}

/**
 * 게시글 카드의 참여 상태 UI 업데이트
 */
function updatePostCardParticipationStatus(postId, isParticipant) {
  const joinBtn = document.querySelector(
    `.join-post-btn[data-post-id="${postId}"]`
  );
  const joinedContainer = document.querySelector(
    `.joined-status-container[data-post-id="${postId}"]`
  );
  const cancelBtn = joinedContainer?.querySelector(
    `.cancel-join-post-btn[data-post-id="${postId}"]`
  );

  if (isParticipant) {
    if (joinBtn) joinBtn.classList.add("d-none");
    if (joinedContainer) {
      joinedContainer.classList.remove("d-none");
      if (cancelBtn && currentUser) {
        cancelBtn.setAttribute("data-user-id", currentUser.id);
      }
    }
  } else {
    if (joinBtn) joinBtn.classList.remove("d-none");
    if (joinedContainer) joinedContainer.classList.add("d-none");
  }
}

/**
 * 게시글 카드의 작성자 전용 UI 업데이트
 */
function updatePostCardForAuthor(postId, isAuthor) {
  const joinBtn = document.querySelector(
    `.join-post-btn[data-post-id="${postId}"]`
  );
  const cancelBtn = document.querySelector(
    `.cancel-join-post-btn[data-post-id="${postId}"]`
  );
  const joinedBtn = document.querySelector(
    `.joined-post-btn[data-post-id="${postId}"]`
  );
  const manageBtn = document.querySelector(
    `.manage-post-btn[data-post-id="${postId}"]`
  );

  if (isAuthor) {
    if (joinBtn) joinBtn.classList.add("d-none");
    if (cancelBtn) cancelBtn.classList.add("d-none");
    if (joinedBtn) joinedBtn.classList.add("d-none");
    if (manageBtn) manageBtn.classList.remove("d-none");
  } else if (manageBtn) {
    manageBtn.classList.add("d-none");
  }
}

/**
 * 공동구매 상품 목록 조회 및 렌더링
 */
async function loadPosts() {
  try {
    const templateElement = document.getElementById("posts-template");
    const gridElement = document.getElementById("posts-grid");

    // DOM 요소가 존재하는지 확인
    if (!templateElement || !gridElement) {
      console.error("Required DOM elements not found");
      return;
    }

    const response = await fetch(API_BASE_POSTS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();

    ensureHandlebarsHelpers();
    const template = Handlebars.compile(templateElement.innerHTML);
    gridElement.innerHTML = template({ posts });

    // 각 게시글에 대해 작성자/참여 여부 확인 및 UI 업데이트
    if (currentUser && currentUser.id) {
      const currentUserId = currentUser.id;
      const authoredPostIds = new Set(
        posts
          .filter((post) => post.authorId === currentUserId)
          .map((post) => post.id)
      );

      authoredPostIds.forEach((postId) => {
        updatePostCardForAuthor(postId, true);
      });

      const openPosts = posts.filter(
        (post) => post.status === "open" && !authoredPostIds.has(post.id)
      );
      for (const post of openPosts) {
        const isParticipant = await checkParticipationStatus(post.id);
        updatePostCardParticipationStatus(post.id, isParticipant);
      }
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    showToast("상품 목록을 불러오는 중 오류가 발생했습니다.", "error");
  }
}

/**
 * 로그인 버튼 클릭
 */
const loginBtn = document.getElementById("login-modal-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      const loginModal = new bootstrap.Modal(loginModalEl);
      loginModal.show();
    }
  });
}

/**
 * 회원가입 버튼 클릭
 */
const registerBtn = document.getElementById("register-modal-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    const registerModalEl = document.getElementById("registerModal");
    if (registerModalEl) {
      const registerModal = new bootstrap.Modal(registerModalEl);
      registerModal.show();
    }
  });
}

/**
 * 로그아웃 버튼 클릭
 */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}

/**
 * 로그인 폼 제출
 */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentId = document.getElementById("login-student-id").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!studentId || !password) {
      showToast("학번과 비밀번호를 모두 입력하세요.", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_USERS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          showToast("학번 또는 비밀번호가 올바르지 않습니다.", "error");
        } else {
          throw new Error(
            error.error || `HTTP error! status: ${response.status}`
          );
        }
        return;
      }

      const user = await response.json();
      saveUserToStorage(user);

      const loginModalEl = document.getElementById("loginModal");
      if (loginModalEl) {
        const loginModal = bootstrap.Modal.getInstance(loginModalEl);
        if (loginModal) {
          loginModal.hide();
        }
      }
      if (loginForm) {
        loginForm.reset();
      }

      showToast(`${user.nickname}님, 환영합니다! 🎉`, "success");
    } catch (error) {
      console.error("Error logging in:", error);
      showToast(`로그인 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  });
}

/**
 * 회원가입 폼 제출
 */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("register-email").value.trim();
    const passwordHash = document
      .getElementById("register-password")
      .value.trim();
    const nickname = document.getElementById("register-nickname").value.trim();
    const department = document
      .getElementById("register-department")
      .value.trim();
    const studentId = document
      .getElementById("register-student-id")
      .value.trim();

    if (!studentId) {
      showToast("학번은 필수 입력 항목입니다.", "warning");
      return;
    }

    const userData = {
      user: {
        email,
        passwordHash,
        nickname,
        studentId,
        ...(department && { department }),
      },
    };

    try {
      const response = await fetch(API_BASE_USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      const user = await response.json();
      saveUserToStorage(user);

      const registerModal = bootstrap.Modal.getInstance(
        document.getElementById("registerModal")
      );
      registerModal.hide();
      document.getElementById("register-form").reset();

      showToast(
        `회원가입이 완료되었습니다! 환영합니다, ${user.nickname}님! 🎉`,
        "success"
      );
    } catch (error) {
      console.error("Error registering:", error);
      const errorMessage = error.message.includes("EMAIL_ALREADY_EXISTS")
        ? "이미 사용 중인 이메일입니다."
        : error.message.includes("STUDENT_ID_ALREADY_EXISTS")
        ? "이미 사용 중인 학번입니다."
        : `회원가입 중 오류가 발생했습니다: ${error.message}`;
      showToast(errorMessage, "error");
    }
  });
}

/**
 * 상품 등록 버튼 클릭
 */
const createPostBtn = document.getElementById("create-post-btn");
if (createPostBtn) {
  createPostBtn.addEventListener("click", () => {
    if (!currentUser) {
      showToast("로그인이 필요합니다.", "warning");
      return;
    }

    const createPostModalEl = document.getElementById("createPostModal");
    if (createPostModalEl) {
      const createPostModal = new bootstrap.Modal(createPostModalEl);
      createPostModal.show();
    }
  });
}

/**
 * 이미지 파일 업로드
 */
async function uploadImages(files) {
  if (!files || files.length === 0) {
    return [];
  }

  const progressEl = document.getElementById("image-upload-progress");
  const progressBar = progressEl?.querySelector(".progress-bar");

  if (progressEl) progressEl.style.display = "block";
  if (progressBar) progressBar.style.width = "0%";

  const uploadedUrls = [];
  const totalFiles = files.length;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("images", file);

      const response = await fetch(`${API_BASE_UPLOAD}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `이미지 업로드 실패: ${file.name}`);
      }

      const data = await response.json();
      uploadedUrls.push(...data.images.map((img) => img.url));

      // 진행률 업데이트
      const progress = ((i + 1) / totalFiles) * 100;
      if (progressBar) progressBar.style.width = `${progress}%`;
    }

    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  } finally {
    if (progressEl) progressEl.style.display = "none";
    if (progressBar) progressBar.style.width = "0%";
  }
}

/**
 * 이미지 미리보기 업데이트
 */
function updateImagePreview(files) {
  const previewEl = document.getElementById("uploaded-images-preview");
  if (!previewEl) return;

  if (!files || files.length === 0) {
    previewEl.innerHTML = "";
    return;
  }

  // 모든 이미지를 비동기로 읽어서 미리보기 생성
  const promises = Array.from(files).map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    });
  });

  Promise.all(promises).then((previews) => {
    let previewHTML = '<div class="row g-2">';
    previews.forEach((preview, index) => {
      previewHTML += `
        <div class="col-md-3">
          <div class="position-relative">
            <img src="${preview.url}" alt="미리보기 ${index + 1}" 
                 class="img-fluid rounded" style="height: 100px; object-fit: cover; width: 100%;" />
            <span class="badge bg-secondary position-absolute top-0 end-0 m-1" style="font-size: 0.7rem;">${
              preview.name
            }</span>
          </div>
        </div>
      `;
    });
    previewHTML += "</div>";
    previewEl.innerHTML = previewHTML;
  });
}

/**
 * 이미지 파일 선택 이벤트
 */
const postImagesInput = document.getElementById("post-images");
if (postImagesInput) {
  postImagesInput.addEventListener("change", (e) => {
    const files = e.target.files;
    updateImagePreview(files);
  });
}

/**
 * 상품 등록 폼 제출
 */
const createPostForm = document.getElementById("create-post-form");
if (createPostForm) {
  createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const price = parseFloat(document.getElementById("post-price").value);
    const minParticipants = parseInt(
      document.getElementById("post-min-participants").value,
      10
    );
    const deadline = document.getElementById("post-deadline").value;
    const pickupLocation = document
      .getElementById("post-pickup-location")
      .value.trim();

    const imageFiles = document.getElementById("post-images").files;

    // 1. 이미지 파일 업로드
    let imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      try {
        imageUrls = await uploadImages(imageFiles);
        if (imageUrls.length > 0) {
          showToast(
            `${imageUrls.length}개의 이미지가 업로드되었습니다.`,
            "success",
            2000
          );
        }
      } catch (error) {
        showToast(
          `이미지 업로드 중 오류가 발생했습니다: ${error.message}`,
          "error"
        );
        return;
      }
    }

    const deadlineISO = deadline ? new Date(deadline).toISOString() : null;

    const postData = {
      post: {
        authorId: currentUser.id,
        title,
        content,
        price,
        minParticipants,
        deadline: deadlineISO,
        ...(pickupLocation && { pickupLocation }),
        ...(imageUrls.length > 0 && { images: imageUrls }),
      },
    };

    // 2. Post 생성
    try {
      const response = await fetch(API_BASE_POSTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      showToast("상품이 등록되었습니다! 🎉", "success");
      if (createPostForm) {
        createPostForm.reset();
        const previewEl = document.getElementById("uploaded-images-preview");
        if (previewEl) previewEl.innerHTML = "";
      }
      const createPostModalEl = document.getElementById("createPostModal");
      if (createPostModalEl) {
        const createPostModal = bootstrap.Modal.getInstance(createPostModalEl);
        if (createPostModal) {
          createPostModal.hide();
        }
      }
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      showToast(`상품 등록 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  });
}

/**
 * 상품 상세보기
 */
async function openPostDetail(postId) {
  try {
    const response = await fetch(`${API_BASE_POSTS}/${postId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const post = await response.json();

    document.getElementById("post-detail-title").textContent = post.title;

    let imagesHTML = "";
    if (post.images && post.images.length > 0) {
      imagesHTML = '<div class="mb-3"><div class="row g-2">';
      post.images.forEach((img) => {
        imagesHTML += `
          <div class="col-md-4">
            <img src="${img.imageUrl}" alt="${post.title}" class="img-fluid rounded" />
          </div>
        `;
      });
      imagesHTML += "</div></div>";
    }

    const statusBadge =
      {
        open: '<span class="badge bg-success">모집중</span>',
        closed: '<span class="badge bg-secondary">마감</span>',
        cancelled: '<span class="badge bg-danger">취소됨</span>',
      }[post.status] || "";

    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("ko-KR");
    };

    const isAuthor =
      !!currentUser && !!currentUser.id && post.authorId === currentUser.id;

    // 참여 여부 확인 (작성자는 제외)
    let isParticipant = false;
    if (!isAuthor && currentUser && currentUser.id && post.status === "open") {
      isParticipant = await checkParticipationStatus(post.id);
    }

    // 채팅방 정보 가져오기 (작성자 또는 참여자)
    let chatRoomId = null;
    if (currentUser && currentUser.id && (isParticipant || isAuthor)) {
      try {
        const chatRoomResponse = await fetch(`/api/chat/rooms/post/${post.id}`);
        if (chatRoomResponse.ok) {
          const chatRoom = await chatRoomResponse.json();
          chatRoomId = chatRoom.id;
        }
      } catch (error) {
        console.warn("채팅방 정보 조회 실패:", error);
      }
    }

    const buildChatLink = () => {
      if (!currentUser || !currentUser.id) return "#";
      const baseLink = `/chat?postId=${post.id}&userId=${currentUser.id}`;
      return chatRoomId ? `${baseLink}&chatRoomId=${chatRoomId}` : baseLink;
    };

    let actionSection = "";
    if (isAuthor && currentUser) {
      const chatLink = buildChatLink();
      actionSection = `
        <div class="border-top pt-3 mt-3">
          <div class="alert alert-primary mb-3" role="alert">
            작성자 전용 관리 메뉴입니다. 채팅방에서 참여자와 소통하세요.
          </div>
          <div class="d-grid gap-2">
            <a href="${chatLink}"
               class="btn btn-info w-100 text-white fw-bold"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
              💬 채팅방 관리
            </a>
          </div>
        </div>
      `;
    } else if (post.status === "open") {
      if (isParticipant && currentUser) {
        const chatLink = buildChatLink();
        actionSection = `
          <div class="border-top pt-3 mt-3">
            <div class="joined-status-container" data-post-id="${post.id}">
              <div class="d-flex align-items-center justify-content-center mb-3 p-2 rounded" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <span class="text-white fw-bold">✓ 참여중</span>
              </div>
              <div class="d-grid gap-2">
                <a href="${chatLink}"
                   class="btn btn-info w-100 text-white fw-bold"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                  💬 채팅방 입장
                </a>
                <button class="btn btn-outline-warning w-100 cancel-join-post-btn-detail" data-post-id="${post.id}" data-user-id="${currentUser.id}">
                  참여취소
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        actionSection = `
          <div class="border-top pt-3 mt-3">
            <button class="btn btn-success w-100 fw-bold join-post-btn-detail" data-post-id="${post.id}" style="font-size: 1.1rem; padding: 12px;">
              참여하기
            </button>
            <div class="d-none joined-status-container" data-post-id="${post.id}">
              <div class="d-flex align-items-center justify-content-center mb-3 p-2 rounded" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <span class="text-white fw-bold">✓ 참여중</span>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-warning w-100 cancel-join-post-btn-detail" data-post-id="${post.id}">
                  참여취소
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }

    document.getElementById("post-detail-body").innerHTML = `
      ${imagesHTML}
      <p class="mb-3">${post.content}</p>
      <div class="row mb-3">
        <div class="col-md-6">
          <p><strong>가격:</strong> <span class="text-primary fs-4">${
            post.price
          }원</span></p>
          <p><strong>상태:</strong> ${statusBadge}</p>
          <p><strong>최소 인원:</strong> ${post.minParticipants}명</p>
          <p><strong>현재 인원:</strong> ${post.currentQuantity}명</p>
        </div>
        <div class="col-md-6">
          <p><strong>마감일:</strong> ${formatDate(post.deadline)}</p>
          ${
            post.pickupLocation
              ? `<p><strong>픽업 장소:</strong> ${post.pickupLocation}</p>`
              : ""
          }
          <p><strong>작성일:</strong> ${formatDate(post.createdAt)}</p>
        </div>
      </div>
      ${actionSection}
    `;

    const detailModal = new bootstrap.Modal(
      document.getElementById("postDetailModal")
    );
    detailModal.show();
  } catch (error) {
    console.error("Error loading post detail:", error);
    showToast("상품 상세 정보를 불러오는 중 오류가 발생했습니다.", "error");
  }
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-post-btn")) {
    const postId = e.target.getAttribute("data-post-id");
    await openPostDetail(postId);
  }

  if (e.target.classList.contains("manage-post-btn")) {
    const postId = e.target.getAttribute("data-post-id");
    await openPostDetail(postId);
    return;
  }

  /**
   * 공동구매 참여 처리
   */
  async function handleJoinPost(postId, joinBtnElement = null) {
    if (!currentUser || !currentUser.id) {
      showToast("로그인이 필요합니다.", "warning");
      return;
    }

    // 버튼 상태 업데이트 (참여중... 표시)
    if (joinBtnElement) {
      joinBtnElement.textContent = "참여중...";
      joinBtnElement.disabled = true;
    }

    try {
      // 먼저 이미 참여했는지 확인
      const checkUrl = `${API_BASE_POSTS}/${postId}/participate/${currentUser.id}`;
      console.log("참여 여부 확인 URL:", checkUrl);

      const checkResponse = await fetch(checkUrl);

      // 응답이 성공적이지 않으면 참여하지 않은 것으로 간주하고 계속 진행
      let isAlreadyParticipant = false;
      if (checkResponse.ok) {
        try {
          const checkData = await checkResponse.json();
          isAlreadyParticipant = checkData.isParticipant || false;
          console.log("참여 여부:", isAlreadyParticipant);
        } catch (e) {
          // JSON 파싱 실패 시 무시하고 계속 진행
          console.warn("참여 여부 확인 실패, 계속 진행:", e);
        }
      } else {
        console.warn(
          `참여 여부 확인 실패 (${checkResponse.status}), 계속 진행`
        );
      }

      if (isAlreadyParticipant) {
        showToast("이미 참여한 공동구매입니다.", "info");
        return;
      }

      // 참여하기
      const participateUrl = `${API_BASE_POSTS}/${postId}/participate`;
      console.log("참여하기 URL:", participateUrl);
      console.log("요청 데이터:", { userId: currentUser.id });

      const response = await fetch(participateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });

      console.log("응답 상태:", response.status, response.statusText);

      // 응답이 성공적이지 않으면 에러 처리
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const contentType = response.headers.get("content-type");

        // JSON 응답인 경우에만 파싱 시도
        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch (e) {
            // JSON 파싱 실패 시 기본 메시지 사용
            console.error("Error parsing error response:", e);
          }
        } else {
          // HTML 응답인 경우 (404 페이지 등)
          const text = await response.text();
          console.error(
            "Server returned HTML instead of JSON:",
            text.substring(0, 200)
          );
          errorMessage = `서버 오류 (${response.status}): API 엔드포인트를 찾을 수 없습니다.`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      showToast("공동구매에 참여했습니다! 채팅방으로 이동합니다...", "success");

      // 채팅방 정보 가져오기
      let chatRoomId = null;
      try {
        const chatRoomResponse = await fetch(`/api/chat/rooms/post/${postId}`);
        if (chatRoomResponse.ok) {
          const chatRoom = await chatRoomResponse.json();
          chatRoomId = chatRoom.id;
        }
      } catch (error) {
        console.warn("채팅방 정보 조회 실패:", error);
      }

      // UI 업데이트: 상세 모달이 열려있으면 버튼 상태 변경
      const detailModal = bootstrap.Modal.getInstance(
        document.getElementById("postDetailModal")
      );
      if (detailModal && detailModal._isShown) {
        const joinBtn = document.querySelector(
          `.join-post-btn-detail[data-post-id="${postId}"]`
        );
        const joinedContainer = document.querySelector(
          `.joined-status-container[data-post-id="${postId}"]`
        );
        const cancelBtn = joinedContainer?.querySelector(
          `.cancel-join-post-btn-detail[data-post-id="${postId}"]`
        );

        if (joinBtn) joinBtn.classList.add("d-none");
        if (joinedContainer) {
          joinedContainer.classList.remove("d-none");
          if (cancelBtn) {
            cancelBtn.setAttribute("data-user-id", currentUser.id);
          }

          // 채팅방 입장 버튼 추가
          const chatButtonHTML = chatRoomId
            ? `<a href="/chat?postId=${postId}&userId=${currentUser.id}&chatRoomId=${chatRoomId}" 
                   class="btn btn-info w-100 text-white fw-bold mb-2" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                  💬 채팅방 입장
                </a>`
            : `<a href="/chat?postId=${postId}&userId=${currentUser.id}" 
                   class="btn btn-info w-100 text-white fw-bold mb-2" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                  💬 채팅방 입장
                </a>`;

          // 참여중 상태 표시 추가
          const statusHTML = `<div class="d-flex align-items-center justify-content-center mb-3 p-2 rounded" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <span class="text-white fw-bold">✓ 참여중</span>
          </div>`;

          // 기존 내용을 유지하면서 채팅방 버튼과 상태 표시 추가
          if (!joinedContainer.querySelector(".text-white.fw-bold")) {
            joinedContainer.insertAdjacentHTML("afterbegin", statusHTML);
          }
          if (!joinedContainer.querySelector('a[href*="/chat"]')) {
            const cancelBtnParent = cancelBtn?.parentElement;
            if (cancelBtnParent) {
              cancelBtnParent.insertAdjacentHTML("beforebegin", chatButtonHTML);
            }
          }
        }
      }

      // UI 업데이트: 카드 뷰에서도 버튼 상태 변경
      const cardJoinBtn = document.querySelector(
        `.join-post-btn[data-post-id="${postId}"]`
      );
      const cardJoinedContainer = document.querySelector(
        `.joined-status-container[data-post-id="${postId}"]`
      );
      const cardCancelBtn = cardJoinedContainer?.querySelector(
        `.cancel-join-post-btn[data-post-id="${postId}"]`
      );

      if (cardJoinBtn) cardJoinBtn.classList.add("d-none");
      if (cardJoinedContainer) {
        cardJoinedContainer.classList.remove("d-none");
        if (cardCancelBtn) {
          cardCancelBtn.setAttribute("data-user-id", currentUser.id);
        }
      }

      // 게시글 목록 새로고침
      loadPosts();

      // 상세 모달이 열려있으면 닫기
      if (detailModal) {
        detailModal.hide();
      }

      // 채팅방 조회/생성 후 채팅 페이지로 이동
      try {
        const chatRoomResponse = await fetch(`/api/chat/rooms/post/${postId}`);

        if (chatRoomResponse.ok) {
          const chatRoom = await chatRoomResponse.json();
          // 채팅 페이지로 이동 (Post ID와 User ID를 쿼리 파라미터로 전달)
          window.location.href = `/chat?postId=${postId}&userId=${currentUser.id}&chatRoomId=${chatRoom.id}`;
        } else {
          // 채팅방 생성 실패 시에도 채팅 페이지로 이동 (수동 입력 가능)
          window.location.href = `/chat?postId=${postId}&userId=${currentUser.id}`;
        }
      } catch (error) {
        console.error("채팅방 조회 실패:", error);
        // 에러가 발생해도 채팅 페이지로 이동
        window.location.href = `/chat?postId=${postId}&userId=${currentUser.id}`;
      }
    } catch (error) {
      console.error("Error joining post:", error);

      // 에러 발생 시 버튼 상태 복원
      if (joinBtnElement) {
        joinBtnElement.textContent = "참여하기";
        joinBtnElement.disabled = false;
      }

      if (error.message.includes("ALREADY_PARTICIPATED")) {
        showToast("이미 참여한 공동구매입니다.", "warning");
      } else if (error.message.includes("AUTHOR_CANNOT_JOIN")) {
        showToast("작성자는 참여할 수 없습니다.", "warning");
      } else if (error.message.includes("POST_NOT_OPEN")) {
        showToast("마감되었거나 취소된 공동구매입니다.", "warning");
      } else if (
        error.message.includes("404") ||
        error.message.includes("찾을 수 없습니다")
      ) {
        showToast(
          "API 엔드포인트를 찾을 수 없습니다. 서버를 확인해주세요.",
          "error"
        );
      } else {
        showToast(`참여 중 오류가 발생했습니다: ${error.message}`, "error");
      }
    }
  }

  /**
   * 공동구매 참여 취소 처리
   */
  async function handleLeavePost(
    postId,
    userId,
    cancelBtnElement = null,
    isDetailModal = false
  ) {
    if (!currentUser || !currentUser.id) {
      showToast("로그인이 필요합니다.", "warning");
      return;
    }

    // 버튼 상태 업데이트 (취소중... 표시)
    if (cancelBtnElement) {
      cancelBtnElement.textContent = "취소중...";
      cancelBtnElement.disabled = true;
    }

    try {
      const leaveUrl = `${API_BASE_POSTS}/${postId}/participate/${userId}`;
      console.log("참여 취소 URL:", leaveUrl);

      const response = await fetch(leaveUrl, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
        }

        throw new Error(errorMessage);
      }

      showToast("공동구매 참여를 취소했습니다.", "success");

      // UI 업데이트: 상세 모달이 열려있으면 버튼 상태 변경
      const detailModal = bootstrap.Modal.getInstance(
        document.getElementById("postDetailModal")
      );
      if (isDetailModal && detailModal && detailModal._isShown) {
        const joinBtn = document.querySelector(
          `.join-post-btn-detail[data-post-id="${postId}"]`
        );
        const joinedContainer = document.querySelector(
          `.joined-status-container[data-post-id="${postId}"]`
        );

        if (joinBtn) joinBtn.classList.remove("d-none");
        if (joinedContainer) joinedContainer.classList.add("d-none");
      }

      // UI 업데이트: 카드 뷰에서도 버튼 상태 변경
      const cardJoinBtn = document.querySelector(
        `.join-post-btn[data-post-id="${postId}"]`
      );
      const cardJoinedContainer = document.querySelector(
        `.joined-status-container[data-post-id="${postId}"]`
      );

      if (cardJoinBtn) cardJoinBtn.classList.remove("d-none");
      if (cardJoinedContainer) cardJoinedContainer.classList.add("d-none");

      // 게시글 목록 새로고침
      loadPosts();
    } catch (error) {
      console.error("Error leaving post:", error);

      // 에러 발생 시 버튼 상태 복원
      if (cancelBtnElement) {
        cancelBtnElement.textContent = "취소하기";
        cancelBtnElement.disabled = false;
      }

      showToast(`참여 취소 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  }

  // 참여하기 버튼 (카드에서)
  if (e.target.classList.contains("join-post-btn")) {
    if (!currentUser) {
      showToast("로그인이 필요합니다.", "warning");
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    handleJoinPost(postId, e.target);
  }

  // 참여하기 버튼 (상세 모달에서)
  if (e.target.classList.contains("join-post-btn-detail")) {
    if (!currentUser) {
      showToast("로그인이 필요합니다.", "warning");
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    handleJoinPost(postId, e.target);
  }

  // 취소하기 버튼 (카드에서)
  if (e.target.classList.contains("cancel-join-post-btn")) {
    if (!currentUser) {
      showToast("로그인이 필요합니다.", "warning");
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    const userId = e.target.getAttribute("data-user-id") || currentUser.id;
    handleLeavePost(postId, userId, e.target, false);
  }

  // 취소하기 버튼 (상세 모달에서)
  if (e.target.classList.contains("cancel-join-post-btn-detail")) {
    if (!currentUser) {
      showToast("로그인이 필요합니다.", "warning");
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    const userId = e.target.getAttribute("data-user-id") || currentUser.id;
    handleLeavePost(postId, userId, e.target, true);
  }
});

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", () => {
  loadUserFromStorage();
  loadPosts();
});
