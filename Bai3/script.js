// Chờ cho toàn bộ trang web được tải xong rồi mới thực thi mã JavaScript
document.addEventListener('DOMContentLoaded', function() {

    // --- Lấy các phần tử HTML mà chúng ta cần tương tác ---
    
    // 1. Ô nhập liệu để tìm kiếm
    const searchInput = document.getElementById('searchInput'); 
    
    // 2. Nút để bật/tắt form
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    
    // 3. Form liên hệ (sẽ là form thêm sản phẩm)
    const contactFormSection = document.getElementById('contact-form');
    
    // 4. Tất cả các thẻ sản phẩm có class là 'product-item'
    const allProducts = document.querySelectorAll('.product-item');

    // --- CHỨC NĂNG 1: LỌC SẢN PHẨM KHI NGƯỜI DÙNG GÕ VÀO Ô TÌM KIẾM ---

    // Gắn một sự kiện "keyup", nó sẽ kích hoạt mỗi khi người dùng nhả một phím ra
    searchInput.addEventListener('keyup', function() {
        
        // Lấy giá trị người dùng gõ vào, và chuyển nó thành chữ thường để tìm kiếm không phân biệt hoa/thường
        const searchTerm = searchInput.value.toLowerCase();

        // Dùng vòng lặp để duyệt qua từng sản phẩm một
        allProducts.forEach(function(product) {
            
            // Tìm đến thẻ h3 (chứa tên sách) bên trong mỗi sản phẩm
            const productName = product.querySelector('.product-info h3').textContent.toLowerCase();

            // Kiểm tra xem tên sách có chứa từ khóa tìm kiếm hay không
            if (productName.includes(searchTerm)) {
                // Nếu có, cho sản phẩm hiện ra
                product.style.display = 'block'; 
            } else {
                // Nếu không, ẩn sản phẩm đó đi
                product.style.display = 'none';
            }
        });
    });


    // --- CHỨC NĂNG 2: ẨN/HIỆN FORM KHI NHẤN NÚT "THÊM SẢN PHẨM" ---

    // Gắn sự kiện "click" cho nút bấm
    toggleFormBtn.addEventListener('click', function() {
        contactFormSection.classList.toggle('hidden');
    });
});