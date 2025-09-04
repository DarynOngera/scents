// Shopping Cart functionality
let cart = [];
let cartCount = 0;

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const ctaButton = document.querySelector('.cta-button');
const contactForm = document.querySelector('.contact-form');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCartDisplay();
    initializeAnimations();
});

// Event Listeners
function initializeEventListeners() {
    // Cart functionality
    cartIcon.addEventListener('click', openCart);
    closeModal.addEventListener('click', closeCart);
    
    // Add to cart buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Mobile navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // CTA button scroll to collection
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.getElementById('collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCart();
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

// Shopping Cart Functions
function addToCart(event) {
    const button = event.target;
    const productName = button.closest('.product-card').querySelector('h3').textContent;
    const productPrice = parseFloat(button.dataset.price);
    const productId = button.dataset.product;
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    cartCount++;
    updateCartDisplay();
    showAddToCartFeedback(button);
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cartCount -= item.quantity;
        cart.splice(itemIndex, 1);
        updateCartDisplay();
    }
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = Math.max(0, newQuantity);
        cartCount += (item.quantity - oldQuantity);
        
        if (item.quantity === 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    // Update cart count
    cartCountElement.textContent = cartCount;
    
    // Update cart items
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                        <p style="color: #666;">$${item.price}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">-</button>
                            <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">+</button>
                        </div>
                        <button onclick="removeFromCart('${item.id}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    cartTotalElement.textContent = total.toFixed(2);
}

function openCart() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showAddToCartFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1500);
}

// Mobile Navigation
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    hamburger.classList.toggle('active');
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '';
    }
}

// Contact form handling
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = event.target.querySelector('input[type="text"]').value;
    const email = event.target.querySelector('input[type="email"]').value;
    const message = event.target.querySelector('textarea').value;
    
    // Simulate form submission
    const submitButton = event.target.querySelector('button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        submitButton.textContent = 'Message Sent!';
        submitButton.style.background = '#4CAF50';
        
        // Reset form
        event.target.reset();
        
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.style.background = '';
            submitButton.disabled = false;
        }, 3000);
    }, 1500);
}

// Animation and scroll effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-card, .about-text, .contact-info');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Checkout functionality (placeholder)
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // This would typically integrate with a payment processor
    alert('Thank you for your interest! This would redirect to a secure checkout page.');
}

// Quick view functionality
document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        
        // Create quick view modal (simplified)
        const quickViewModal = document.createElement('div');
        quickViewModal.className = 'modal';
        quickViewModal.style.display = 'block';
        quickViewModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>${productName}</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                    <div style="height: 300px; background: linear-gradient(145deg, #f8f8f8, #e8e8e8); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 80px; height: 120px; background: linear-gradient(145deg, #e0e0e0, #d0d0d0); border-radius: 10px 10px 30px 30px;"></div>
                    </div>
                    <div>
                        <p style="margin-bottom: 1rem; line-height: 1.6;">${productDescription}</p>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #8b7355; margin-bottom: 1rem;">${productPrice}</div>
                        <button onclick="this.closest('.modal').remove(); document.querySelector('[data-product=\"${productCard.querySelector('.add-to-cart').dataset.product}\"]').click();" style="width: 100%; background: #2c2c2c; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 5px;">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(quickViewModal);
        document.body.style.overflow = 'hidden';
        
        // Close modal when clicking outside
        quickViewModal.addEventListener('click', function(event) {
            if (event.target === quickViewModal) {
                quickViewModal.remove();
                document.body.style.overflow = 'auto';
            }
        });
    });
});

// Smooth reveal animation for hero section
window.addEventListener('load', function() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButton = document.querySelector('.cta-button');
    const perfumeBottle = document.querySelector('.perfume-bottle');
    
    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
    }, 200);
    
    setTimeout(() => {
        heroSubtitle.style.opacity = '1';
        heroSubtitle.style.transform = 'translateY(0)';
    }, 400);
    
    setTimeout(() => {
        ctaButton.style.opacity = '1';
        ctaButton.style.transform = 'translateY(0)';
    }, 600);
    
    setTimeout(() => {
        perfumeBottle.style.opacity = '1';
        perfumeBottle.style.transform = 'translateY(0) scale(1)';
    }, 800);
    
    // Set initial styles
    [heroTitle, heroSubtitle, ctaButton].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
    
    perfumeBottle.style.opacity = '0';
    perfumeBottle.style.transform = 'translateY(30px) scale(0.9)';
    perfumeBottle.style.transition = 'opacity 1s ease, transform 1s ease';
});

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
