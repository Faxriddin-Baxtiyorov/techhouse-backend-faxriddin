import express from "express";
import { 
    viewCart,
    addToCart,
    updateCartItem, 
    removeCartItem  
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", viewCart);
router.post("/items", addToCart);
router.put("/items/:id", updateCartItem);
router.delete("/items/:id", removeCartItem);
router.delete("/item/:id", removeCartItem);

export default router;
