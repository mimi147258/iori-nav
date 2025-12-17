document.addEventListener('DOMContentLoaded', function() {
  // ========== 侧边栏控制 ==========
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  
  function openSidebar() {
    sidebar?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  
  function closeSidebarMenu() {
    sidebar?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  sidebarToggle?.addEventListener('click', openSidebar);
  closeSidebar?.addEventListener('click', closeSidebarMenu);
  mobileOverlay?.addEventListener('click', closeSidebarMenu);
  
  // ========== 复制链接功能 ==========
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const url = this.getAttribute('data-url');
      if (!url) return;
      
      navigator.clipboard.writeText(url).then(() => {
        showCopySuccess(this);
      }).catch(() => {
        // 备用方法
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showCopySuccess(this);
        } catch (e) {
          alert('复制失败,请手动复制');
        }
        document.body.removeChild(textarea);
      });
    });
  });
  
  function showCopySuccess(btn) {
    const successMsg = btn.querySelector('.copy-success');
    successMsg.classList.remove('hidden');
    successMsg.classList.add('copy-success-animation');
    setTimeout(() => {
      successMsg.classList.add('hidden');
      successMsg.classList.remove('copy-success-animation');
    }, 2000);
  }
  
  // ========== 返回顶部 ==========
  const backToTop = document.getElementById('backToTop');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop?.classList.remove('opacity-0', 'invisible');
    } else {
      backToTop?.classList.add('opacity-0', 'invisible');
    }
  });
  
  backToTop?.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // ========== 模态框控制 ==========
  const addSiteModal = document.getElementById('addSiteModal');
  const addSiteBtnSidebar = document.getElementById('addSiteBtnSidebar');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelAddSite = document.getElementById('cancelAddSite');
  const addSiteForm = document.getElementById('addSiteForm');
  
  function openModal() {
    addSiteModal?.classList.remove('opacity-0', 'invisible');
    addSiteModal?.querySelector('.max-w-md')?.classList.remove('translate-y-8');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    addSiteModal?.classList.add('opacity-0', 'invisible');
    addSiteModal?.querySelector('.max-w-md')?.classList.add('translate-y-8');
    document.body.style.overflow = '';
  }
  
  async function fetchCategoriesForSelect() {
    const selectElement = document.getElementById('addSiteCatelog');
    if (!selectElement) return;

    try {
      const response = await fetch('/api/categories?pageSize=999');
      const data = await response.json();
      if (data.code === 200 && data.data) {
        selectElement.innerHTML = '<option value="" disabled selected>请选择一个分类</option>';
        data.data.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.catelog;
          selectElement.appendChild(option);
        });
      } else {
        selectElement.innerHTML = '<option value="" disabled>无法加载分类</option>';
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      selectElement.innerHTML = '<option value="" disabled>加载分类失败</option>';
    }
  }

  addSiteBtnSidebar?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
    fetchCategoriesForSelect();
  });
  
  closeModalBtn?.addEventListener('click', closeModal);
  cancelAddSite?.addEventListener('click', closeModal);
  addSiteModal?.addEventListener('click', (e) => {
    if (e.target === addSiteModal) closeModal();
  });
  
  // ========== 表单提交 ==========
  addSiteForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('addSiteName').value,
      url: document.getElementById('addSiteUrl').value,
      logo: document.getElementById('addSiteLogo').value,
      desc: document.getElementById('addSiteDesc').value,
      catelog_id: document.getElementById('addSiteCatelog').value
    };
    
    fetch('/api/config/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
      if (data.code === 201) {
        showToast('提交成功,等待管理员审核');
        closeModal();
        addSiteForm.reset();
      } else {
        alert(data.message || '提交失败');
      }
    })
    .catch(err => {
      console.error('网络错误:', err);
      alert('网络错误,请稍后重试');
    });
  });
  
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
  
  // ========== 搜索功能 ==========
  const searchInputs = document.querySelectorAll('.search-input-target');
  const sitesGrid = document.getElementById('sitesGrid');
  
  searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        const keyword = this.value.toLowerCase().trim();
        // Sync other inputs
        searchInputs.forEach(otherInput => {
            if (otherInput !== this) {
                otherInput.value = this.value;
            }
        });

        const cards = sitesGrid?.querySelectorAll('.site-card');
        
        cards?.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const url = (card.dataset.url || '').toLowerCase();
        const catalog = (card.dataset.catalog || '').toLowerCase();
        
        if (name.includes(keyword) || url.includes(keyword) || catalog.includes(keyword)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
        });
        
        updateHeading(keyword);
    });
  });
  
  function updateHeading(keyword) {
    const heading = document.querySelector('[data-role="list-heading"]');
    if (!heading) return;
    
    const visibleCount = sitesGrid?.querySelectorAll('.site-card:not(.hidden)').length || 0;
    const defaultText = heading.dataset.default || '';
    const activeText = heading.dataset.active || '';
    
    if (keyword) {
      heading.textContent = `搜索结果 · ${visibleCount} 个网站`;
    } else if (activeText) {
      heading.textContent = `${activeText} · ${visibleCount} 个网站`;
    } else {
      heading.textContent = defaultText;
    }
  }
  
  // ========== 一言 API ==========
  fetch('https://v1.hitokoto.cn')
    .then(res => res.json())
    .then(data => {
      const hitokoto = document.getElementById('hitokoto_text');
      if (hitokoto) {
        hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
        hitokoto.innerText = data.hitokoto;
      }
    })
    .catch(console.error);

  // ========== Horizontal Menu Overflow Logic ==========
  const navContainer = document.getElementById('horizontalCategoryNav');
  const moreBtnContainer = document.getElementById('horizontalMoreBtnContainer');
  const moreBtn = document.getElementById('horizontalMoreBtn');
  const dropdown = document.getElementById('horizontalMoreDropdown');
  
  let checkOverflow = () => {};

  if (navContainer && moreBtnContainer && dropdown) {
    // Move all items back to nav function
    const resetNav = () => {
        const dropdownItems = Array.from(dropdown.children);
        dropdownItems.forEach(item => {
            item.classList.remove('block', 'w-full', 'text-left', 'px-4', 'py-2', 'hover:bg-gray-100', 'text-gray-700', 'font-bold', 'text-primary-600', 'bg-gray-50', 'bg-primary-600', 'text-white');
            item.classList.add('inline-flex', 'items-center', 'px-4', 'py-2', 'rounded-full', 'text-sm', 'transition-all', 'duration-200', 'whitespace-nowrap');
            
            // Restore original class
            if (item.dataset.originalClass) {
                item.className = item.dataset.originalClass;
            }
            navContainer.appendChild(item);
        });
        moreBtnContainer.classList.add('hidden');
        dropdown.classList.add('hidden');
    };

    checkOverflow = () => {
        resetNav();
        
        const navChildren = Array.from(navContainer.children);
        if (navChildren.length === 0) return;
        
        const firstTop = navChildren[0].offsetTop;
        
        // Pass 1: Check for any physical wrapping
        let firstWrappedIndex = -1;
        for (let i = 0; i < navChildren.length; i++) {
            if (navChildren[i].offsetTop > firstTop) {
                firstWrappedIndex = i;
                break;
            }
        }
        
        if (firstWrappedIndex === -1) {
            // No wrapping detected, everything fits on one line.
            moreBtnContainer.classList.add('hidden');
            dropdown.classList.add('hidden');
            return; 
        }
        
        // Overflow detected: Show button and move items
        moreBtnContainer.classList.remove('hidden');
        
        const navWidth = navContainer.clientWidth;
        const buttonWidth = 60; // Reserved space for button
        const limitRight = navWidth - buttonWidth;
        
        const itemsToMove = [];
        
        for (let i = 0; i < navChildren.length; i++) {
            const item = navChildren[i];
            const itemRight = item.offsetLeft + item.offsetWidth;
            
            // Move item if:
            // 1. It is already wrapped (i >= firstWrappedIndex)
            // 2. OR it overlaps with the "More" button area (itemRight > limitRight)
            if (i >= firstWrappedIndex || itemRight > limitRight) {
                itemsToMove.push(item);
            }
        }

        // Move wrapped items to dropdown
        itemsToMove.forEach(item => {
            // Save original class
            if (!item.dataset.originalClass) {
                item.dataset.originalClass = item.className;
            }
            
            // Check active state
            const isActive = item.classList.contains('font-semibold');
            
            // Apply dropdown styling
            item.classList.remove('inline-flex', 'items-center', 'rounded-full', 'whitespace-nowrap');
            
            if (isActive) {
                item.classList.add('block', 'w-full', 'text-left', 'px-4', 'py-2', 'text-sm', 'rounded-md', 'font-bold', 'bg-primary-600', 'text-white');
                item.classList.remove('text-gray-700', 'hover:bg-gray-50');
            } else {
                item.classList.add('block', 'w-full', 'text-left', 'px-4', 'py-2', 'text-sm', 'hover:bg-gray-50', 'rounded-md', 'text-gray-700');
                item.classList.remove('font-bold', 'bg-primary-600', 'text-white');
            }
            
            dropdown.appendChild(item);
        });
    };

    // Initial check
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', () => {
        checkOverflow();
    });

    // Toggle Dropdown
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    // Close on click inside dropdown
    dropdown.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            dropdown.classList.add('hidden');
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !moreBtn.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
  }

  // ========== AJAX Navigation ==========
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a[href^="?catalog="]');
    if (!link) return;
    
    // Allow new tab clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    const href = link.getAttribute('href');
    const url = new URL(href, window.location.origin);
    
    // Visual feedback (optional opacity)
    const sitesGrid = document.getElementById('sitesGrid');
    if (sitesGrid) sitesGrid.style.opacity = '0.5';

    try {
        const res = await fetch(href);
        if (!res.ok) throw new Error('Network response was not ok');
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // 1. Update Grid
        const newGrid = doc.getElementById('sitesGrid');
        if (sitesGrid && newGrid) {
            sitesGrid.innerHTML = newGrid.innerHTML;
            sitesGrid.style.opacity = '1';
        }

        // 2. Update Horizontal Menu (In-Place to preserve state)
        const currentNav = document.getElementById('horizontalCategoryNav');
        const newNav = doc.getElementById('horizontalCategoryNav');
        const dropdown = document.getElementById('horizontalMoreDropdown');
        
        if (currentNav && newNav) {
            // Extract class strings from the new server-rendered HTML
            // We find the link that matches the requested href to get 'active' classes
            // And a link that doesn't match to get 'inactive' classes.
            
            const newLinks = Array.from(newNav.querySelectorAll('a'));
            let activeClass = '';
            let inactiveClass = '';
            
            // Helper to get relative href
            const getHref = (el) => el.getAttribute('href');
            
            const activeLinkEl = newLinks.find(el => getHref(el) === href);
            const inactiveLinkEl = newLinks.find(el => getHref(el) !== href);
            
            if (activeLinkEl) activeClass = activeLinkEl.className;
            if (inactiveLinkEl) inactiveClass = inactiveLinkEl.className;
            
            // If we couldn't find them (e.g. only 1 category?), fallback or skip
            if (activeClass && inactiveClass) {
                // Update Live DOM
                // We need to target both visible links and dropdown links
                const allCurrentLinks = [
                    ...Array.from(currentNav.querySelectorAll('a')),
                    ...(dropdown ? Array.from(dropdown.querySelectorAll('a')) : [])
                ];
                
                allCurrentLinks.forEach(link => {
                    const isTarget = getHref(link) === href;
                    const newOriginalClass = isTarget ? activeClass : inactiveClass;
                    
                    // Always update the stored original class (for when items move between nav and dropdown)
                    link.dataset.originalClass = newOriginalClass;
                    
                    // Update className for immediate effect if it is in the nav bar
                    // If it is in the dropdown, checkOverflow will handle it
                    if (currentNav.contains(link)) {
                        link.className = newOriginalClass;
                    }
                });
                
                // Re-calculate overflow to ensure dropdown items get correct styles
                checkOverflow();
            }
        }

        // 3. Update Sidebar Active State (if exists)
        // Find sidebar container. It's usually the second div inside #sidebar .p-6?
        // Let's look for the container with class 'space-y-1'
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const currentLinks = sidebar.querySelectorAll('a[href^="?catalog="]');
            const newLinks = doc.querySelectorAll('#sidebar a[href^="?catalog="]');
            
            // Simple approach: Replace the parent container of links?
            // The structure is `div.space-y-1`.
            const currentSpaceY1 = sidebar.querySelector('.space-y-1');
            const newSpaceY1 = doc.querySelector('#sidebar .space-y-1');
            if (currentSpaceY1 && newSpaceY1) {
                currentSpaceY1.innerHTML = newSpaceY1.innerHTML;
            }
        }

        // 4. Update Heading
        const currentHeading = document.querySelector('[data-role="list-heading"]');
        const newHeading = doc.querySelector('[data-role="list-heading"]');
        if (currentHeading && newHeading) {
            currentHeading.textContent = newHeading.textContent;
            currentHeading.dataset.default = newHeading.dataset.default;
            currentHeading.dataset.active = newHeading.dataset.active;
        }

        // 5. Update History
        history.pushState({}, '', href);

    } catch (err) {
        console.error('Navigation failed', err);
        window.location.href = href; // Fallback
    }
  });
});
