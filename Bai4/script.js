document.addEventListener('DOMContentLoaded', function() {

    // --- LẤY CÁC PHẦN TỬ DOM ---
    // Từ Bài 3
    const searchInput = document.getElementById('searchInput');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    
    // Mới cho Bài 4
    const addProductSection = document.getElementById('add-product-section');
    const addProductForm = document.getElementById('addProductForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const productsContainer = document.querySelector('.products-container');

    // Các trường input trong form
    const newNameInput = document.getElementById('newName');
    const newAuthorInput = document.getElementById('newAuthor');
    const newPriceInput = document.getElementById('newPrice');
    const newDescInput = document.getElementById('newDesc');
    const errorMsg = document.getElementById('errorMsg');

    // --- CHỨC NĂNG 1: TÌM KIẾM SẢN PHẨM (Đã cải tiến) ---
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        // Lấy lại danh sách sản phẩm mỗi lần tìm kiếm để bao gồm cả sản phẩm mới
        const allProducts = document.querySelectorAll('.product-item'); 
        
        allProducts.forEach(function(product) {
            const productName = product.querySelector('.product-info h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block'; // Dùng 'block' thay vì 'grid' hoặc 'flex' để đơn giản
            } else {
                product.style.display = 'none';
            }
        });
    }
    searchInput.addEventListener('keyup', filterProducts);

    // --- CHỨC NĂNG 2: ẨN/HIỆN FORM ---
    toggleFormBtn.addEventListener('click', function() {
        addProductSection.classList.toggle('hidden');
    });

    cancelBtn.addEventListener('click', function() {
        addProductSection.classList.add('hidden');
        addProductForm.reset(); // Xóa dữ liệu đã nhập
        errorMsg.textContent = ''; // Xóa thông báo lỗi
    });

    // --- CHỨC NĂNG 3: THÊM SẢN PHẨM MỚI KHI SUBMIT FORM ---
    addProductForm.addEventListener('submit', function(event) {
        // 1. Ngăn chặn hành vi mặc định của form (tải lại trang)
        event.preventDefault();

        // 2. Lấy giá trị từ các ô input và xóa khoảng trắng thừa
        const name = newNameInput.value.trim();
        const author = newAuthorInput.value.trim();
        const price = parseFloat(newPriceInput.value.trim());
        const desc = newDescInput.value.trim();

        // 3. Kiểm tra dữ liệu (Validation)
        if (name === '' || author === '' || isNaN(price) || price <= 0) {
            errorMsg.textContent = 'Vui lòng nhập đầy đủ Tên sách, Tác giả và Giá hợp lệ!';
            return; // Dừng hàm nếu dữ liệu không hợp lệ
        }

        // 4. Nếu hợp lệ, xóa thông báo lỗi
        errorMsg.textContent = '';

        // 5. Tạo một card sản phẩm mới bằng HTML string
        const newProductCard = document.createElement('article');
        newProductCard.classList.add('product-item');
        
        newProductCard.innerHTML = `
            <div class="product-image">
                <img src="https://via.placeholder.com/400x600.png?text=${name.replace(' ', '+')}" alt="${name} Book Cover">
            </div>
            <div class="product-info">
                <h3>${name}</h3>
                <p class="author">Author: ${author}</p>
                <p class="description">${desc}</p>
                <div class="product-price">
                    <span class="price">$${price.toFixed(2)}</span>
                    <button class="btn-add-cart">Add to Cart</button>
                </div>
            </div>
        `;

        // 6. Thêm card mới vào đầu danh sách sản phẩm
        productsContainer.prepend(newProductCard);

        // 7. Reset (xóa trắng) form và ẩn đi
        addProductForm.reset();
        addProductSection.classList.add('hidden');
    });
});