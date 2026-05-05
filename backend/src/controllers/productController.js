import { v4 as uuidv4 } from "uuid";
import { products } from "../data/db.js";


export function getProduct(req, res){
    const id = req.params.id;
    const product = products.find(product => product.id === id);
    if(!product){
        return res.status(404).json({message: "Product not found!"});
    }
    return res.status(200).json(product);
}


export function getProducts(req,res){
    return res.status(200).json(products);
}

export function createProduct(req, res){
    const {name, price, stock, description, category, image_url} = req.body;
    if(!name || price === undefined || stock === undefined || !category){
        return res.status(400).json({message: "All fields are required!"});
    }
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    if(Number.isNaN(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0){
        return res.status(400).json({message: "Price and stock must be valid positive numbers!"});
    }
    const newProduct = {
        id: uuidv4(),
        name,
        price: numericPrice,
        stock: numericStock,
        description: description ?? "",
        category,
        image_url: image_url ?? "",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    products.push(newProduct);
    return res.status(201).json({message: "Product created successfully!", product: newProduct});
}



export function updateProduct(req,res){
    const id = req.params.id;
    const {name, price, stock, description, category, image_url} = req.body;
    const product = products.find(product => product.id === id);
    if(!product){
        return res.status(404).json({message: "Product not found!"});
    }
    if(price !== undefined && (Number.isNaN(Number(price)) || Number(price) < 0)){
        return res.status(400).json({message: "Price must be a valid positive number!"});
    }
    if(stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)){
        return res.status(400).json({message: "Stock must be a valid positive number!"});
    }
    product.name = name ?? product.name;
    product.price = price === undefined ? product.price : Number(price);
    product.stock = stock === undefined ? product.stock : Number(stock);
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.image_url = image_url ?? product.image_url;
    product.updatedAt = Date.now();
    return res.status(200).json({message: "Product updated successfully!", product});

}

export function deleteProduct(req,res){
    const id = req.params.id;
    const product = products.find(product => product.id === id);
    if(!product){
        return res.status(404).json({message: "Product not found!"});
    }
    products.splice(products.indexOf(product), 1);
    return res.status(200).json({message: "Product deleted successfully!"});
}

