// ── Image proxy helper ────────────────────────────────────────────────────────
function proxyImg(url) {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return url; // local upload, serve directly
    return '/api/image-proxy?url=' + encodeURIComponent(url);
}

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
        case 'advices':
            loadAdminAdvices();
            break;
    }
}

// ══ ADVICES ══
const DEFAULT_ADVICES = [
    { id:1,  roles:['mother','father','grandmother','babysitter','pregnant'], category:'Sleep',       title:'Safe Sleep Practices',               summary:'Create a safe sleep environment that protects your baby every night.',                content:'Always place your baby on their back to sleep. Use a firm, flat mattress with no soft bedding, pillows, or bumpers. Keep the room at 18–20°C. A pacifier at bedtime can reduce SIDS risk.',                                                                                                                                                  youtubeId:'TnD_3El5GWM' },
    { id:2,  roles:['mother','father','grandmother','babysitter','pregnant'], category:'Development', title:'Tummy Time Tips',                    summary:'Build neck and core strength with daily tummy time sessions.',                       content:'Start tummy time from day one for 3–5 minutes several times a day. Gradually increase as baby grows stronger. Use colorful toys to keep them engaged. Always supervise tummy time.',                                                                                                                                                             youtubeId:'k7VE8NWzRYI' },
    { id:3,  roles:['mother','father','grandmother','babysitter','pregnant'], category:'Health',      title:'Vaccination Schedule Guide',          summary:"Stay on top of your baby's vaccination milestones and what to expect.",             content:"Follow your pediatrician's recommended schedule. Keep a vaccination record. After each shot, watch for mild reactions like fever or fussiness. A cool compress helps soothe injection-site soreness.",                                                                                                                                          youtubeId:'V5IjjUMJQsE' },
    { id:4,  roles:['mother','father','grandmother','babysitter','pregnant'], category:'Bonding',     title:'Building a Strong Parent-Baby Bond',  summary:'Simple daily habits that deepen your connection with your baby.',                   content:"Talk, sing, and read to your baby every day. Respond promptly to crying — you cannot spoil a newborn. Maintain eye contact during feeding and play. Skin-to-skin contact regulates baby's temperature and heart rate.",                                                                                                                             youtubeId:'ph6FqUUwV8Q' },
    { id:5,  roles:['mother','father'],                                       category:'Feeding',     title:'Breastfeeding Basics',               summary:'Essential tips for a comfortable and successful breastfeeding journey.',            content:'Breastfeed on demand, typically every 2–3 hours. Ensure a proper latch to avoid nipple pain. Stay hydrated and maintain a balanced diet. Seek help from a lactation consultant if needed.',                                                                                                                                                    youtubeId:'3OqPFPT5OFU' },
    { id:6,  roles:['mother','father'],                                       category:'Nutrition',   title:'Starting Solid Foods',               summary:'When and how to introduce solids safely to your growing baby.',                     content:"Introduce solids around 6 months when your baby shows readiness signs. Start with single-ingredient purees. Introduce one new food every 3–5 days to watch for allergies. Avoid honey, cow's milk, and choking hazards.",                                                                                                                          youtubeId:'qJw0xIDN-LQ' },
    { id:7,  roles:['mother','father'],                                       category:'Sleep',       title:'Establishing a Sleep Routine',       summary:'Consistent bedtime routines help babies sleep longer and better.',                  content:'Start a calming pre-sleep routine: bath, feed, story, song. Keep bedtime between 18:30 and 20:00. Dim lights and reduce noise 30 minutes before bed. Be consistent — babies thrive on predictability.',                                                                                                                                           youtubeId:'UkPmLMgDXhs' },
    { id:8,  roles:['mother','father'],                                       category:'Development', title:'Baby Milestones 0–12 Months',        summary:"Track your baby's key developmental milestones in the first year.",               content:'At 2 months: smiling. At 4 months: rolling. At 6 months: sitting with support. At 9 months: crawling. At 12 months: first words and steps. Consult your pediatrician if milestones are significantly delayed.',                                                                                                                                  youtubeId:'0Ox3jVMZmwk' },
    { id:9,  roles:['pregnant'],                                              category:'Pregnancy',   title:'Third Trimester Essentials',         summary:'What to expect and how to prepare during the last three months of pregnancy.',     content:'Attend all prenatal appointments. Pack your hospital bag by week 36. Practice breathing exercises for labor. Rest as much as possible and stay hydrated. Know the signs of labor.',                                                                                                                                                          youtubeId:'6DxZsHoBIGI' },
    { id:10, roles:['pregnant'],                                              category:'Pregnancy',   title:'Nutrition During Pregnancy',         summary:'Key nutrients and foods to support a healthy pregnancy.',                          content:'Increase folic acid, iron, and calcium intake. Eat small, frequent meals to manage nausea. Avoid raw fish, unpasteurized cheese, and deli meats. Stay hydrated with 8–10 glasses of water daily.',                                                                                                                                               youtubeId:'8HslUiu8p1M' },
    { id:11, roles:['pregnant'],                                              category:'Pregnancy',   title:'Preparing for Breastfeeding',        summary:'Get ready before birth to give breastfeeding the best start.',                    content:'Attend a breastfeeding class before delivery. Learn about proper latch and positioning. Talk to a lactation consultant early. Know that some discomfort at the start is normal — ask for help.',                                                                                                                                                 youtubeId:'3OqPFPT5OFU' },
    { id:12, roles:['pregnant'],                                              category:'Bonding',     title:'Bonding with Your Baby Before Birth', summary:'Simple ways to connect with your baby during pregnancy.',                         content:'Talk and sing to your baby — they can hear you from 18 weeks. Play music gently on your belly. Share the experience with your partner. Visualizing your baby and journaling strengthens the prenatal bond.',                                                                                                                                       youtubeId:'ph6FqUUwV8Q' },
    { id:13, roles:['grandmother','babysitter'],                              category:'Safety',      title:'Baby-Proofing the Home',             summary:'Essential safety checks before a baby comes to your home.',                       content:'Cover electrical outlets. Secure heavy furniture to walls. Install stair gates. Keep small objects, plastic bags, and cleaning products out of reach. Ensure window guards are in place above ground floor.',                                                                                                                                    youtubeId:'2xFQ3M62-Kk' },
    { id:14, roles:['grandmother','babysitter'],                              category:'Safety',      title:'Safe Feeding When Caregiving',       summary:"What to know about feeding a baby when you're the caregiver.",                    content:"Always check expressed milk temperature on your wrist before feeding. Never microwave breast milk or formula. Sit baby upright during feeds. Don't leave baby unattended with a bottle. Burp baby after every feed.",                                                                                                                              youtubeId:'3OqPFPT5OFU' },
    { id:15, roles:['grandmother','babysitter'],                              category:'Health',      title:'Recognising When Baby Is Unwell',    summary:'Signs that a baby needs medical attention and what to do.',                       content:'Contact a doctor if baby has a temperature above 38°C (under 3 months: any fever), is unusually lethargic, refuses feeds for more than 8 hours, has difficulty breathing, or has a rash with fever.',                                                                                                                                              youtubeId:'V5IjjUMJQsE' },
    { id:16, roles:['grandmother','babysitter'],                              category:'Bonding',     title:'Playing and Stimulating Baby',       summary:"Age-appropriate activities to support a baby's development during your care.",    content:'0–3 months: high-contrast cards, gentle rocking, talking. 3–6 months: rattles, mirrors, tummy time. 6–9 months: peek-a-boo, stacking cups. 9–12 months: push-pull toys, simple picture books.',                                                                                                                                              youtubeId:'k7VE8NWzRYI' },
];

const LS_KEY = 'bm_advices';

function getAdvices() {
    try {
        const saved = localStorage.getItem(LS_KEY);
        return saved ? JSON.parse(saved) : [...DEFAULT_ADVICES];
    } catch(e) { return [...DEFAULT_ADVICES]; }
}

function saveAdvices(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function nextAdviceId(list) {
    return list.length ? Math.max(...list.map(a => a.id)) + 1 : 1;
}

let adminAdvicesFiltered = [];
let currentEditingAdviceId = null;

function loadAdminAdvices() {
    adminAdvicesFiltered = getAdvices();
    renderAdminAdvicesTable(adminAdvicesFiltered);
}

function filterAdminAdvices() {
    const search = document.getElementById('adviceSearchInput').value.toLowerCase();
    const cat    = document.getElementById('adviceCategoryFilter').value;
    const role   = document.getElementById('adviceRoleFilter').value;
    adminAdvicesFiltered = getAdvices().filter(a => {
        const matchSearch = !search || a.title.toLowerCase().includes(search) || a.category.toLowerCase().includes(search) || a.summary?.toLowerCase().includes(search);
        const matchCat    = !cat  || a.category === cat;
        const matchRole   = !role || a.roles.includes(role);
        return matchSearch && matchCat && matchRole;
    });
    renderAdminAdvicesTable(adminAdvicesFiltered);
}

function renderAdminAdvicesTable(items) {
    const tbody = document.getElementById('advicesTableBody');
    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No advices match your filters.</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(a => `
        <tr>
            <td><strong>${a.title}</strong><br><span style="font-size:12px;color:#9ca3af;font-weight:400">${a.summary || ''}</span></td>
            <td><span class="status-badge status-active">${a.category}</span></td>
            <td style="font-size:12px;color:#6b7280">${a.roles.join(', ')}</td>
            <td>
                <a href="https://www.youtube.com/watch?v=${a.youtubeId}" target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:5px;color:var(--primary);font-size:13px;font-weight:600;text-decoration:none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                    Watch
                </a>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="openAdviceModal(${a.id})" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteAdvice(${a.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

function openAdviceModal(id = null) {
    currentEditingAdviceId = id;
    const modal = document.getElementById('adviceModal');
    const title = document.getElementById('adviceModalTitle');
    const form  = document.getElementById('adviceForm');
    form.reset();

    // uncheck all role checkboxes
    document.querySelectorAll('#adviceRolesCheckboxes input[type=checkbox]').forEach(cb => cb.checked = false);

    if (id !== null) {
        const a = getAdvices().find(x => x.id === id);
        if (!a) return;
        title.textContent = 'Edit Advice';
        document.getElementById('adviceTitle').value    = a.title;
        document.getElementById('adviceCategory').value = a.category;
        document.getElementById('adviceSummary').value  = a.summary || '';
        document.getElementById('adviceContent').value  = a.content || '';
        document.getElementById('adviceYoutubeId').value = a.youtubeId;
        a.roles.forEach(r => {
            const cb = document.getElementById('role-' + r);
            if (cb) cb.checked = true;
        });
    } else {
        title.textContent = 'Add Advice';
    }

    modal.classList.add('active');
}

function closeAdviceModal() {
    document.getElementById('adviceModal').classList.remove('active');
    currentEditingAdviceId = null;
}

function handleAdviceSubmit(e) {
    e.preventDefault();

    const title     = document.getElementById('adviceTitle').value.trim();
    const category  = document.getElementById('adviceCategory').value;
    const summary   = document.getElementById('adviceSummary').value.trim();
    const content   = document.getElementById('adviceContent').value.trim();
    const youtubeId = document.getElementById('adviceYoutubeId').value.trim();
    const roles     = Array.from(document.querySelectorAll('#adviceRolesCheckboxes input[type=checkbox]:checked')).map(cb => cb.value);

    if (!title || !category || !youtubeId || !roles.length) {
        showError('Please fill in all required fields and select at least one role.');
        return;
    }

    // Extract video ID if full URL was pasted
    const ytMatch = youtubeId.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    const videoId = ytMatch ? ytMatch[1] : youtubeId;

    const list = getAdvices();

    if (currentEditingAdviceId !== null) {
        const idx = list.findIndex(a => a.id === currentEditingAdviceId);
        if (idx !== -1) {
            list[idx] = { ...list[idx], title, category, summary, content, youtubeId: videoId, roles };
        }
    } else {
        list.push({ id: nextAdviceId(list), title, category, summary, content, youtubeId: videoId, roles });
    }

    saveAdvices(list);
    closeAdviceModal();
    loadAdminAdvices();
    showSuccess(currentEditingAdviceId !== null ? 'Advice updated successfully.' : 'Advice added successfully.');
}

function deleteAdvice(id) {
    if (!confirm('Delete this advice? This cannot be undone.')) return;
    const list = getAdvices().filter(a => a.id !== id);
    saveAdvices(list);
    loadAdminAdvices();
    showSuccess('Advice deleted.');
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
        <tr style="cursor:pointer" onclick="showProductDetail(currentProducts.find(p=>p._id==='${product._id}'))">
            <td onclick="event.stopPropagation();showProductDetail(currentProducts.find(p=>p._id==='${product._id}'))">
                <div class="product-cell">
                    ${product.imageUrl ?
            `<img src="${proxyImg(product.imageUrl)}" alt="${product.name}" class="product-image" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="product-image product-image-fallback" style="display:none;align-items:center;justify-content:center;background:var(--p50,#f3e8ff);color:var(--purple-400,#a78bfa);font-size:10px;font-weight:700;text-align:center;padding:4px;line-height:1.2">${product.name}</div>` :
            `<div class="product-image product-image-fallback" style="display:flex;align-items:center;justify-content:center;background:var(--p50,#f3e8ff);color:var(--purple-400,#a78bfa);font-size:10px;font-weight:700;text-align:center;padding:4px;line-height:1.2">${product.name}</div>`
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
            `<img src="${proxyImg(product.imageUrl)}" alt="${product.name}" class="product-image" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="product-image product-image-fallback" style="display:none;align-items:center;justify-content:center;background:var(--p50,#f3e8ff);color:var(--purple-400,#a78bfa);font-size:10px;font-weight:700;text-align:center;padding:4px;line-height:1.2">${product.name}</div>` :
            `<div class="product-image product-image-fallback" style="display:flex;align-items:center;justify-content:center;background:var(--p50,#f3e8ff);color:var(--purple-400,#a78bfa);font-size:10px;font-weight:700;text-align:center;padding:4px;line-height:1.2">${product.name}</div>`
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
            document.getElementById('imagePreviewImg').src = proxyImg(product.imageUrl);
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
function initUserManagement() {
    document.getElementById('userSearchInput')?.addEventListener('input', filterUsers);
    document.getElementById('planFilterSelect')?.addEventListener('change', filterUsers);
    document.getElementById('roleFilterSelect')?.addEventListener('change', filterUsers);
}

let allUsers = [];

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading users...</td></tr>';
    try {
        const data = await apiCall(API_ENDPOINTS.getUsers);
        if (data.success && data.users) {
            allUsers = data.users;
            displayUsers(allUsers);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load users: ' + error.message + '</td></tr>';
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No users found</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(user => {
        const name = (user.firstName || '') + ' ' + (user.lastName || '');
        const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';
        const statusClass = user.isActive ? 'active' : 'inactive';
        const statusText = user.isActive ? 'Active' : 'Inactive';
        const babies = user.babies ? user.babies.length : 0;
        return `<tr>
            <td><div style="font-weight:500">${name.trim() || 'Unknown'}</div><div style="font-size:12px;color:#9ca3af">${user.email}</div></td>
            <td><span style="text-transform:capitalize">${user.role || 'mother'}</span></td>
            <td>${babies} ${babies === 1 ? 'baby' : 'babies'}</td>
            <td>${joined}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn-sm" onclick="toggleUserStatus('${user._id}', ${user.isActive})" title="${user.isActive ? 'Deactivate' : 'Activate'}">
                    ${user.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                </button>
                <button class="action-btn-sm delete" onclick="deleteUser('${user._id}', '${name.trim()}')" title="Delete">🗑</button>
            </td>
        </tr>`;
    }).join('');
}

async function toggleUserStatus(userId, currentStatus) {
    if (!confirm('Are you sure you want to ' + (currentStatus ? 'deactivate' : 'activate') + ' this user?')) return;
    try {
        await apiCall(API_ENDPOINTS.toggleUserStatus(userId), 'PUT');
        await loadUsers();
    } catch (e) { alert('Error: ' + e.message); }
}

async function deleteUser(userId, userName) {
    if (!confirm('Permanently delete user "' + userName + '"? This cannot be undone.')) return;
    try {
        await apiCall(API_ENDPOINTS.deleteUser(userId), 'DELETE');
        await loadUsers();
    } catch (e) { alert('Error: ' + e.message); }
}

function filterUsers() {
    const search = document.getElementById('userSearchInput')?.value?.toLowerCase() || '';
    const role   = document.getElementById('roleFilterSelect')?.value || 'all';
    const plan   = document.getElementById('planFilterSelect')?.value || 'all';
    let filtered = allUsers;
    if (search) filtered = filtered.filter(u =>
        (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(search)
    );
    if (role !== 'all') filtered = filtered.filter(u => u.role === role);
    displayUsers(filtered);
}

// ══ COMMUNITY MANAGEMENT ══
let currentPosts = [];

function initCommunityManagement() {
    // TODO: Implement community management
}

async function loadCommunityPosts() {
    const tbody = document.getElementById('communityTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading posts...</td></tr>';
    try {
        const data = await apiCall(API_ENDPOINTS.getPosts + '/admin?limit=100&status=all');
        if (data.success && data.posts) {
            currentPosts = data.posts;
            displayCommunityPosts(currentPosts);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No posts found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading community posts:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load posts: ' + error.message + '</td></tr>';
    }
}

function displayCommunityPosts(posts) {
    const tbody = document.getElementById('communityTableBody');

    if (!posts || posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No posts found</td></tr>';
        return;
    }

    tbody.innerHTML = posts.map(post => {
        const realName = post.author
            ? (post.author.firstName + ' ' + post.author.lastName).trim()
            : 'Unknown';
        const author = post.anonymous
            ? `<span style="color:#6b7280;font-style:italic">Anonymous</span> <span style="font-size:11px;color:#9ca3af">(${realName})</span>`
            : realName;
        const statusBadge = post.deleted
            ? '<span class="status-badge inactive" style="font-size:11px">Removed</span>'
            : '<span class="status-badge active" style="font-size:11px">Live</span>';
        return `
        <tr>
            <td>${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}</td>
            <td>${author}</td>
            <td>${post.comments?.length || 0}</td>
            <td>${Array.isArray(post.likes) ? post.likes.length : 0}</td>
            <td>${new Date(post.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    ${statusBadge}
                    <button class="btn-danger" onclick="deletePost('${post._id}')">Delete</button>
                </div>
            </td>
        </tr>`;
    }).join('');
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
// ── PRODUCT DETAIL MODAL ────────────────────────────────────────────────────
function showProductDetail(product) {
    // Remove existing modal
    const existing = document.getElementById('productDetailModal');
    if (existing) existing.remove();

    const img = product.imageUrl
        ? `<img src="${proxyImg(product.imageUrl)}" alt="${product.name}" class="product-detail-img" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="width:100%;aspect-ratio:1;background:var(--p50,#f3e8ff);border-radius:var(--r-l,12px);display:none;align-items:center;justify-content:center;margin-bottom:16px;flex-direction:column;gap:8px"><span style="font-size:48px">📦</span><span style="font-size:13px;font-weight:600;color:var(--purple-600)">${product.name}</span></div>`
        : `<div style="width:100%;aspect-ratio:1;background:var(--p50,#f3e8ff);border-radius:var(--r-l,12px);display:flex;align-items:center;justify-content:center;margin-bottom:16px;flex-direction:column;gap:8px"><span style="font-size:48px">📦</span><span style="font-size:13px;font-weight:600;color:var(--purple-600)">${product.name}</span></div>`;

    const weightRange = product.weightRangeKg?.min && product.weightRangeKg?.max
        ? `<span class="detail-pill">⚖️ ${product.weightRangeKg.min}–${product.weightRangeKg.max} kg</span>`
        : '';

    const modal = document.createElement('div');
    modal.id = 'productDetailModal';
    modal.className = 'modal-overlay open product-detail-modal';
    modal.innerHTML = `
        <div class="modal" style="max-width:380px;">
            <button class="modal-close" onclick="document.getElementById('productDetailModal').remove()">×</button>
            ${img}
            <div class="product-detail-cat">${product.categoryName || ''}</div>
            <div class="product-detail-name">${product.name}</div>
            <div class="product-detail-row">
                <span class="detail-pill">📏 Size ${product.size || '—'}</span>
                ${weightRange}
                ${product.brand ? `<span class="detail-pill">🏷️ ${product.brand}</span>` : ''}
            </div>
            ${product.productUrl ? `
            <a href="${product.productUrl}" target="_blank" class="product-detail-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View on Can Bébé Website
            </a>` : ''}
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}