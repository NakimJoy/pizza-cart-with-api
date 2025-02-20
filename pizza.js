document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: 'NakimJoy',
            cartId: 'Am61ot4pZI',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("Username is too short");
                }
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                }

            },
            createCart() {
                if (!this.username) {
                    this.cartId = 'No username to create a cart for'
                    return Promise.resolve();
                }

                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = 'https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}'
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },


            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartURL);
            },

            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },
            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },

            pay(amount) {

                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay',
                    {
                        "cart_code": this.cartId,
                        amount
                    });

            },
            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },
            init() {
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                this.username = storedUsername;

                }
                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                    });


                if (!this.cartId) {
                    this
                        .createCart()
                        .then((result) => {
                            this.cartId = result.data.cart_code;
                            this.showCartData();

                        });

                }
            },
            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    });
            },
            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    });
            },
            payForCart() {
                // alert("Pay now :" + this.paymentAmount)

                this
                    .pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status == 'failure') {
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 3000);
                        } else {
                            this.message = 'Payment received!';

                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartTotal = 0.00,
                                    this.cartId = ''
                                this.paymentAmount = 0;
                                localStorage['cartId'] = '';
                                this.createCart();
                            }, 3000);

                        }
                    })
            }
        };

    });
});
