import { cartItems, products } from "../data/db.js";
import { v4 as uuidv4 } from "uuid"; 

export function viewCart(req, res) {
    const userId = req.headers["user-id"]; 
    const userCart = cartItems.filter((item) => item.userId === userId); 

    if(!userCart) {
        const newCart = {
            id: uuidv4(),
            userId,
            products: [],
            quantity: 0,
        };
        cartItems.push(newCart);
        return res.status(200).json(newCart);
    }
    const cartWithProducts = {
        ...userCart,
        products: userCart.products.map((cartProduct) => {
            const productDetails = products.find((p) => p.id === cartProduct.id);
            return {
                ...cartProduct,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: cartProduct.quantity,
            };
        }
    )};
      return res.status(200).json(cartWithProducts);
}


export function addToCart(req,res) {
        const userId = req.headers["user-id"];
        const { productId, quantity } = req.body; 

        const product = products.find((p) => p.id === productId); 
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        let existingCartItem = cartItems.find(
            item => item.userId === userId && item.products.some(p => p.id === productId)
        );

        if(!existingCartItem) {
            existingCartItem = {
                id: uuidv4(),
                userId,
                products: [],
                quantity: 0,
            };
            cartItems.push(existingCartItem);
            }

        const existingCartItem = cartItems.find(
            item => item.userId === userId && item.product_Id === productId); 
        if (existingCartItem) {
            existingCartItem.quantity += quantity; 
            existingCartItem.products.map((product) => {
                if (product.id === productId) {
                    product.quantity += quantity;
                } else {
                    existingCartItem.products.push({id: productId, quantity});
                }
            });
        } else {
            cartItems.push({
                id: uuidv4(),
                userId,
                products: [{id: productId, quantity}],
                quantity,
            }); 
        }
        return res.status(201).json({ message: "Product added to cart successfully" });
}

export function updateCartItem(req,res) {
    const userId = req.headers["user-id"];
    const id = req.params.id;
    const { quantity } = req.body;

    const userCartItem = cartItems.find((item) => item.userId === userId && item.id === id);

    if (!userCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }
    const product = products.find((p) => p.id === userCartItem.id);
    const diff = quantity - userCartItem.quantity;

    if (diff > 0 && product.stock < diff) {
        return res.status(400).json({ message: "Not enough stock available" });
    }
    userCartItem.quantity = quantity;


    
}

export function removeFromCart() {
    
}
