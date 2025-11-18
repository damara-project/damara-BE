// src/public/scripts/main.js

const API_BASE_POSTS = "/api/posts";
const API_BASE_USERS = "/api/users";
const API_BASE_UPLOAD = "/api/upload";

// 현재 로그인한 사용자 정보
let currentUser = null;

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

    // Handlebars 헬퍼 등록
    Handlebars.registerHelper("eq", function (a, b) {
      return a === b;
    });

    Handlebars.registerHelper("formatDate", function (dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("ko-KR");
    });

    Handlebars.registerHelper("truncate", function (str, len) {
      if (!str || str.length <= len) return str;
      return str.substring(0, len) + "...";
    });

    const template = Handlebars.compile(templateElement.innerHTML);
    gridElement.innerHTML = template({ posts });
  } catch (error) {
    console.error("Error loading posts:", error);
    alert("상품 목록을 불러오는 중 오류가 발생했습니다.");
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
      alert("학번과 비밀번호를 모두 입력하세요.");
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
          alert("학번 또는 비밀번호가 올바르지 않습니다.");
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

      alert("로그인되었습니다!");
    } catch (error) {
      console.error("Error logging in:", error);
      alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
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
      alert("학번은 필수 입력 항목입니다.");
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

      alert("회원가입이 완료되었습니다!");
    } catch (error) {
      console.error("Error registering:", error);
      alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
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
      alert("로그인이 필요합니다.");
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
      } catch (error) {
        alert(`이미지 업로드 중 오류가 발생했습니다: ${error.message}`);
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

      alert("상품이 등록되었습니다.");
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
      alert(`상품 등록 중 오류가 발생했습니다: ${error.message}`);
    }
  });
}

/**
 * 상품 상세보기
 */
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-post-btn")) {
    const postId = e.target.getAttribute("data-post-id");

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
        ${
          post.status === "open"
            ? `
          <button class="btn btn-success w-100 join-post-btn-detail" data-post-id="${post.id}">
            참여하기
          </button>
        `
            : ""
        }
      `;

      const detailModal = new bootstrap.Modal(
        document.getElementById("postDetailModal")
      );
      detailModal.show();
    } catch (error) {
      console.error("Error loading post detail:", error);
      alert("상품 상세 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }

  // 참여하기 버튼 (카드에서)
  if (e.target.classList.contains("join-post-btn")) {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    alert("참여하기 기능은 추후 구현 예정입니다.");
    // TODO: 참여하기 기능 구현
  }

  // 참여하기 버튼 (상세 모달에서)
  if (e.target.classList.contains("join-post-btn-detail")) {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
      return;
    }

    const postId = e.target.getAttribute("data-post-id");
    alert("참여하기 기능은 추후 구현 예정입니다.");
    // TODO: 참여하기 기능 구현
  }
});

/**
 * 새로고침 버튼
 */
const refreshBtn = document.getElementById("refresh-posts-btn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadPosts();
  });
}

// 페이지 로드 시 초기화
window.addEventListener("DOMContentLoaded", () => {
  loadUserFromStorage();
  loadPosts();
});
