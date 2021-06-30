//----------------------------------------- GLOBAL EVENT BUS ------------------------------------------//
var eventBus = new Vue()

//---------------------------------------------- COMPONENTS -------------------------------------------//

//-------------- GENERAL PRODUCT ---------------//
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image">
            </div>

            <div class="product-info">
                <h1>{{title}}</h1>
                <p v-if="inStock">In stock</p>
                <p v-else :class="{outOfStock: !inStock}">Out of stock</p>
                <p>{{sale}}</p>
                <p>Shipping: {{shipping}}</p>
                <product-details :details="details"></product-details>
                <a :href="link">More products like this</a>
                <div v-for="(variant, index) in variants" :key="variant.variantId" class="color-box"
                    :style="{backgroundColor: variant.variantColor}"
                    @mouseover="updateProduct(index)">
                </div>
                <ul>
                    <li v-for="size in sizes">{{size}}</li>
                </ul>
                <button v-on:click="addToCart" :disabled="!inStock" :class="{disabledButton: !inStock}">Add to cart</button>
                <button v-on:click="removeFromCart">Remove from cart</button>
            </div>

            <product-tabs :reviews="reviews"></product-tabs>
        </div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            onSale: false,
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            variants: [{
              variantId: 2234,
              variantColor: "green",
              variantImage: './images/vmSocks-green-onWhite.jpg',
              variantQuantity: 5
              },
              {
              variantId: 2235,
              variantColor: "blue",
              variantImage: './images/vmSocks-blue-onWhite.jpg',
              variantQuantity: 10
              }],
            sizes: ["XS", "S", "M", "L", "XL"],
            link: 'http://www.mercadolivre.com.br',
            reviews: []
          }
        },
        methods: {
            addToCart() {
                this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            },
            removeFromCart() {
                this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
            },
            updateProduct(index) {
                this.selectedVariant = index
                console.log(index)
            }
        },
        computed: {
            title() {
                return this.brand + ' ' + this.product
            },
            image() {
                return this.variants[this.selectedVariant].variantImage
            },
            inStock() {
                return this.variants[this.selectedVariant].variantQuantity
            },
            sale() {
                if(this.onSale) {
                    return this.brand + ' ' + this.product + ' are on SALE!'
                }
            },
            shipping() {
                if(this.premium) {
                    return "Free"
                }
                return "U$2.99"
            }
        },
        mounted() {
            eventBus.$on('review-submitted', productReview => {
                this.reviews.push(productReview)
            })
        }    
})

//-------------- PRODUCT DETAILS ---------------//
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
        <li v-for="detail in details">{{detail}}</li>
    </ul>
    `
})

//-------------- PRODUCT REVIEWS ---------------//
Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s): </b>
            <ul>
                <li v-for="error in errors">{{error}}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name: </label>
            <input id="name" v-model="name">
        </p>

        <p>
            <label for="review">Review: </label>
            <textarea id="review" v-model="review"></textarea>
        </p>

        <p>
            <label for="rating">Rating: </label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>

        <p>Would you recommend this product?</p>

        <label>
            Yes
            <input type="radio" value="Yes" v-model="recommendation"></input>
        </label>

        <label>
            No
            <input type="radio" value="No" v-model="recommendation"></input>
        </label>

        <input type="submit" value="Submit">
    </form>
    `,
    data () {
        return {
            name: null,
            review: null,
            rating: null,
            recommendation: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommendation) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommendation = null
            }else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommendation) this.errors.push("Recommendation required.")
            }           
        }
    }
})

//-------------- PRODUCT TABS ---------------//
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
      <div>    
        <ul>
          <span class="tab" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab = tab">{{ tab }}</span>
        </ul> 

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{review.name}}</p>
                    <p>Rating: {{review.rating}}</p>
                    <p>{{review.review}}</p>
                    <p>Would you recomment this product? {{review.recommendation}}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>
        </div>
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })

//---------------------------------------------- INSTANCES -------------------------------------------//
  var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        addItem(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            for(var i = this.cart.length -1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
  })