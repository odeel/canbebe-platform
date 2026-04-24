// Admin Panel JavaScript

// ══ Navigation ══
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initModals();
    loadDashboardData();
    initProductManagement();
    initUserManagement();
    initCommunityManagement();
    checkAuth();
});

// ══ Check Authentication ══
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    // TODO: Verify token with backend
}

// ══ Navigation System ══
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${sectionId}-section`).classList.add('active');

            // Update page title
            const title = item.querySelector('span').textContent;
            document.getElementById('pageTitle').textContent = title;

            // Load section data
            loadSectionData(sectionId);

            // Close mobile menu
            document.getElementById('adminSidebar').classList.remove('active');
        });
    });
}

// ══ Mobile Menu ══
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('adminSidebar');

    mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// ══ Logout ══
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});

// ══ Load Section Data ══
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'community':
            loadCommunityPosts();
            break;
        case 'analytics':
            // Analytics data would go here
            break;
    }
}

// ══ DASHBOARD ══
async function loadDashboardData() {
    try {
        // Load stats
        const productsData = await apiCall(API_ENDPOINTS.getProducts);
        document.getElementById('totalProducts').textContent = productsData.products?.length || 0;

        // Load recent products
        if (productsData.success && productsData.products) {
            const recentProducts = productsData.products.slice(0, 5);
            displayRecentProducts(recentProducts);
        }

        // TODO: Load other stats (users, posts, subscriptions)
        // These would come from additional API endpoints

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayRecentProducts(products) {
    const tbody = document.getElementById('recentProductsTable');
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">` :
            `<div class="product-image"></div>`
        }
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>${product.brand || 'No brand'}</p>
                    </div>
                </div>
            </td>
            <td>${product.categoryName || 'N/A'}</td>
            <td>${formatSize(product.size)}</td>
            <td>${product.price ? `${product.price.toLocaleString()} DZD` : 'N/A'}</td>
            <td>
                <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                    ${product.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
        </tr>
    `).join('');
}

// ══ PRODUCTS MANAGEMENT ══
let currentProducts = [];
let currentEditingProduct = null;

function initProductManagement() {
    // Search
    document.getElementById('productSearchInput').addEventListener('input', filterProducts);

    // Filters
    document.getElementById('categoryFilterSelect').addEventListener('change', filterProducts);
    document.getElementById('statusFilterSelect').addEventListener('change', filterProducts);

    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        openProductModal();
    });

    // Form submission
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Image upload functionality
    initImageUpload();
}

// ══ IMAGE UPLOAD ══
let selectedImageFile = null;

function initImageUpload() {
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const imagePreviewImg = document.getElementById('imagePreviewImg');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Click to upload
    imagePreview.addEventListener('click', (e) => {
        if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
            imageInput.click();
        }
    });

    // File selection
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // Drag and drop
    imagePreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreview.style.borderColor = 'var(--purple-500)';
        imagePreview.style.background = 'rgba(155, 95, 200, 0.1)';
    });

    imagePreview.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imagePreview.style.borderColor = '';
        imagePreview.style.background = '';
    });

    imagePreview.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreview.style.borderColor = '';
        imagePreview.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // Remove image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImagePreview();
    });
}

function handleImageFile(file) {
    selectedImageFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        const imagePlaceholder = document.getElementById('imagePlaceholder');
        const imagePreviewImg = document.getElementById('imagePreviewImg');
        const removeImageBtn = document.getElementById('removeImageBtn');

        imagePlaceholder.style.display = 'none';
        imagePreviewImg.src = e.target.result;
        imagePreviewImg.style.display = 'block';
        removeImageBtn.style.display = 'flex';
    };

    reader.readAsDataURL(file);
}

function clearImagePreview() {
    selectedImageFile = null;
    document.getElementById('productImage').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('imagePlaceholder').style.display = 'flex';
    document.getElementById('imagePreviewImg').style.display = 'none';
    document.getElementById('imagePreviewImg').src = '';
    document.getElementById('removeImageBtn').style.display = 'none';
}

async function uploadImage(file) {
    // Create FormData for image upload
    const formData = new FormData();
    formData.append('image', file);

    try {
        // TODO: Replace with your actual image upload endpoint
        // This is a placeholder - you need to implement image upload on your backend
        const response = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        const data = await response.json();
        return data.imageUrl; // Assuming backend returns { imageUrl: 'url' }
    } catch (error) {
        console.error('Image upload error:', error);

        // TEMPORARY FALLBACK: Convert to base64 for local testing
        // Remove this in production and use actual upload
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
}

async function loadProducts() {
    try {
        const data = await apiCall(API_ENDPOINTS.getProducts);
        if (data.success && data.products) {
            currentProducts = data.products;
            displayProducts(currentProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">` :
            `<div class="product-image"></div>`
        }
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>${product.brand || 'No brand'}</p>
                    </div>
                </div>
            </td>
            <td>${product.brand || 'N/A'}</td>
            <td>${product.categoryName || 'N/A'}</td>
            <td>${formatSize(product.size)}</td>
            <td>${product.price ? `${product.price.toLocaleString()} DZD` : 'N/A'}</td>
            <td>
                <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                    ${product.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editProduct('${product._id}')" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteProduct('${product._id}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterProducts() {
    const search = document.getElementById('productSearchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilterSelect').value;
    const status = document.getElementById('statusFilterSelect').value;

    let filtered = currentProducts;

    if (search) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.brand && p.brand.toLowerCase().includes(search))
        );
    }

    if (category) {
        filtered = filtered.filter(p => p.categoryName === category);
    }

    if (status) {
        filtered = filtered.filter(p => p.isActive === (status === 'true'));
    }

    displayProducts(filtered);
}

function openProductModal(product = null) {
    currentEditingProduct = product;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    // Clear image preview first
    clearImagePreview();

    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productCategory').value = product.categoryName || 'couches';
        document.getElementById('productSize').value = product.size;
        document.getElementById('productPrice').value = product.price || '';

        if (product.weightRangeKg?.min && product.weightRangeKg?.max) {
            document.getElementById('productWeight').value = `${product.weightRangeKg.min}-${product.weightRangeKg.max}`;
        }

        // Set existing image if available
        if (product.imageUrl) {
            document.getElementById('productImageUrl').value = product.imageUrl;
            document.getElementById('imagePlaceholder').style.display = 'none';
            document.getElementById('imagePreviewImg').src = product.imageUrl;
            document.getElementById('imagePreviewImg').style.display = 'block';
            document.getElementById('removeImageBtn').style.display = 'flex';
        }

        document.getElementById('productUrl').value = product.productUrl || '';
        document.getElementById('productSanAlcool').checked = product.sanAlcool !== false;
        document.getElementById('productActive').checked = product.isActive !== false;
    } else {
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.classList.add('active');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const weightRange = document.getElementById('productWeight').value;
    let weightRangeKg = null;

    if (weightRange && weightRange.includes('-')) {
        const [min, max] = weightRange.split('-').map(v => parseFloat(v.trim()));
        weightRangeKg = { min, max };
    }

    // Handle image upload
    let imageUrl = document.getElementById('productImageUrl').value;
    if (selectedImageFile) {
        try {
            imageUrl = await uploadImage(selectedImageFile);
        } catch (error) {
            showError('Failed to upload image');
            return;
        }
    }

    const productData = {
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        categoryName: document.getElementById('productCategory').value,
        size: document.getElementById('productSize').value,
        price: parseFloat(document.getElementById('productPrice').value) || null,
        weightRangeKg,
        imageUrl: imageUrl || null,
        productUrl: document.getElementById('productUrl').value || null,
        sanAlcool: document.getElementById('productSanAlcool').checked,
        isActive: document.getElementById('productActive').checked
    };

    try {
        if (productId) {
            // Update existing product
            await apiCall(`${API_ENDPOINTS.getProducts}/${productId}`, 'PUT', productData);
            showSuccess('Product updated successfully');
        } else {
            // Create new product
            await apiCall(API_ENDPOINTS.getProducts, 'POST', productData);
            showSuccess('Product created successfully');
        }

        closeProductModal();
        loadProducts();
        loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
        console.error('Error saving product:', error);
        showError(error.message || 'Failed to save product');
    }
}

async function editProduct(productId) {
    const product = currentProducts.find(p => p._id === productId);
    if (product) {
        openProductModal(product);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await apiCall(`${API_ENDPOINTS.getProducts}/${productId}`, 'DELETE');
        showSuccess('Product deleted successfully');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// ══ USERS MANAGEMENT ══
let currentUsers = [];

function initUserManagement() {
    document.getElementById('userSearchInput').addEventListener('input', filterUsers);
    document.getElementById('planFilterSelect').addEventListener('change', filterUsers);
}

async function loadUsers() {
    // TODO: Implement when user API endpoints are available
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">User API endpoints not yet implemented</td></tr>';
}

function filterUsers() {
    // TODO: Implement filtering
}

// ══ COMMUNITY MANAGEMENT ══
let currentPosts = [];

function initCommunityManagement() {
    // TODO: Implement community management
}

async function loadCommunityPosts() {
    try {
        const data = await apiCall(API_ENDPOINTS.getPosts);
        if (data.success && data.posts) {
            currentPosts = data.posts;
            displayCommunityPosts(currentPosts);
        }
    } catch (error) {
        console.error('Error loading community posts:', error);
        const tbody = document.getElementById('communityTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load posts</td></tr>';
    }
}

function displayCommunityPosts(posts) {
    const tbody = document.getElementById('communityTableBody');

    if (!posts || posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No posts found</td></tr>';
        return;
    }

    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}</td>
            <td>${post.userId?.name || 'Anonymous'}</td>
            <td>${post.comments?.length || 0}</td>
            <td>${post.likes?.length || 0}</td>
            <td>${new Date(post.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-danger" onclick="deletePost('${post._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        await apiCall(`${API_ENDPOINTS.getPosts}/${postId}`, 'DELETE');
        showSuccess('Post deleted successfully');
        loadCommunityPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        showError('Failed to delete post');
    }
}

// ══ MODAL CONTROLS ══
function initModals() {
    // Product Modal
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);

    // Close modal on outside click
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeProductModal();
        }
    });
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    currentEditingProduct = null;
}

// ══ UTILITY FUNCTIONS ══
function formatSize(size) {
    if (typeof size === 'number') return `Size ${size}`;
    return size || 'N/A';
}

function showSuccess(message) {
    alert(message); // TODO: Implement better notification system
}

function showError(message) {
    alert('Error: ' + message); // TODO: Implement better notification system
}