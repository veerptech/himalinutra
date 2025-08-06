import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  badge?: string;
  category?: string;
  description?: string;
  rating?: number;
  isEditing?: boolean;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image_url: "",
    badge: "",
    category: "",
    description: "",
    rating: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productList);
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image_url) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        image_url: newProduct.image_url,
        badge: newProduct.badge,
        category: newProduct.category,
        description: newProduct.description,
        rating: parseInt(newProduct.rating),
        reviews: 0,
        benefits: [],
        variant: "skin",
      });
      setNewProduct({
        name: "",
        price: "",
        image_url: "",
        badge: "",
        category: "",
        description: "",
        rating: "",
      });
      setShowForm(false);
      fetchProducts();
    } catch {
      setError("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    } catch {
      setError("Failed to delete product");
    }
  };

  const toggleEdit = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isEditing: !p.isEditing } : { ...p, isEditing: false }
      )
    );
  };

  const handleEditChange = (id: string, field: string, value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, [field]: field === "price" || field === "rating" ? parseFloat(value) : value }
          : p
      )
    );
  };

  const handleUpdateProduct = async (id: string) => {
    const productToUpdate = products.find((p) => p.id === id);
    if (!productToUpdate) return;

    try {
      await updateDoc(doc(db, "products", id), {
        name: productToUpdate.name,
        price: productToUpdate.price,
        image_url: productToUpdate.image_url,
        badge: productToUpdate.badge,
        category: productToUpdate.category,
        description: productToUpdate.description,
        rating: productToUpdate.rating,
      });
      toggleEdit(id);
      fetchProducts();
    } catch {
      setError("Failed to update product");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {error && <p className="text-red-500">{error}</p>}

      <Button onClick={() => setShowForm((prev) => !prev)}>
        {showForm ? "Close Form" : "Add New Product"}
      </Button>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow border">
          <Input
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <Input
            placeholder="Image URL:"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
          />
          <Input
            placeholder="Badge: eg.Best Seller"
            value={newProduct.badge}
            onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
          />
          <Input
            placeholder="Category: eg.Skin, Hair"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <Input
            placeholder="Rating"
            type="number"
            value={newProduct.rating}
            onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
          />
          <Textarea
            placeholder="Description: eg. This product is great for..."
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="col-span-full"
          />
          <Button onClick={handleAddProduct} className="col-span-full">
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 bg-muted shadow-sm space-y-2"
          >
            {product.isEditing ? (
              <>
                <Input
                  value={product.name}
                  onChange={(e) => handleEditChange(product.id, "name", e.target.value)}
                />
                <Input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleEditChange(product.id, "price", e.target.value)}
                />
                <Input
                  value={product.image_url}
                  onChange={(e) => handleEditChange(product.id, "image", e.target.value)}
                />
                <Input
                  value={product.badge}
                  onChange={(e) => handleEditChange(product.id, "badge", e.target.value)}
                />
                <Input
                  value={product.category}
                  onChange={(e) => handleEditChange(product.id, "category", e.target.value)}
                />
                <Textarea
                  value={product.description}
                  onChange={(e) =>
                    handleEditChange(product.id, "description", e.target.value)
                  }
                />
                <Input
                  value={product.rating?.toString() || ""}
                  type="number"
                  onChange={(e) => handleEditChange(product.id, "rating", e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateProduct(product.id)}>Save</Button>
                  <Button variant="outline" onClick={() => toggleEdit(product.id)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">₹{product.price}</p>
                    <p className="text-xs">Badge: {product.badge}</p>
                    <p className="text-xs">Category: {product.category}</p>
                    <p className="text-xs">Rating: {product.rating}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toggleEdit(product.id)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
