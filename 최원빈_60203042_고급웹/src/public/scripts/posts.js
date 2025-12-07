// src/public/scripts/posts.js

const API_BASE = '/api/posts';

const studentForm = document.getElementById('student-search-form');
const studentInput = document.getElementById('student-id-input');
const clearStudentBtn = document.getElementById('clear-student-btn');
const refreshBtn = document.getElementById('refresh-user-posts-btn');
const hideSectionBtn = document.getElementById('hide-user-posts-btn');
const postsSection = document.getElementById('user-posts-section');
const currentStudentLabel = document.getElementById('current-student-id');
const postsAnchor = document.getElementById('user-posts-anchor');

let currentStudentId = null;

let helpersRegistered = false;

function ensureHelpers() {
  if (helpersRegistered || typeof Handlebars === 'undefined') {
    return;
  }

  Handlebars.registerHelper('eq', function(a, b, options) {
    if (options && typeof options.fn === 'function') {
      return a === b ? options.fn(this) : options.inverse(this);
    }
    return a === b;
  });

  Handlebars.registerHelper('formatDate', function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  });

  Handlebars.registerHelper('formatPrice', function(value) {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return value;
    }
    return num.toLocaleString('ko-KR');
  });

  helpersRegistered = true;
}

function renderPosts(posts) {
  const templateEl = document.getElementById('user-posts-template');
  if (!templateEl) {
    return;
  }
  ensureHelpers();
  const template = Handlebars.compile(templateEl.innerHTML);
  postsAnchor.innerHTML = template({ posts });
}

async function loadPostsByStudentId(studentId) {
  if (!studentId) {
    alert('학번을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/student/${encodeURIComponent(studentId)}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    currentStudentId = studentId;
    currentStudentLabel.textContent = studentId;
    postsSection.classList.remove('d-none');
    renderPosts(posts);
  } catch (error) {
    console.error('Error loading user posts:', error);
    alert(`상품 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 작성자 학번 검색
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = studentInput.value.trim();
  await loadPostsByStudentId(studentId);
});

// 초기화 버튼
clearStudentBtn.addEventListener('click', () => {
  studentInput.value = '';
  postsSection.classList.add('d-none');
  postsAnchor.innerHTML = '';
  currentStudentLabel.textContent = '';
  currentStudentId = null;
});

// 섹션 숨기기
hideSectionBtn.addEventListener('click', () => {
  postsSection.classList.add('d-none');
});

// 새로고침 버튼
refreshBtn.addEventListener('click', () => {
  if (!currentStudentId) {
    alert('먼저 학번을 조회해주세요.');
    return;
  }
  loadPostsByStudentId(currentStudentId);
});

/**
 * 상품 수정/삭제 버튼 토글
 */
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-post-btn')) {
    const postItem = e.target.closest('.post-item');
    const normalView = postItem.querySelector('.normal-view');
    const editView = postItem.querySelector('.edit-view');

    normalView.style.display = 'none';
    editView.style.display = 'block';
  } else if (e.target.classList.contains('cancel-edit-btn')) {
    const postItem = e.target.closest('.post-item');
    const normalView = postItem.querySelector('.normal-view');
    const editView = postItem.querySelector('.edit-view');

    normalView.style.display = 'block';
    editView.style.display = 'none';
  } else if (e.target.classList.contains('delete-post-btn')) {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    const postId = e.target.getAttribute('data-post-id');

    try {
      const response = await fetch(`${API_BASE}/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      alert('상품이 삭제되었습니다.');
      if (currentStudentId) {
        loadPostsByStudentId(currentStudentId);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`상품 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }
});

/**
 * 상품 수정 폼 제출
 */
document.addEventListener('submit', async (e) => {
  if (e.target.classList.contains('edit-post-form')) {
    e.preventDefault();

    const postId = e.target.getAttribute('data-post-id');
    const title = e.target.querySelector('.post-title-edit').value.trim();
    const content = e.target.querySelector('.post-content-edit').value.trim();
    const price = parseFloat(e.target.querySelector('.post-price-edit').value);
    const status = e.target.querySelector('.post-status-edit').value;

    const postData = {
      post: {
        title,
        content,
        price,
        status,
      },
    };

    try {
      const response = await fetch(`${API_BASE}/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      alert('상품이 수정되었습니다.');
      if (currentStudentId) {
        loadPostsByStudentId(currentStudentId);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert(`상품 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  }
});
