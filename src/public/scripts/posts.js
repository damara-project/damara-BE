// src/public/scripts/posts.js

const API_BASE = '/api/posts';

/**
 * 공동구매 상품 목록 조회 및 렌더링
 */
async function loadPosts() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();

    // Handlebars 헬퍼 등록
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    Handlebars.registerHelper('formatDate', function(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR');
    });

    const template = Handlebars.compile(
      document.getElementById('all-posts-template').innerHTML
    );

    document.getElementById('all-posts-anchor').innerHTML = template({ posts });
  } catch (error) {
    console.error('Error loading posts:', error);
    alert('상품 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 상품 등록
 */
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const authorId = document.getElementById('author-id').value.trim();
  const title = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const price = parseFloat(document.getElementById('post-price').value);
  const minParticipants = parseInt(document.getElementById('post-min-participants').value, 10);
  const deadline = document.getElementById('post-deadline').value;
  const pickupLocation = document.getElementById('post-pickup-location').value.trim();
  const imagesText = document.getElementById('post-images').value.trim();

  // 이미지 URL 배열 생성 (빈 줄 제거 + 유효한 URL만 필터링)
  const images = imagesText
    ? imagesText
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          // 빈 줄 제거
          if (!line.length) return false;
          // URL 형식인지 검증 (http:// 또는 https://로 시작하는지 확인)
          try {
            const url = new URL(line);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            // 유효하지 않은 URL은 제거
            return false;
          }
        })
    : [];

  // deadline을 ISO 8601 형식으로 변환
  const deadlineISO = deadline ? new Date(deadline).toISOString() : null;

  const postData = {
    post: {
      authorId,
      title,
      content,
      price,
      minParticipants,
      deadline: deadlineISO,
      ...(pickupLocation && { pickupLocation }),
      ...(images.length > 0 && { images }),
    },
  };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    alert('상품이 등록되었습니다.');
    document.getElementById('create-post-form').reset();
    loadPosts();
  } catch (error) {
    console.error('Error creating post:', error);
    alert(`상품 등록 중 오류가 발생했습니다: ${error.message}`);
  }
});

/**
 * 상품 수정
 */
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-post-btn')) {
    const postId = e.target.getAttribute('data-post-id');
    const postItem = e.target.closest('.post-item');
    const normalView = postItem.querySelector('.normal-view');
    const editView = postItem.querySelector('.edit-view');

    normalView.style.display = 'none';
    editView.style.display = 'block';
  }

  if (e.target.classList.contains('cancel-edit-btn')) {
    const postId = e.target.getAttribute('data-post-id');
    const postItem = e.target.closest('.post-item');
    const normalView = postItem.querySelector('.normal-view');
    const editView = postItem.querySelector('.edit-view');

    normalView.style.display = 'block';
    editView.style.display = 'none';
  }

  if (e.target.classList.contains('delete-post-btn')) {
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
      loadPosts();
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
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert(`상품 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  }
});

/**
 * 새로고침 버튼
 */
document.getElementById('refresh-posts-btn').addEventListener('click', () => {
  loadPosts();
});

// 페이지 로드 시 상품 목록 불러오기
loadPosts();

