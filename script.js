document.addEventListener("DOMContentLoaded", () => {

    console.log("FurniCasa JS Loaded Successfully");

    /* =====================================================
       STORAGE
    ===================================================== */

    let cart = loadStorage("furnicasa_cart", []);
    let wishlist = loadStorage("furnicasa_wishlist", []);
    let orders = loadStorage("furnicasa_orders", []);


    function loadStorage(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (error) {
            console.error("Storage error:", error);
            return fallback;
        }
    }


    function saveStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Could not save:", key, error);
        }
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productCards = Array.from(
        document.querySelectorAll(".product-card")
    );

    const categoryCards = document.querySelectorAll(
        ".category-card"
    );

    const navLinks = document.querySelector(".nav-links");
    const mobileMenu = document.querySelector(".mobile-menu");


    /* =====================================================
       PRICE
    ===================================================== */

    function formatPrice(price) {
        return Number(price || 0).toLocaleString("en-BD");
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(message) {

        let notification =
            document.querySelector(".site-notification");

        if (!notification) {

            notification = document.createElement("div");

            notification.className =
                "site-notification";

            notification.style.cssText = `
                position:fixed;
                right:20px;
                bottom:20px;
                z-index:99999;
                background:#1f241f;
                color:#fff;
                padding:14px 20px;
                border-radius:7px;
                font-size:14px;
                box-shadow:0 10px 30px rgba(0,0,0,.18);
                transform:translateY(100px);
                opacity:0;
                transition:.3s ease;
            `;

            document.body.appendChild(notification);
        }

        notification.textContent = message;

        notification.style.transform =
            "translateY(0)";

        notification.style.opacity = "1";

        clearTimeout(notification.timer);

        notification.timer = setTimeout(() => {

            notification.style.transform =
                "translateY(100px)";

            notification.style.opacity = "0";

        }, 2500);
    }


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    function getProductData(card) {

        if (!card) return null;

        const index = productCards.indexOf(card);

        const image =
            card.querySelector(".product-image img");

        const name =
            card.querySelector("h3");

        const category =
            card.querySelector(".product-category");

        const price =
            card.querySelector(".price strong");

        const oldPrice =
            card.querySelector(".price del");


        return {

            id:
                card.dataset.id ||
                `product-${index}`,

            name:
                name
                    ? name.textContent.trim()
                    : "Furniture Product",

            category:
                category
                    ? category.textContent.trim()
                    : "Furniture",

            price:
                price
                    ? parseFloat(
                        price.textContent
                            .replace(/[^0-9.]/g, "")
                    ) || 0
                    : 0,

            oldPrice:
                oldPrice
                    ? parseFloat(
                        oldPrice.textContent
                            .replace(/[^0-9.]/g, "")
                    ) || 0
                    : 0,

            image:
                image
                    ? image.src
                    : ""
        };
    }


    /* =====================================================
       COUNTS
    ===================================================== */

    function updateCartCount() {

        const count = cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        const badge =
            document.querySelector("#cartCount");

        if (badge) {
            badge.textContent = count;
        }
    }


    function updateWishlistCount() {

        const badge =
            document.querySelector("#wishlistCount");

        if (badge) {
            badge.textContent = wishlist.length;
        }
    }


    /* =====================================================
       CART
    ===================================================== */

    function createCartPanel() {

        let panel =
            document.querySelector(".cart-panel");

        if (panel) return panel;


        panel = document.createElement("div");

        panel.className = "cart-panel";

        panel.innerHTML = `

            <div class="cart-overlay"></div>

            <div class="cart-box">

                <div class="cart-header">

                    <h2>Shopping Cart</h2>

                    <button
                        type="button"
                        class="cart-close"
                        aria-label="Close cart"
                    >
                        ×
                    </button>

                </div>

                <div class="cart-items"></div>

                <div class="cart-summary"></div>

            </div>
        `;

        document.body.appendChild(panel);

        addCartStyles();

        panel
            .querySelector(".cart-close")
            .addEventListener(
                "click",
                closeCartPanel
            );

        panel
            .querySelector(".cart-overlay")
            .addEventListener(
                "click",
                closeCartPanel
            );

        return panel;
    }


    function openCartPanel() {

        const panel = createCartPanel();

        closeWishlistPanel();

        renderCart();

        panel.classList.add("open");

        document.body.style.overflow = "hidden";
    }


    function closeCartPanel() {

        const panel =
            document.querySelector(".cart-panel");

        if (!panel) return;

        panel.classList.remove("open");

        if (
            !document.querySelector(
                ".wishlist-panel.open"
            )
        ) {
            document.body.style.overflow = "";
        }
    }


    function addToCart(product) {

        if (!product) return;

        const existing =
            cart.find(item => item.id === product.id);


        if (existing) {

            existing.quantity =
                Number(existing.quantity) + 1;

            showNotification(
                `${product.name} quantity increased`
            );

        } else {

            cart.push({
                ...product,
                quantity: 1
            });

            showNotification(
                `${product.name} added to cart`
            );
        }


        saveStorage(
            "furnicasa_cart",
            cart
        );

        updateCartCount();

        renderCart();
    }


    function changeQuantity(id, amount) {

        const item =
            cart.find(product => product.id === id);

        if (!item) return;


        item.quantity =
            Number(item.quantity) + amount;


        if (item.quantity <= 0) {

            cart =
                cart.filter(
                    product => product.id !== id
                );
        }


        saveStorage(
            "furnicasa_cart",
            cart
        );

        updateCartCount();

        renderCart();
    }


    function removeFromCart(id) {

        cart =
            cart.filter(
                item => item.id !== id
            );

        saveStorage(
            "furnicasa_cart",
            cart
        );

        updateCartCount();

        renderCart();

        showNotification(
            "Product removed from cart"
        );
    }


    function calculateSubtotal() {

        return cart.reduce(
            (total, item) => {

                return total +
                    Number(item.price) *
                    Number(item.quantity);

            },
            0
        );
    }


    function calculateDiscount(subtotal) {

        return subtotal >= 999
            ? subtotal * 0.15
            : 0;
    }


    function renderCart() {

        const panel =
            document.querySelector(".cart-panel");

        if (!panel) return;


        const container =
            panel.querySelector(".cart-items");

        const summary =
            panel.querySelector(".cart-summary");


        if (cart.length === 0) {

            container.innerHTML = `

                <div class="empty-cart">

                    <div style="font-size:50px">
                        🛒
                    </div>

                    <h3>
                        Your Cart is Empty
                    </h3>

                    <p>
                        Add some beautiful furniture
                        to your cart.
                    </p>

                </div>
            `;

            summary.innerHTML = "";

            return;
        }


        container.innerHTML =
            cart.map(item => `

                <div class="cart-item">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div class="cart-item-info">

                        <h3>
                            ${item.name}
                        </h3>

                        <div class="cart-item-price">
                            ৳${formatPrice(item.price)}
                        </div>

                        <div class="quantity-control">

                            <button
                                type="button"
                                class="quantity-minus"
                                data-id="${item.id}"
                            >
                                −
                            </button>

                            <strong>
                                ${item.quantity}
                            </strong>

                            <button
                                type="button"
                                class="quantity-plus"
                                data-id="${item.id}"
                            >
                                +
                            </button>

                        </div>

                        <button
                            type="button"
                            class="remove-cart-item"
                            data-id="${item.id}"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `).join("");


        const subtotal =
            calculateSubtotal();

        const discount =
            calculateDiscount(subtotal);

        const total =
            subtotal - discount;


        summary.innerHTML = `

            <div class="summary-row">

                <span>Subtotal</span>

                <strong>
                    ৳${formatPrice(subtotal)}
                </strong>

            </div>


            <div class="summary-row">

                <span>Discount</span>

                <strong>
                    - ৳${formatPrice(discount)}
                </strong>

            </div>


            <div class="summary-row summary-total">

                <span>Total</span>

                <strong>
                    ৳${formatPrice(total)}
                </strong>

            </div>


            <button
                type="button"
                class="checkout-btn"
                id="checkoutBtn"
            >
                📦 Place Order
            </button>
        `;
    }


    /* =====================================================
       WISHLIST
    ===================================================== */

    function openWishlistPanel() {

        const panel =
            document.querySelector(".wishlist-panel");

        if (!panel) {
            console.warn(
                "Wishlist panel not found in HTML"
            );
            return;
        }


        closeCartPanel();

        renderWishlist();

        panel.classList.add("open");

        panel.style.visibility = "visible";
        panel.style.pointerEvents = "auto";

        document.body.style.overflow = "hidden";
    }


    function closeWishlistPanel() {

        const panel =
            document.querySelector(".wishlist-panel");

        if (!panel) return;

        panel.classList.remove("open");

        panel.style.visibility = "hidden";
        panel.style.pointerEvents = "none";

        document.body.style.overflow = "";
    }


    function updateWishlistButton(
        button,
        productId
    ) {

        const exists =
            wishlist.some(
                item => item.id === productId
            );


        if (exists) {

            button.textContent = "♥";
            button.style.color = "#c98222";

        } else {

            button.textContent = "♡";
            button.style.color = "";
        }
    }


    function toggleWishlist(product, button) {

        if (!product) return;


        const index =
            wishlist.findIndex(
                item => item.id === product.id
            );


        if (index === -1) {

            wishlist.push(product);

            showNotification(
                `${product.name} added to wishlist`
            );

        } else {

            wishlist.splice(index, 1);

            showNotification(
                `${product.name} removed from wishlist`
            );
        }


        saveStorage(
            "furnicasa_wishlist",
            wishlist
        );

        updateWishlistCount();

        updateWishlistButton(
            button,
            product.id
        );


        /*
           If Wishlist panel is currently open,
           refresh its content immediately.
        */

        const panel =
            document.querySelector(
                ".wishlist-panel"
            );

        if (
            panel &&
            panel.classList.contains("open")
        ) {
            renderWishlist();
        }
    }


    function renderWishlist() {

        const container =
            document.querySelector(
                "#wishlistItems"
            );

        if (!container) return;


        if (wishlist.length === 0) {

            container.innerHTML = `

                <div class="empty-cart">

                    <div style="font-size:50px">
                        ♡
                    </div>

                    <h3>
                        Your Wishlist is Empty
                    </h3>

                    <p>
                        Add products you love here.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML =
            wishlist.map(item => `

                <div class="wishlist-item">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div class="wishlist-item-info">

                        <h3>
                            ${item.name}
                        </h3>

                        <div>
                            <strong
                                class="cart-item-price"
                            >
                                ৳${formatPrice(item.price)}
                            </strong>
                        </div>

                        <small>
                            ${item.category}
                        </small>

                    </div>

                    <div class="wishlist-actions">

                        <button
                            type="button"
                            class="wishlist-add-cart"
                            data-id="${item.id}"
                        >
                            Add to Cart
                        </button>

                        <button
                            type="button"
                            class="wishlist-remove"
                            data-id="${item.id}"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `).join("");
    }


    /* =====================================================
       WISHLIST PRODUCT BUTTONS
    ===================================================== */

    document
        .querySelectorAll(".wishlist")
        .forEach(button => {

            const card =
                button.closest(".product-card");

            const product =
                getProductData(card);

            if (!product) return;


            updateWishlistButton(
                button,
                product.id
            );


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    toggleWishlist(
                        product,
                        button
                    );
                }
            );
        });


    /* =====================================================
       WISHLIST NAV
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const wishlistNav =
                event.target.closest(
                    "#wishlistNav"
                );

            if (wishlistNav) {

                event.preventDefault();
                event.stopPropagation();

                openWishlistPanel();

                return;
            }


            const wishlistClose =
                event.target.closest(
                    "#wishlistClose"
                );

            if (wishlistClose) {

                event.preventDefault();
                event.stopPropagation();

                closeWishlistPanel();

                return;
            }


            const wishlistOverlay =
                event.target.closest(
                    "#wishlistOverlay"
                );

            if (wishlistOverlay) {

                event.preventDefault();

                closeWishlistPanel();

                return;
            }


            const addWishlistCart =
                event.target.closest(
                    ".wishlist-add-cart"
                );

            if (addWishlistCart) {

                event.preventDefault();

                const product =
                    wishlist.find(
                        item =>
                            item.id ===
                            addWishlistCart.dataset.id
                    );

                if (product) {

                    addToCart(product);

                    openCartPanel();
                }

                return;
            }


            const removeWishlist =
                event.target.closest(
                    ".wishlist-remove"
                );

            if (removeWishlist) {

                event.preventDefault();

                const id =
                    removeWishlist.dataset.id;

                wishlist =
                    wishlist.filter(
                        item => item.id !== id
                    );

                saveStorage(
                    "furnicasa_wishlist",
                    wishlist
                );

                updateWishlistCount();

                renderWishlist();

                /*
                   Also update product love icon
                */

                productCards.forEach(card => {

                    const product =
                        getProductData(card);

                    const button =
                        card.querySelector(
                            ".wishlist"
                        );

                    if (
                        product &&
                        button &&
                        product.id === id
                    ) {
                        updateWishlistButton(
                            button,
                            id
                        );
                    }
                });

                showNotification(
                    "Removed from wishlist"
                );
            }
        }
    );


    /* =====================================================
       CART CLICK EVENTS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const plus =
                event.target.closest(
                    ".quantity-plus"
                );

            if (plus) {

                event.preventDefault();

                changeQuantity(
                    plus.dataset.id,
                    1
                );

                return;
            }


            const minus =
                event.target.closest(
                    ".quantity-minus"
                );

            if (minus) {

                event.preventDefault();

                changeQuantity(
                    minus.dataset.id,
                    -1
                );

                return;
            }


            const remove =
                event.target.closest(
                    ".remove-cart-item"
                );

            if (remove) {

                event.preventDefault();

                removeFromCart(
                    remove.dataset.id
                );

                return;
            }


            const checkout =
                event.target.closest(
                    "#checkoutBtn"
                );

            if (checkout) {

                event.preventDefault();

                placeOrder();

                return;
            }


            const cartNav =
                event.target.closest(
                    "#cartNav"
                );

            if (cartNav) {

                event.preventDefault();
                event.stopPropagation();

                openCartPanel();

                return;
            }


            const cartClose =
                event.target.closest(
                    "#cartClose"
                );

            if (cartClose) {

                event.preventDefault();
                event.stopPropagation();

                closeCartPanel();

                return;
            }


            const cartOverlay =
                event.target.closest(
                    "#cartOverlay"
                );

            if (cartOverlay) {

                event.preventDefault();

                closeCartPanel();

                return;
            }
        }
    );


    /* =====================================================
       ADD TO CART BUTTON
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".add-cart"
                );

            if (!button) return;

            event.preventDefault();
            event.stopPropagation();

            const card =
                button.closest(
                    ".product-card"
                );

            const product =
                getProductData(card);

            if (!product) return;

            addToCart(product);

            const oldText =
                button.textContent;

            button.textContent =
                "✓ Added to Cart";

            button.classList.add("added");

            setTimeout(() => {

                button.textContent =
                    oldText;

                button.classList.remove(
                    "added"
                );

            }, 1500);

            openCartPanel();
        }
    );


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    function placeOrder() {

        if (cart.length === 0) {

            showNotification(
                "Your cart is empty"
            );

            return;
        }


        const subtotal =
            calculateSubtotal();

        const discount =
            calculateDiscount(subtotal);

        const total =
            subtotal - discount;


        const order = {

            id:
                "ORD-" +
                Date.now(),

            items:
                JSON.parse(
                    JSON.stringify(cart)
                ),

            subtotal,

            discount,

            total,

            status:
                "Pending",

            date:
                new Date().toLocaleString(
                    "en-BD"
                )
        };


        orders.unshift(order);

        saveStorage(
            "furnicasa_orders",
            orders
        );


        /*
           Empty cart after order
        */

        cart = [];

        saveStorage(
            "furnicasa_cart",
            cart
        );


        updateCartCount();

        renderCart();

        renderOrders();

        showOrderSuccess(order);
    }


    /* =====================================================
       ORDER SUCCESS MODAL
    ===================================================== */

    function showOrderSuccess(order) {

        /*
           Remove previous modal
        */

        document
            .querySelector(
                ".order-success-modal"
            )
            ?.remove();


        const modal =
            document.createElement("div");

        modal.className =
            "order-success-modal";


        modal.innerHTML = `

            <div class="order-success-box">

                <button
                    type="button"
                    class="success-modal-close"
                    aria-label="Close"
                >
                    ×
                </button>

                <div style="font-size:50px">
                    ✅
                </div>

                <h2>
                    Order Placed!
                </h2>

                <p>
                    Your order has been
                    received successfully.
                </p>

                <strong>
                    Order ID:
                    ${order.id}
                </strong>

                <div
                    style="
                    margin:15px 0;
                    font-size:18px;
                    "
                >
                    Total:
                    <strong>
                        ৳${formatPrice(order.total)}
                    </strong>
                </div>

                <button
                    type="button"
                    class="success-close"
                >
                    Continue Shopping
                </button>

            </div>
        `;


        document.body.appendChild(modal);

        addOrderModalStyle();


        /*
           X CLOSE
        */

        modal
            .querySelector(
                ".success-modal-close"
            )
            .addEventListener(
                "click",
                () => {

                    modal.remove();

                }
            );


        /*
           Continue Shopping
        */

        modal
            .querySelector(
                ".success-close"
            )
            .addEventListener(
                "click",
                () => {

                    modal.remove();

                    closeCartPanel();

                    document
                        .querySelector(
                            ".products-section"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });
                }
            );


        /*
           Click outside modal
        */

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    modal.remove();
                }
            }
        );
    }


    /* =====================================================
       ORDERS
    ===================================================== */

    function getOrdersContainer() {

        return (
            document.querySelector(".orders-list") ||
            document.querySelector("#ordersList") ||
            document.querySelector(".orders-container")
        );
    }


    function renderOrders() {

        const container =
            getOrdersContainer();

        if (!container) {

            console.warn(
                "Orders container not found"
            );

            return;
        }


        if (orders.length === 0) {

            container.innerHTML = `

                <div
                    class="empty-orders"
                    style="
                    text-align:center;
                    padding:70px 20px;
                    "
                >

                    <div style="font-size:55px">
                        📦
                    </div>

                    <h2>
                        No Orders Yet
                    </h2>

                    <p style="color:#777">
                        Your orders will appear
                        here after you place
                        an order.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = `

            <div class="orders-header">

                <span class="orders-label">
                    CUSTOMER AREA
                </span>

                <h2>
                    My Orders
                </h2>

            </div>

            <div class="orders-grid">

                ${orders.map(
                    renderSingleOrder
                ).join("")}

            </div>
        `;

        addOrdersStyle();
    }


    function renderSingleOrder(order) {

        return `

            <div class="order-card">

                <div class="order-top">

                    <div>

                        <strong>
                            ${order.id}
                        </strong>

                        <div class="order-date">
                            ${order.date}
                        </div>

                    </div>

                    <span class="order-status">
                        ${order.status}
                    </span>

                </div>


                <div class="order-products">

                    ${order.items.map(item => `

                        <div class="order-product">

                            <img
                                src="${item.image}"
                                alt="${item.name}"
                            >

                            <div class="order-product-info">

                                <strong>
                                    ${item.name}
                                </strong>

                                <div>
                                    Qty:
                                    ${item.quantity}
                                </div>

                            </div>

                            <strong>
                                ৳${formatPrice(
                                    Number(item.price) *
                                    Number(item.quantity)
                                )}
                            </strong>

                        </div>

                    `).join("")}

                </div>


                <div class="order-total">

                    <span>
                        Subtotal:
                        <strong>
                            ৳${formatPrice(order.subtotal)}
                        </strong>
                    </span>

                    <span>
                        Discount:
                        <strong>
                            - ৳${formatPrice(order.discount)}
                        </strong>
                    </span>

                    <span class="final-order-total">
                        Total:
                        <strong>
                            ৳${formatPrice(order.total)}
                        </strong>
                    </span>

                </div>

            </div>
        `;
    }


    /* =====================================================
       MY ORDERS NAV
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest("a");

            if (!link) return;

            const text =
                link.textContent
                    .trim()
                    .toLowerCase();

            if (text === "my orders") {

                event.preventDefault();

                closeCartPanel();
                closeWishlistPanel();

                renderOrders();

                const target =
                    getOrdersContainer();

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    let searchInput =
        document.querySelector(".search-input") ||
        document.querySelector('input[type="search"]') ||
        document.querySelector(
            'input[placeholder*="Search" i]'
        );


    function performSearch(value) {

        const search =
            String(value || "")
                .toLowerCase()
                .trim();


        let found = 0;


        productCards.forEach(card => {

            const product =
                getProductData(card);

            if (!product) return;


            const searchable =
                `${product.name} ${product.category}`
                    .toLowerCase();


            const keywords =
                search
                    .split(/\s+/)
                    .filter(Boolean);


            const matches =
                !search ||
                keywords.every(
                    keyword =>
                        searchable.includes(keyword)
                );


            card.style.display =
                matches ? "" : "none";


            if (matches) found++;
        });


        const section =
            document.querySelector(
                ".products-section"
            );


        let noResult =
            document.querySelector(
                ".search-no-result"
            );


        if (search && found === 0) {

            if (!noResult) {

                noResult =
                    document.createElement("div");

                noResult.className =
                    "search-no-result";

                noResult.style.cssText = `
                    text-align:center;
                    padding:30px;
                    color:#777;
                `;

                section
                    ?.querySelector(".container")
                    ?.appendChild(noResult);
            }


            noResult.innerHTML = `
                <div style="font-size:35px">
                    🔍
                </div>

                <strong>
                    No products found
                </strong>

                <p>
                    Try sofa, chair, table,
                    wardrobe or cabinet.
                </p>
            `;

            noResult.style.display = "block";

        } else if (noResult) {

            noResult.style.display = "none";
        }
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {
                performSearch(
                    searchInput.value
                );
            }
        );


        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    performSearch(
                        searchInput.value
                    );
                }
            }
        );
    }


    document
        .querySelector("#searchButton")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                performSearch(
                    searchInput
                        ? searchInput.value
                        : ""
                );
            }
        );


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    categoryCards.forEach(category => {

        category.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const title =
                    category.querySelector("h3");

                const categoryName =
                    title
                        ? title.textContent
                            .trim()
                            .toLowerCase()
                        : "";


                if (
                    !categoryName ||
                    categoryName === "view all"
                ) {

                    showAllProducts();

                    return;
                }


                let found = 0;


                productCards.forEach(card => {

                    const product =
                        getProductData(card);

                    if (!product) return;


                    const searchable =
                        `${product.name} ${product.category}`
                            .toLowerCase();


                    const matches =
                        searchable.includes(
                            categoryName
                        );


                    card.style.display =
                        matches ? "" : "none";


                    if (matches) found++;
                });


                document
                    .querySelector(
                        ".products-section"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });


                if (!found) {

                    showNotification(
                        `No ${categoryName} products found`
                    );
                }
            }
        );
    });


    function showAllProducts() {

        productCards.forEach(card => {
            card.style.display = "";
        });


        if (searchInput) {
            searchInput.value = "";
        }


        const noResult =
            document.querySelector(
                ".search-no-result"
            );

        if (noResult) {
            noResult.style.display = "none";
        }
    }


    document
        .querySelectorAll(".view-all")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    showAllProducts();
                }
            );
        });


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const newsletter =
        document.querySelector(
            ".newsletter-form"
        );


    if (newsletter) {

        newsletter.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const input =
                    newsletter.querySelector("input");

                const email =
                    input
                        ? input.value.trim()
                        : "";


                if (!email) {

                    showNotification(
                        "Please enter your email"
                    );

                    return;
                }


                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(email)
                ) {

                    showNotification(
                        "Please enter a valid email"
                    );

                    return;
                }


                showNotification(
                    "Thank you for subscribing!"
                );

                newsletter.reset();
            }
        );
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (mobileMenu && navLinks) {

        mobileMenu.addEventListener(
            "click",
            () => {

                navLinks.classList.toggle(
                    "mobile-active"
                );
            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "mobile-active"
                        );
                    }
                );
            });


        const mobileStyle =
            document.createElement("style");

        mobileStyle.textContent = `

            @media(max-width:768px) {

                .nav-links.mobile-active {

                    display:flex;

                    position:absolute;

                    top:72px;

                    left:0;

                    width:100%;

                    background:#fff;

                    flex-direction:column;

                    align-items:flex-start;

                    padding:15px 5%;

                    box-shadow:
                        0 10px 20px
                        rgba(0,0,0,.08);

                    z-index:999;
                }

                .nav-links.mobile-active a {

                    width:100%;

                    padding:13px 0;
                }
            }
        `;

        document.head.appendChild(
            mobileStyle
        );
    }


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            closeCartPanel();
            closeWishlistPanel();

            document
                .querySelector(
                    ".order-success-modal"
                )
                ?.remove();
        }
    );


    /* =====================================================
       STYLES
    ===================================================== */

    function addCartStyles() {

        if (
            document.getElementById(
                "furnicasaCartStyles"
            )
        ) return;


        const style =
            document.createElement("style");

        style.id =
            "furnicasaCartStyles";


        style.textContent = `

            .cart-panel {

                position:fixed;
                inset:0;
                z-index:9998;
                visibility:hidden;
            }

            .cart-panel.open {
                visibility:visible;
            }

            .cart-overlay {

                position:absolute;
                inset:0;
                background:rgba(0,0,0,.45);
                opacity:0;
                transition:.3s;
            }

            .cart-panel.open .cart-overlay {
                opacity:1;
            }

            .cart-box {

                position:absolute;
                right:0;
                top:0;

                width:min(430px,94%);
                height:100%;

                background:#fff;

                padding:22px;

                overflow-y:auto;

                transform:translateX(100%);

                transition:.3s;
            }

            .cart-panel.open .cart-box {
                transform:translateX(0);
            }

            .cart-header {

                display:flex;
                justify-content:space-between;
                align-items:center;

                border-bottom:1px solid #eee;

                padding-bottom:15px;
                margin-bottom:15px;
            }

            .cart-close {

                border:none;
                background:none;

                font-size:30px;
                cursor:pointer;
            }

            .cart-item {

                display:flex;
                gap:12px;

                padding:14px 0;

                border-bottom:1px solid #eee;
            }

            .cart-item img {

                width:75px;
                height:75px;

                object-fit:cover;

                border-radius:7px;
            }

            .cart-item-info {
                flex:1;
            }

            .cart-item-info h3 {
                font-size:14px;
                margin-bottom:5px;
            }

            .cart-item-price {

                color:#c98222;
                font-weight:700;
            }

            .quantity-control {

                display:flex;
                align-items:center;

                gap:8px;

                margin-top:8px;
            }

            .quantity-control button {

                width:28px;
                height:28px;

                border:1px solid #ddd;

                background:#fff;

                cursor:pointer;

                border-radius:4px;
            }

            .remove-cart-item {

                border:none;
                background:none;

                color:#d33;

                cursor:pointer;

                font-size:12px;

                margin-top:7px;
            }

            .summary-row {

                display:flex;
                justify-content:space-between;

                margin-bottom:10px;
            }

            .summary-total {

                font-size:20px;
                font-weight:700;
            }

            .checkout-btn {

                width:100%;

                border:none;

                background:#c98222;

                color:#fff;

                padding:14px;

                border-radius:5px;

                cursor:pointer;

                font-weight:700;

                margin-top:12px;
            }

            .empty-cart {

                text-align:center;

                padding:60px 10px;

                color:#777;
            }

            .order-success-modal {

                position:fixed;
                inset:0;

                z-index:10000;

                background:rgba(0,0,0,.5);

                display:flex;

                align-items:center;
                justify-content:center;

                padding:20px;
            }

            .order-success-box {

                position:relative;

                background:#fff;

                width:min(420px,100%);

                padding:35px;

                text-align:center;

                border-radius:10px;

                box-shadow:
                    0 20px 50px
                    rgba(0,0,0,.2);
            }

            .success-modal-close {

                position:absolute;

                top:10px;
                right:15px;

                border:none;

                background:none;

                font-size:28px;

                cursor:pointer;

                color:#555;
            }

            .success-close {

                border:none;

                background:#c98222;

                color:#fff;

                padding:12px 22px;

                border-radius:5px;

                cursor:pointer;

                font-weight:600;
            }

            .orders-label {

                color:#c98222;

                font-size:11px;

                font-weight:700;

                letter-spacing:2px;
            }

            .orders-header h2 {

                font-size:34px;

                margin-top:7px;
            }

            .order-card {

                border:1px solid #e5e5e5;

                border-radius:10px;

                padding:20px;

                margin-bottom:18px;

                background:#fff;

                transition:.2s;
            }

            .order-card:hover {

                box-shadow:
                    0 10px 30px
                    rgba(0,0,0,.07);
            }

            .order-top {

                display:flex;

                justify-content:space-between;

                gap:15px;

                flex-wrap:wrap;

                padding-bottom:15px;

                border-bottom:1px solid #eee;
            }

            .order-date {

                color:#777;

                font-size:13px;

                margin-top:5px;
            }

            .order-status {

                padding:6px 12px;

                border-radius:20px;

                background:#fff3df;

                color:#c98222;

                font-size:12px;

                font-weight:700;
            }

            .order-product {

                display:flex;

                align-items:center;

                gap:12px;

                padding:10px 0;

                border-bottom:1px solid #f2f2f2;
            }

            .order-product img {

                width:65px;
                height:65px;

                object-fit:cover;

                border-radius:6px;
            }

            .order-product-info {
                flex:1;
            }

            .order-product-info div {

                color:#777;

                font-size:13px;

                margin-top:4px;
            }

            .order-total {

                display:flex;

                justify-content:flex-end;

                gap:25px;

                margin-top:18px;

                flex-wrap:wrap;
            }

            .final-order-total {
                font-size:18px;
            }

            .wishlist-item {

                display:flex;

                align-items:center;

                gap:12px;

                padding:15px 0;

                border-bottom:1px solid #eee;
            }

            .wishlist-item img {

                width:75px;
                height:75px;

                object-fit:cover;

                border-radius:7px;
            }

            .wishlist-item-info {

                flex:1;
            }

            .wishlist-item-info h3 {

                font-size:14px;

                margin-bottom:5px;
            }

            .wishlist-actions {

                display:flex;

                flex-direction:column;

                gap:6px;
            }

            .wishlist-add-cart {

                border:none;

                background:#c98222;

                color:#fff;

                padding:8px 10px;

                border-radius:4px;

                cursor:pointer;
            }

            .wishlist-remove {

                border:none;

                background:none;

                color:#d33;

                cursor:pointer;

                font-size:12px;
            }

            @media(max-width:600px) {

                .wishlist-item {

                    align-items:flex-start;
                }

                .wishlist-actions {

                    min-width:80px;
                }

                .order-card {

                    padding:15px;
                }

                .order-total {

                    justify-content:flex-start;

                    flex-direction:column;

                    gap:8px;
                }
            }
        `;


        document.head.appendChild(style);
    }


    function addOrderModalStyle() {
        /* Modal styles are included in addCartStyles */
        addCartStyles();
    }


    function addOrdersStyle() {
        /* Order styles are included in addCartStyles */
        addCartStyles();
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    createCartPanel();

    updateCartCount();

    updateWishlistCount();

    renderCart();

    renderOrders();


    /*
       Make sure wishlist buttons reflect
       saved localStorage state after refresh.
    */

    document
        .querySelectorAll(".wishlist")
        .forEach(button => {

            const card =
                button.closest(".product-card");

            const product =
                getProductData(card);

            if (product) {

                updateWishlistButton(
                    button,
                    product.id
                );
            }
        });


    console.log("Cart:", cart);
    console.log("Wishlist:", wishlist);
    console.log("Orders:", orders);

});