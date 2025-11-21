// API URL
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// Biến toàn cục
let allUsers = []; // Lưu trữ tất cả users từ API
let currentPage = 1; // Trang hiện tại
const usersPerPage = 5; // Số users mỗi trang
let filteredUsers = []; // Users sau khi tìm kiếm
let isEditing = false; // Đang chỉnh sửa hay thêm mới
let editingUserId = null; // ID của user đang chỉnh sửa
let deleteUserId = null; // ID của user chuẩn bị xóa

// Lấy các phần tử DOM
const usersTableBody = document.getElementById('usersTableBody');
const searchInput = document.getElementById('searchInput');
const addUserBtn = document.getElementById('addUserBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Modal elements
const userModal = document.getElementById('userModal');
const deleteModal = document.getElementById('deleteModal');
const modalTitle = document.getElementById('modalTitle');
const userForm = document.getElementById('userForm');
const closeBtns = document.getElementsByClassName('close');

// Form inputs
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const userPhoneInput = document.getElementById('userPhone');
const userWebsiteInput = document.getElementById('userWebsite');

// Delete modal elements
const deleteUserNameSpan = document.getElementById('deleteUserName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// ========== KHỞI TẠO ỨNG DỤNG ==========
async function init() {
    await fetchUsers();
    setupEventListeners();
}

// ========== LẤY DANH SÁCH USERS TỪ API ==========
async function fetchUsers() {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách người dùng');
        }
        
        allUsers = await response.json();
        filteredUsers = [...allUsers];
        currentPage = 1;
        displayUsers();
        
    } catch (error) {
        showError('Lỗi: ' + error.message);
        console.error('Error fetching users:', error);
    } finally {
        showLoading(false);
    }
}

// ========== HIỂN THỊ USERS LÊN BẢNG ==========
function displayUsers() {
    // Tính toán phân trang
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
    
    // Xóa nội dung cũ
    usersTableBody.innerHTML = '';
    
    // Nếu không có users
    if (usersToDisplay.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <h3>Không tìm thấy người dùng</h3>
                    <p>Thử tìm kiếm với từ khóa khác</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Hiển thị từng user
    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td class="action-buttons">
                <button class="btn btn-success" onclick="openEditModal(${user.id})">Edit</button>
                <button class="btn btn-danger" onclick="openDeleteModal(${user.id})">Delete</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    updatePagination();
}

// ========== CẬP NHẬT PHÂN TRANG ==========
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    // Cập nhật thông tin trang
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable nút Previous và Next
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// ========== TÌM KIẾM USERS ==========
function searchUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayUsers();
}

// ========== MỞ MODAL THÊM USER MỚI ==========
function openAddModal() {
    isEditing = false;
    editingUserId = null;
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userModal.style.display = 'block';
}

// ========== MỞ MODAL CHỈNH SỬA USER ==========
function openEditModal(userId) {
    isEditing = true;
    editingUserId = userId;
    modalTitle.textContent = 'Edit User';
    
    const user = allUsers.find(u => u.id === userId);
    
    if (user) {
        userNameInput.value = user.name;
        userEmailInput.value = user.email;
        userPhoneInput.value = user.phone;
        userWebsiteInput.value = user.website || '';
        userModal.style.display = 'block';
    }
}

// ========== MỞ MODAL XÁC NHẬN XÓA ==========
function openDeleteModal(userId) {
    deleteUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    
    if (user) {
        deleteUserNameSpan.textContent = user.name;
        deleteModal.style.display = 'block';
    }
}

// ========== ĐÓNG MODAL ==========
function closeModal(modal) {
    modal.style.display = 'none';
}

// ========== LƯU USER (THÊM MỚI HOẶC CẬP NHẬT) ==========
async function saveUser(event) {
    event.preventDefault();
    
    const userData = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim(),
        phone: userPhoneInput.value.trim(),
        website: userWebsiteInput.value.trim()
    };
    
    // Kiểm tra dữ liệu
    if (!userData.name || !userData.email || !userData.phone) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    try {
        showLoading(true);
        
        if (isEditing) {
            await updateUser(editingUserId, userData);
        } else {
            await createUser(userData);
        }
        
        closeModal(userModal);
        
    } catch (error) {
        showError('Lỗi: ' + error.message);
        console.error('Error saving user:', error);
    } finally {
        showLoading(false);
    }
}

// ========== THÊM USER MỚI ==========
async function createUser(userData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Không thể tạo người dùng mới');
        }
        
        const newUser = await response.json();
        
        // Cập nhật UI thủ công (vì JSONPlaceholder không lưu thật)
        // Tạo ID mới dựa trên ID lớn nhất hiện tại
        const maxId = Math.max(...allUsers.map(u => u.id), 0);
        newUser.id = maxId + 1;
        
        allUsers.unshift(newUser); // Thêm vào đầu mảng
        filteredUsers = [...allUsers];
        currentPage = 1;
        displayUsers();
        
        showError('Thêm người dùng thành công!', 'success');
        
    } catch (error) {
        throw error;
    }
}

// ========== CẬP NHẬT USER ==========
async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Không thể cập nhật người dùng');
        }
        
        const updatedUser = await response.json();
        
        // Cập nhật UI thủ công
        const index = allUsers.findIndex(u => u.id === userId);
        if (index !== -1) {
            allUsers[index] = { ...allUsers[index], ...userData };
        }
        
        filteredUsers = [...allUsers];
        displayUsers();
        
        showError('Cập nhật người dùng thành công!', 'success');
        
    } catch (error) {
        throw error;
    }
}

// ========== XÓA USER ==========
async function deleteUser() {
    if (!deleteUserId) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/${deleteUserId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Không thể xóa người dùng');
        }
        
        // Cập nhật UI thủ công
        allUsers = allUsers.filter(u => u.id !== deleteUserId);
        filteredUsers = [...allUsers];
        
        // Điều chỉnh trang nếu cần
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        displayUsers();
        closeModal(deleteModal);
        
        showError('Xóa người dùng thành công!', 'success');
        
    } catch (error) {
        showError('Lỗi: ' + error.message);
        console.error('Error deleting user:', error);
    } finally {
        showLoading(false);
        deleteUserId = null;
    }
}

// ========== HIỂN THỊ/ẨN LOADING ==========
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// ========== HIỂN THỊ THÔNG BÁO LỖI ==========
function showError(message, type = 'error') {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = type === 'success' ? '#d4edda' : '#ffe5e5';
    errorMessage.style.color = type === 'success' ? '#155724' : '#d32f2f';
    errorMessage.style.borderLeftColor = type === 'success' ? '#28a745' : '#d32f2f';
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        hideError();
    }, 3000);
}

// ========== ẨN THÔNG BÁO LỖI ==========
function hideError() {
    errorMessage.style.display = 'none';
}

// ========== THIẾT LẬP CÁC SỰ KIỆN ==========
function setupEventListeners() {
    // Tìm kiếm
    searchInput.addEventListener('input', searchUsers);
    
    // Nút Add User
    addUserBtn.addEventListener('click', openAddModal);
    
    // Phân trang
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
        }
    });
    
    // Đóng modal khi click vào nút X
    Array.from(closeBtns).forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Submit form
    userForm.addEventListener('submit', saveUser);
    
    // Nút Cancel trong modal
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(userModal);
            closeModal(deleteModal);
        });
    });
    
    // Nút Confirm Delete
    confirmDeleteBtn.addEventListener('click', deleteUser);
}

// ========== KHỞI CHẠY ỨNG DỤNG ==========
document.addEventListener('DOMContentLoaded', init);
