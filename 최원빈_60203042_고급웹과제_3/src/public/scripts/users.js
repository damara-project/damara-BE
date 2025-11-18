// 고급웹프로그래밍_3_최원빈_60203042
// src/public/scripts/users.js

const API_BASE = '/api/users';

/**
 * 회원 목록 조회 및 렌더링
 */
async function loadUsers() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();

    // Handlebars 헬퍼 등록
    Handlebars.registerHelper('formatDate', function(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR');
    });

    const template = Handlebars.compile(
      document.getElementById('all-users-template').innerHTML
    );

    document.getElementById('all-users-anchor').innerHTML = template({ users });
  } catch (error) {
    console.error('Error loading users:', error);
    alert('회원 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 회원 등록
 */
document.getElementById('create-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('user-email').value.trim();
  const passwordHash = document.getElementById('user-password-hash').value.trim();
  const nickname = document.getElementById('user-nickname').value.trim();
  const department = document.getElementById('user-department').value.trim();
  const studentId = document.getElementById('user-student-id').value.trim();
  const avatarUrl = document.getElementById('user-avatar-url').value.trim();

  const userData = {
    user: {
      email,
      passwordHash,
      nickname,
      ...(department && { department }),
      ...(studentId && { studentId }),
      ...(avatarUrl && { avatarUrl }),
    },
  };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    alert('회원이 등록되었습니다.');
    document.getElementById('create-user-form').reset();
    loadUsers();
  } catch (error) {
    console.error('Error creating user:', error);
    alert(`회원 등록 중 오류가 발생했습니다: ${error.message}`);
  }
});

/**
 * 회원 수정
 */
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-user-btn')) {
    const userId = e.target.getAttribute('data-user-id');
    const userItem = e.target.closest('.user-item');
    const normalView = userItem.querySelector('.normal-view');
    const editView = userItem.querySelector('.edit-view');

    normalView.style.display = 'none';
    editView.style.display = 'block';
  }

  if (e.target.classList.contains('cancel-edit-btn')) {
    const userId = e.target.getAttribute('data-user-id');
    const userItem = e.target.closest('.user-item');
    const normalView = userItem.querySelector('.normal-view');
    const editView = userItem.querySelector('.edit-view');

    normalView.style.display = 'block';
    editView.style.display = 'none';
  }

  if (e.target.classList.contains('delete-user-btn')) {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    const userId = e.target.getAttribute('data-user-id');

    try {
      const response = await fetch(`${API_BASE}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      alert('회원이 삭제되었습니다.');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`회원 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }
});

/**
 * 회원 수정 폼 제출
 */
document.addEventListener('submit', async (e) => {
  if (e.target.classList.contains('edit-user-form')) {
    e.preventDefault();

    const userId = e.target.getAttribute('data-user-id');
    const email = e.target.querySelector('.user-email-edit').value.trim();
    const passwordHash = e.target.querySelector('.user-password-hash-edit').value.trim();
    const nickname = e.target.querySelector('.user-nickname-edit').value.trim();
    const department = e.target.querySelector('.user-department-edit').value.trim();
    const studentId = e.target.querySelector('.user-student-id-edit').value.trim();
    const avatarUrl = e.target.querySelector('.user-avatar-url-edit').value.trim();

    const userData = {
      user: {
        email,
        nickname,
        ...(passwordHash && { passwordHash }),
        ...(department && { department }),
        ...(studentId && { studentId }),
        ...(avatarUrl && { avatarUrl }),
      },
    };

    try {
      const response = await fetch(`${API_BASE}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      alert('회원 정보가 수정되었습니다.');
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`회원 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  }
});

/**
 * 새로고침 버튼
 */
document.getElementById('refresh-users-btn').addEventListener('click', () => {
  loadUsers();
});

// 페이지 로드 시 회원 목록 불러오기
loadUsers();

