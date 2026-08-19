/* =========================================================
   FURNICASA
   COMPLETE WORKING FRONTEND JS

   FEATURES:
   - Cart
   - Wishlist
   - Search
   - Search button
   - Search recommendations
   - Category filter
   - Cart quantity
   - Remove cart
   - Checkout / Place Order
   - My Orders
   - Order history
   - Discount
   - Newsletter
   - Mobile menu
   - Notifications
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("FurniCasa JS Loaded Successfully");


    /* =====================================================
       STORAGE
    ===================================================== */

    let cart = loadStorage(
        "furnicasa_cart",
        []
    );

    let wishlist = loadStorage(
        "furnicasa_wishlist",
        []
    );

    let orders = loadStorage(
        "furnicasa_orders",
        []
    );


    function loadStorage(key, defaultValue) {

        try {

            const data =
                localStorage.getItem(key);

            return data
                ? JSON.parse(data)
                : defaultValue;

        } catch (error) {

            console.error(
                "Storage error:",
                key,
                error
            );

            return defaultValue;
        }

    }


    function saveStorage(key, data) {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productCards =
        Array.from(
            document.querySelectorAll(
                ".product-card"
            )
        );

    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );

    const navLinks =
        document.querySelector(
            ".nav-links"
        );

    const mobileMenu =
        document.querySelector(
            ".mobile-menu"
        );


    /* =====================================================
       PRICE
    ===================================================== */

    function formatPrice(price) {

        return Number(
            price || 0
        ).toLocaleString(
            "en-BD"
        );

    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(message) {

        let notification =
            document.querySelector(
                ".site-notification"
            );


        if (!notification) {

            notification =
                document.createElement(
                    "div"
                );

            notification.className =
                "site-notification";


            notification.style.cssText = `

                position: fixed;

                right: 20px;

                bottom: 20px;

                z-index: 99999;

                background: #1f241f;

                color: white;

                padding: 14px 20px;

                border-radius: 7px;

                font-size: 14px;

                box-shadow:
                    0 10px 30px
                    rgba(0,0,0,.18);

                transform:
                    translateY(100px);

                opacity: 0;

                transition:
                    .3s ease;

            `;


            document.body.appendChild(
                notification
            );

        }


        notification.textContent =
            message;


        notification.style.transform =
            "translateY(0)";


        notification.style.opacity =
            "1";


        clearTimeout(
            notification.timer
        );


        notification.timer =
            setTimeout(() => {

                notification.style.transform =
                    "translateY(100px)";

                notification.style.opacity =
                    "0";

            }, 2500);

    }


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    function getProductData(card) {

        if (!card) return null;


        const index =
            productCards.indexOf(card);


        const image =
            card.querySelector(
                ".product-image img"
            );


        const name =
            card.querySelector(
                "h3"
            );


        const category =
            card.querySelector(
                ".product-category"
            );


        const price =
            card.querySelector(
                ".price strong"
            );


        const oldPrice =
            card.querySelector(
                ".price del"
            );


        const productId =
            card.dataset.id ||
            "product-" + index;


        return {

            id: productId,

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
                            .replace(
                                /[^0-9.]/g,
                                ""
                            )
                    ) || 0
                    : 0,

            oldPrice:
                oldPrice
                    ? parseFloat(
                        oldPrice.textContent
                            .replace(
                                /[^0-9.]/g,
                                ""
                            )
                    ) || 0
                    : 0,

            image:
                image
                    ? image.src
                    : ""

        };

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const totalItems =
            cart.reduce(
                (total, item) => {

                    return total +
                        Number(
                            item.quantity || 0
                        );

                },
                0
            );


        const badges =
            document.querySelectorAll(
                ".badge"
            );


        /*
           HTML currently has
           wishlist badge + cart badge.
        */


        const cartIcons =
            Array.from(
                document.querySelectorAll(
                    ".nav-icon"
                )
            ).filter(
                icon =>
                    icon.textContent.includes(
                        "🛒"
                    )
            );


        cartIcons.forEach(icon => {

            const badge =
                icon.querySelector(
                    ".badge"
                );

            if (badge) {

                badge.textContent =
                    totalItems;

            }

        });


        /*
           Fallback:
           last badge = cart
        */

        if (
            cartIcons.length === 0 &&
            badges.length >= 2
        ) {

            badges[
                badges.length - 1
            ].textContent =
                totalItems;

        }

    }


    /* =====================================================
       WISHLIST COUNT
    ===================================================== */

    function updateWishlistCount() {

        const wishlistIcons =
            Array.from(
                document.querySelectorAll(
                    ".nav-icon"
                )
            ).filter(
                icon =>
                    icon.textContent.includes(
                        "♡"
                    ) ||
                    icon.textContent.includes(
                        "♥"
                    )
            );


        wishlistIcons.forEach(icon => {

            const badge =
                icon.querySelector(
                    ".badge"
                );


            if (badge) {

                badge.textContent =
                    wishlist.length;

            }

        });


        /*
           Fallback
        */

        const badges =
            document.querySelectorAll(
                ".badge"
            );


        if (
            wishlistIcons.length === 0 &&
            badges.length >= 2
        ) {

            badges[0].textContent =
                wishlist.length;

        }

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    function addToCart(product) {

        if (!product) return;


        const existing =
            cart.find(
                item =>
                    item.id === product.id
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity
                ) + 1;


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


    /* =====================================================
       ADD CART BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".add-cart"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".product-card"
                        );


                    const product =
                        getProductData(
                            card
                        );


                    addToCart(product);


                    const original =
                        button.textContent;


                    button.textContent =
                        "✓ Added to Cart";


                    button.classList.add(
                        "added"
                    );


                    setTimeout(() => {

                        button.textContent =
                            original;

                        button.classList.remove(
                            "added"
                        );

                    }, 1500);


                    openCartPanel();

                }
            );

        });


    /* =====================================================
       WISHLIST
    ===================================================== */

    document
        .querySelectorAll(
            ".wishlist"
        )
        .forEach(button => {

            const card =
                button.closest(
                    ".product-card"
                );


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


                    const index =
                        wishlist.findIndex(
                            item =>
                                item.id ===
                                product.id
                        );


                    if (index === -1) {

                        wishlist.push(
                            product
                        );


                        button.textContent =
                            "♥";


                        button.style.color =
                            "#c98222";


                        showNotification(
                            `${product.name} added to wishlist`
                        );

                    } else {

                        wishlist.splice(
                            index,
                            1
                        );


                        button.textContent =
                            "♡";


                        button.style.color =
                            "";


                        showNotification(
                            `${product.name} removed from wishlist`
                        );

                    }


                    saveStorage(
                        "furnicasa_wishlist",
                        wishlist
                    );


                    updateWishlistCount();

                }
            );

        });


    function updateWishlistButton(
        button,
        productId
    ) {

        const exists =
            wishlist.some(
                item =>
                    item.id ===
                    productId
            );


        if (exists) {

            button.textContent =
                "♥";

            button.style.color =
                "#c98222";

        } else {

            button.textContent =
                "♡";

            button.style.color =
                "";

        }

    }


    /* =====================================================
       CART PANEL
    ===================================================== */

    function createCartPanel() {

        if (
            document.querySelector(
                ".cart-panel"
            )
        ) {

            return;

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "cart-panel";


        panel.innerHTML = `

            <div class="cart-overlay"></div>

            <div class="cart-box">

                <div class="cart-header">

                    <h2>
                        Shopping Cart
                    </h2>

                    <button
                        class="cart-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <div class="cart-items">
                </div>


                <div class="cart-summary">
                </div>

            </div>

        `;


        document.body.appendChild(
            panel
        );


        addCartStyles();


        panel
            .querySelector(
                ".cart-close"
            )
            .addEventListener(
                "click",
                closeCartPanel
            );


        panel
            .querySelector(
                ".cart-overlay"
            )
            .addEventListener(
                "click",
                closeCartPanel
            );

    }


    function addCartStyles() {

        if (
            document.getElementById(
                "furnicasaCartStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "furnicasaCartStyles";


        style.textContent = `

            .cart-panel {

                position: fixed;

                inset: 0;

                z-index: 9998;

                visibility: hidden;

            }


            .cart-panel.open {

                visibility: visible;

            }


            .cart-overlay {

                position: absolute;

                inset: 0;

                background:
                    rgba(0,0,0,.45);

                opacity: 0;

                transition: .3s;

            }


            .cart-panel.open
            .cart-overlay {

                opacity: 1;

            }


            .cart-box {

                position: absolute;

                right: 0;

                top: 0;

                width:
                    min(430px, 94%);

                height: 100%;

                background: white;

                padding: 22px;

                overflow-y: auto;

                transform:
                    translateX(100%);

                transition: .3s;

            }


            .cart-panel.open
            .cart-box {

                transform:
                    translateX(0);

            }


            .cart-header {

                display: flex;

                justify-content:
                    space-between;

                align-items: center;

                border-bottom:
                    1px solid #eee;

                padding-bottom: 15px;

                margin-bottom: 15px;

            }


            .cart-close {

                border: none;

                background: none;

                font-size: 30px;

                cursor: pointer;

            }


            .cart-item {

                display: flex;

                gap: 12px;

                padding: 14px 0;

                border-bottom:
                    1px solid #eee;

            }


            .cart-item img {

                width: 75px;

                height: 75px;

                object-fit: cover;

                border-radius: 7px;

            }


            .cart-item-info {

                flex: 1;

            }


            .cart-item-info h3 {

                font-size: 14px;

                margin-bottom: 5px;

            }


            .cart-item-price {

                color: #c98222;

                font-weight: 700;

            }


            .quantity-control {

                display: flex;

                align-items: center;

                gap: 8px;

                margin-top: 8px;

            }


            .quantity-control button {

                width: 28px;

                height: 28px;

                border: 1px solid #ddd;

                background: white;

                cursor: pointer;

                border-radius: 4px;

            }


            .remove-cart-item {

                border: none;

                background: none;

                color: #d33;

                cursor: pointer;

                font-size: 12px;

                margin-top: 7px;

            }


            .cart-summary {

                margin-top: 20px;

                padding-top: 20px;

                border-top:
                    1px solid #ddd;

            }


            .summary-row {

                display: flex;

                justify-content:
                    space-between;

                margin-bottom: 10px;

            }


            .summary-total {

                font-size: 20px;

                font-weight: 700;

            }


            .checkout-btn {

                width: 100%;

                border: none;

                background: #c98222;

                color: white;

                padding: 14px;

                border-radius: 5px;

                cursor: pointer;

                font-weight: 700;

                margin-top: 12px;

            }


            .empty-cart {

                text-align: center;

                padding: 60px 10px;

                color: #777;

            }

        `;


        document.head.appendChild(
            style
        );

    }


    createCartPanel();


    /* =====================================================
       OPEN CART
    ===================================================== */

    function openCartPanel() {

        createCartPanel();

        renderCart();


        const panel =
            document.querySelector(
                ".cart-panel"
            );


        if (panel) {

            panel.classList.add(
                "open"
            );

            document.body.style.overflow =
                "hidden";

        }

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    function closeCartPanel() {

        const panel =
            document.querySelector(
                ".cart-panel"
            );


        if (panel) {

            panel.classList.remove(
                "open"
            );

        }


        document.body.style.overflow =
            "";

    }


    /* =====================================================
       CART ICON
    ===================================================== */

    document
        .querySelectorAll(
            ".nav-icon"
        )
        .forEach(icon => {

            if (
                icon.textContent.includes(
                    "🛒"
                )
            ) {

                icon.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        openCartPanel();

                    }
                );

            }

        });


    /* =====================================================
       RENDER CART
    ===================================================== */

    function renderCart() {

        const container =
            document.querySelector(
                ".cart-items"
            );


        const summary =
            document.querySelector(
                ".cart-summary"
            );


        if (!container) return;


        if (cart.length === 0) {

            container.innerHTML = `

                <div class="empty-cart">

                    <div
                        style="font-size:50px"
                    >
                        🛒
                    </div>

                    <h3>
                        Your Cart is Empty
                    </h3>

                    <p>
                        Add some beautiful
                        furniture to your cart.
                    </p>

                </div>

            `;


            if (summary) {

                summary.innerHTML =
                    "";

            }

            return;

        }


        container.innerHTML =
            cart.map(item => `

                <div
                    class="cart-item"
                >

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >


                    <div
                        class="cart-item-info"
                    >

                        <h3>
                            ${item.name}
                        </h3>

                        <div
                            class="cart-item-price"
                        >
                            ৳${formatPrice(
                                item.price
                            )}
                        </div>


                        <div
                            class="quantity-control"
                        >

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
            calculateDiscount(
                subtotal
            );


        const total =
            subtotal - discount;


        if (summary) {

            summary.innerHTML = `

                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ৳${formatPrice(
                            subtotal
                        )}
                    </strong>

                </div>


                <div class="summary-row">

                    <span>
                        Discount
                    </span>

                    <strong>
                        - ৳${formatPrice(
                            discount
                        )}
                    </strong>

                </div>


                <div
                    class="summary-row summary-total"
                >

                    <span>
                        Total
                    </span>

                    <strong>
                        ৳${formatPrice(
                            total
                        )}
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

    }


    /* =====================================================
       CART ACTIONS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const plus =
                event.target.closest(
                    ".quantity-plus"
                );


            const minus =
                event.target.closest(
                    ".quantity-minus"
                );


            const remove =
                event.target.closest(
                    ".remove-cart-item"
                );


            const checkout =
                event.target.closest(
                    "#checkoutBtn"
                );


            if (plus) {

                changeQuantity(
                    plus.dataset.id,
                    1
                );

            }


            if (minus) {

                changeQuantity(
                    minus.dataset.id,
                    -1
                );

            }


            if (remove) {

                removeFromCart(
                    remove.dataset.id
                );

            }


            if (checkout) {

                placeOrder();

            }

        }
    );


    function changeQuantity(
        id,
        amount
    ) {

        const item =
            cart.find(
                product =>
                    product.id === id
            );


        if (!item) return;


        item.quantity =
            Number(
                item.quantity
            ) + amount;


        if (
            item.quantity <= 0
        ) {

            cart =
                cart.filter(
                    product =>
                        product.id !== id
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
                item =>
                    item.id !== id
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


    /* =====================================================
       DISCOUNT
    ===================================================== */

    function calculateSubtotal() {

        return cart.reduce(
            (total, item) => {

                return total +
                    (
                        Number(
                            item.price
                        ) *
                        Number(
                            item.quantity
                        )
                    );

            },
            0
        );

    }


    function calculateDiscount(
        subtotal
    ) {

        /*
           DEMO DISCOUNT

           15% OFF if subtotal >= 999

           Later Admin CRM will control
           this dynamically.
        */

        if (
            subtotal >= 999
        ) {

            return subtotal * 0.15;

        }


        return 0;

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    function placeOrder() {

        if (
            cart.length === 0
        ) {

            showNotification(
                "Your cart is empty"
            );

            return;

        }


        const subtotal =
            calculateSubtotal();


        const discount =
            calculateDiscount(
                subtotal
            );


        const total =
            subtotal - discount;


        const order = {

            id:
                "ORD-" +
                Date.now(),

            items:
                JSON.parse(
                    JSON.stringify(
                        cart
                    )
                ),

            subtotal:
                subtotal,

            discount:
                discount,

            total:
                total,

            status:
                "Pending",

            date:
                new Date()
                    .toLocaleString(
                        "en-BD"
                    )

        };


        orders.unshift(
            order
        );


        saveStorage(
            "furnicasa_orders",
            orders
        );


        cart = [];


        saveStorage(
            "furnicasa_cart",
            cart
        );


        updateCartCount();

        renderCart();


        showOrderSuccess(
            order
        );

    }


    /* =====================================================
       ORDER SUCCESS
    ===================================================== */

    function showOrderSuccess(
        order
    ) {

        const old =
            document.querySelector(
                ".order-success-modal"
            );


        if (old) {

            old.remove();

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "order-success-modal";


        modal.innerHTML = `

            <div
                class="order-success-box"
            >

                <div
                    style="
                    font-size:50px;
                    "
                >
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
                        ৳${formatPrice(
                            order.total
                        )}
                    </strong>

                </div>


                <button
                    class="success-close"
                    type="button"
                >
                    Continue Shopping
                </button>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        addOrderModalStyle();


        modal
            .querySelector(
                ".success-close"
            )
            .addEventListener(
                "click",
                () => {

                    modal.remove();

                    closeCartPanel();

                }
            );

    }


    function addOrderModalStyle() {

        if (
            document.getElementById(
                "orderModalStyle"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "orderModalStyle";


        style.textContent = `

            .order-success-modal {

                position: fixed;

                inset: 0;

                z-index: 10000;

                background:
                    rgba(0,0,0,.5);

                display: flex;

                align-items: center;

                justify-content: center;

                padding: 20px;

            }


            .order-success-box {

                background: white;

                width:
                    min(420px,100%);

                padding: 35px;

                text-align: center;

                border-radius: 10px;

                box-shadow:
                    0 20px 50px
                    rgba(0,0,0,.2);

            }


            .order-success-box h2 {

                margin: 10px 0;

            }


            .order-success-box p {

                color: #777;

                margin-bottom: 12px;

            }


            .success-close {

                border: none;

                background:
                    #c98222;

                color: white;

                padding:
                    12px 22px;

                border-radius: 5px;

                cursor: pointer;

                font-weight: 600;

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    let searchInput =
        document.querySelector(
            ".search-input"
        );


    /*
       Support different search input names
    */

    if (!searchInput) {

        searchInput =
            document.querySelector(
                'input[type="search"]'
            );

    }


    if (!searchInput) {

        searchInput =
            document.querySelector(
                'input[placeholder*="Search" i]'
            );

    }


    /*
       Search icon
    */

    const searchIcons =
        Array.from(
            document.querySelectorAll(
                ".nav-icon"
            )
        ).filter(
            icon =>
                icon.textContent.includes(
                    "⌕"
                ) ||
                icon.textContent.includes(
                    "🔍"
                ) ||
                icon.textContent.includes(
                    "search"
                )
        );


    /*
       If there is no search input,
       create one when search icon is clicked.
    */

    searchIcons.forEach(icon => {

        icon.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!searchInput) {

                    createSearchBox();

                    searchInput =
                        document.querySelector(
                            ".furnicasa-search-input"
                        );

                }


                if (searchInput) {

                    searchInput.focus();

                }

            }
        );

    });


    function createSearchBox() {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "furnicasa-search-wrapper";


        wrapper.innerHTML = `

            <div
                style="
                position:fixed;
                top:90px;
                left:50%;
                transform:translateX(-50%);
                width:min(600px,90%);
                z-index:9997;
                background:white;
                padding:15px;
                border-radius:8px;
                box-shadow:
                    0 10px 40px
                    rgba(0,0,0,.2);
                "
            >

                <input
                    type="search"
                    class="furnicasa-search-input"
                    placeholder="Search furniture..."
                    style="
                    width:100%;
                    padding:14px;
                    border:1px solid #ddd;
                    outline:none;
                    font-size:15px;
                    "
                >

                <div
                    class="search-results"
                ></div>

            </div>

        `;


        document.body.appendChild(
            wrapper
        );


        const input =
            wrapper.querySelector(
                ".furnicasa-search-input"
            );


        input.addEventListener(
            "input",
            () => {

                performSearch(
                    input.value
                );

            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    performSearch(
                        input.value
                    );

                }

            }
        );

    }


    function performSearch(
        value
    ) {

        const search =
            String(value || "")
                .toLowerCase()
                .trim();


        let found = 0;


        productCards.forEach(
            card => {

                const product =
                    getProductData(
                        card
                    );


                if (!product) return;


                const name =
                    product.name
                        .toLowerCase();


                const category =
                    product.category
                        .toLowerCase();


                const searchable =
                    name +
                    " " +
                    category;


                /*
                   Recommendation matching
                */

                const keywords =
                    search
                        .split(
                            /\s+/
                        )
                        .filter(
                            Boolean
                        );


                const matches =
                    !search ||
                    keywords.every(
                        keyword =>
                            searchable.includes(
                                keyword
                            )
                    );


                card.style.display =
                    matches
                        ? ""
                        : "none";


                if (matches) {

                    found++;

                }

            }
        );


        const productsSection =
            document.querySelector(
                ".products-section"
            );


        if (
            search &&
            productsSection
        ) {

            productsSection.scrollIntoView(
                {
                    behavior:
                        "smooth"
                }
            );

        }


        /*
           No result
        */

        let noResult =
            document.querySelector(
                ".search-no-result"
            );


        if (
            search &&
            found === 0
        ) {

            if (!noResult) {

                noResult =
                    document.createElement(
                        "div"
                    );

                noResult.className =
                    "search-no-result";


                noResult.style.cssText = `

                    text-align:center;

                    padding:30px;

                    margin:20px auto;

                    color:#777;

                    font-size:16px;

                `;


                if (
                    productsSection
                ) {

                    productsSection
                        .querySelector(
                            ".container"
                        )
                        ?.appendChild(
                            noResult
                        );

                }

            }


            if (noResult) {

                noResult.innerHTML = `

                    <div
                        style="
                        font-size:35px;
                        "
                    >
                        🔍
                    </div>

                    <strong>
                        No products found
                    </strong>

                    <p>
                        Try searching for
                        sofa, chair, table,
                        wardrobe or cabinet.
                    </p>

                `;

                noResult.style.display =
                    "block";

            }

        } else {

            if (noResult) {

                noResult.style.display =
                    "none";

            }

        }

    }


    /*
       Existing search input
    */

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

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    performSearch(
                        searchInput.value
                    );

                }

            }
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    categoryCards.forEach(
        category => {

            category.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const title =
                        category
                            .querySelector(
                                "h3"
                            );


                    const categoryName =
                        title
                            ? title.textContent
                                .trim()
                                .toLowerCase()
                            : "";


                    if (
                        !categoryName ||
                        categoryName ===
                        "view all"
                    ) {

                        showAllProducts();

                        return;

                    }


                    let found = 0;


                    productCards.forEach(
                        card => {

                            const product =
                                getProductData(
                                    card
                                );


                            const searchable =
                                (
                                    product.name +
                                    " " +
                                    product.category
                                )
                                .toLowerCase();


                            const matches =
                                searchable.includes(
                                    categoryName
                                );


                            card.style.display =
                                matches
                                    ? ""
                                    : "none";


                            if (matches) {

                                found++;

                            }

                        }
                    );


                    document
                        .querySelector(
                            ".products-section"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });


                    if (!found) {

                        showNotification(
                            `No ${categoryName} products found`
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       VIEW ALL
    ===================================================== */

    document
        .querySelectorAll(
            ".view-all"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    showAllProducts();

                }
            );

        });


    function showAllProducts() {

        productCards.forEach(
            card => {

                card.style.display =
                    "";

            }
        );


        if (searchInput) {

            searchInput.value =
                "";

        }


        const noResult =
            document.querySelector(
                ".search-no-result"
            );


        if (noResult) {

            noResult.style.display =
                "none";

        }


        document
            .querySelector(
                ".products-section"
            )
            ?.scrollIntoView({
                behavior:
                    "smooth"
            });

    }


    /* =====================================================
       MY ORDERS
    ===================================================== */

    function renderOrders() {

        /*
           Try different possible
           containers from HTML.
        */

        let container =
            document.querySelector(
                ".orders-list"
            );


        if (!container) {

            container =
                document.querySelector(
                    "#ordersList"
                );

        }


        if (!container) {

            container =
                document.querySelector(
                    ".orders-container"
                );

        }


        if (!container) {

            /*
               Screenshot page has
               "No Orders Yet".
            */

            const empty =
                Array.from(
                    document.querySelectorAll(
                        "*"
                    )
                ).find(
                    element =>
                        element.children.length === 0 &&
                        element.textContent
                            .trim() ===
                            "No Orders Yet"
                );


            if (empty) {

                container =
                    empty.parentElement;

            }

        }


        /*
           If still no container,
           create one.
        */

        if (!container) {

            container =
                document.createElement(
                    "div"
                );


            container.className =
                "furnicasa-orders-container";


            container.style.cssText = `

                width:min(1100px,92%);

                margin:40px auto;

            `;


            document.body.appendChild(
                container
            );

        }


        /*
           Empty orders
        */

        if (
            orders.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="empty-orders"
                    style="
                    text-align:center;
                    padding:70px 20px;
                    border:1px dashed #ddd;
                    border-radius:10px;
                    "
                >

                    <div
                        style="
                        font-size:55px;
                        margin-bottom:15px;
                        "
                    >
                        📦
                    </div>

                    <h2>
                        No Orders Yet
                    </h2>

                    <p
                        style="
                        color:#777;
                        margin:12px 0 20px;
                        "
                    >
                        Your orders will appear
                        here after you place
                        an order.
                    </p>

                    <a
                        href="#shop"
                        class="btn btn-primary"
                        onclick="
                            document
                                .querySelector(
                                    '.products-section'
                                )
                                ?.scrollIntoView({
                                    behavior:'smooth'
                                });
                        "
                    >
                        Start Shopping
                    </a>

                </div>

            `;

            return;

        }


        /*
           Orders exist
        */

        container.innerHTML = `

            <div
                class="orders-header"
                style="
                margin-bottom:25px;
                "
            >

                <span
                    style="
                    color:#c98222;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:2px;
                    "
                >
                    CUSTOMER AREA
                </span>

                <h2
                    style="
                    font-family:'Playfair Display',serif;
                    font-size:34px;
                    margin-top:7px;
                    "
                >
                    My Orders
                </h2>

            </div>


            <div
                class="orders-grid"
            >

                ${orders.map(
                    order =>
                        renderSingleOrder(
                            order
                        )
                ).join("")}

            </div>

        `;


        addOrdersStyle();

    }


    function renderSingleOrder(
        order
    ) {

        return `

            <div
                class="order-card"
                style="
                border:1px solid #e5e5e5;
                border-radius:10px;
                padding:20px;
                margin-bottom:18px;
                background:white;
                "
            >

                <div
                    style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    flex-wrap:wrap;
                    padding-bottom:15px;
                    border-bottom:1px solid #eee;
                    "
                >

                    <div>

                        <strong>
                            ${order.id}
                        </strong>

                        <div
                            style="
                            color:#777;
                            font-size:13px;
                            margin-top:5px;
                            "
                        >
                            ${order.date}
                        </div>

                    </div>


                    <span
                        style="
                        display:inline-block;
                        padding:6px 12px;
                        border-radius:20px;
                        background:#fff3df;
                        color:#c98222;
                        font-size:12px;
                        font-weight:700;
                        "
                    >
                        ${order.status}
                    </span>

                </div>


                <div
                    style="
                    margin-top:15px;
                    "
                >

                    ${order.items.map(
                        item => `

                            <div
                                style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                                padding:10px 0;
                                border-bottom:1px solid #f2f2f2;
                                "
                            >

                                <img
                                    src="${item.image}"
                                    alt="${item.name}"
                                    style="
                                    width:65px;
                                    height:65px;
                                    object-fit:cover;
                                    border-radius:6px;
                                    "
                                >

                                <div
                                    style="
                                    flex:1;
                                    "
                                >

                                    <strong>
                                        ${item.name}
                                    </strong>

                                    <div
                                        style="
                                        color:#777;
                                        font-size:13px;
                                        margin-top:4px;
                                        "
                                    >
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

                        `
                    ).join("")}

                </div>


                <div
                    style="
                    display:flex;
                    justify-content:flex-end;
                    gap:25px;
                    margin-top:18px;
                    flex-wrap:wrap;
                    "
                >

                    <span>
                        Subtotal:
                        <strong>
                            ৳${formatPrice(
                                order.subtotal
                            )}
                        </strong>
                    </span>


                    <span>
                        Discount:
                        <strong>
                            - ৳${formatPrice(
                                order.discount
                            )}
                        </strong>
                    </span>


                    <span
                        style="
                        font-size:18px;
                        "
                    >
                        Total:
                        <strong>
                            ৳${formatPrice(
                                order.total
                            )}
                        </strong>
                    </span>

                </div>

            </div>

        `;

    }


    function addOrdersStyle() {

        if (
            document.getElementById(
                "furnicasaOrdersStyle"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "furnicasaOrdersStyle";


        style.textContent = `

            .orders-grid {

                width:100%;

            }


            .order-card {

                transition:
                    .2s ease;

            }


            .order-card:hover {

                box-shadow:
                    0 10px 30px
                    rgba(0,0,0,.07);

            }


            @media(max-width:600px) {

                .order-card {

                    padding:15px !important;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       MY ORDERS LINKS
    ===================================================== */

    document
        .querySelectorAll(
            "a"
        )
        .forEach(link => {

            const text =
                link.textContent
                    .trim()
                    .toLowerCase();


            if (
                text ===
                "my orders"
            ) {

                link.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        renderOrders();

                        /*
                           If a dedicated
                           orders container exists
                        */

                        const target =
                            document.querySelector(
                                ".orders-container"
                            ) ||
                            document.querySelector(
                                ".orders-list"
                            );


                        if (target) {

                            target.scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                        }

                    }
                );

            }

        });


    /*
       If current page looks like
       My Orders page, render automatically.
    */

    const pageText =
        document.body.textContent
            .toLowerCase();


    if (
        pageText.includes(
            "no orders yet"
        ) ||
        pageText.includes(
            "my orders"
        )
    ) {

        /*
           Delay slightly so HTML
           finishes rendering.
        */

        setTimeout(
            renderOrders,
            100
        );

    }


    /* =====================================================
       OFFER BUTTON
    ===================================================== */

    document
        .querySelectorAll(
            ".offer-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    /*
                       Let #shop work normally.
                    */

                    showNotification(
                        "Offer selected"
                    );

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
                    newsletter.querySelector(
                        "input"
                    );


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

    if (
        mobileMenu &&
        navLinks
    ) {

        mobileMenu.addEventListener(
            "click",
            () => {

                navLinks.classList.toggle(
                    "mobile-active"
                );

            }
        );


        document
            .querySelectorAll(
                ".nav-links a"
            )
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
            document.createElement(
                "style"
            );


        mobileStyle.textContent = `

            @media(max-width:768px) {

                .nav-links.mobile-active {

                    display:flex;

                    position:absolute;

                    top:72px;

                    left:0;

                    width:100%;

                    background:white;

                    flex-direction:column;

                    align-items:flex-start;

                    gap:0;

                    padding:15px 5%;

                    box-shadow:
                        0 10px 20px
                        rgba(0,0,0,.08);

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
       NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(
            ".nav-links a"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-links a"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    link.classList.add(
                        "active"
                    );

                }
            );

        });


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeCartPanel();

                const searchBox =
                    document.querySelector(
                        ".furnicasa-search-wrapper"
                    );


                if (searchBox) {

                    searchBox.remove();

                }

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartCount();

    updateWishlistCount();

    renderCart();


    console.log(
        "Cart:",
        cart
    );

    console.log(
        "Wishlist:",
        wishlist
    );

    console.log(
        "Orders:",
        orders
    );


});