import { cartItems, products } from "../data/db.js";
import { v4 as uuidv4 } from "uuid";
export function viewCart(req, res) {
    const userId = req.headers["user-id"];
    const userCart = cartItems.filter((item) => item.userId === userId);

    const result = userCart.map((item) => {
        const product = products.find((p) => p.id === item.product_Id);
        return {
            ...item,
            product,
        };
    });

    return res.status(200).json(result);

}


export function addToCart(req,res) {
    const userId = req.headers["user-id"];
    const{productId} = req.body;
    const {quantity} = 1;

    const product = products.find((p) => p.id === productId);
    if(!product) {
        return res.status(404).json({message: "Product not found!"});
    }

    if(product.stock < quantity) {
        return res.status(400).json({message: "Not enough stock!"});
    }

    const existingCartItem = cartItems.find((item) => item.userId === userId);
    if(existingCartItem) {
        existingCartItem.quantity += quantity;
    } else {
        cartItems.push({
            id: uuidv4(),
            userId: userId,
            products: [{ id: productId, quantity }],
            quantity
        });       
    }
}



export function updateCartItem(req, res) {
    
}

export function removeCartItem(req, res) {
    
}

