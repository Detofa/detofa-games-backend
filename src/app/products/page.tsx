import Header from "../components/Header";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  // Mock data - replace with actual API calls
  const products = [
    {
      id: "1",
      name: "Gaming Headset Pro",
      price: 89.99,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      category: "Audio",
    },
    {
      id: "2",
      name: "Mechanical Keyboard RGB",
      price: 129.99,
      imageUrl:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
      category: "Peripherals",
    },
    {
      id: "3",
      name: "Gaming Mouse Wireless",
      price: 59.99,
      imageUrl:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      category: "Peripherals",
    },
    {
      id: "4",
      name: "Gaming Chair Ergonomic",
      price: 199.99,
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      category: "Furniture",
    },
    {
      id: "5",
      name: 'Gaming Monitor 27"',
      price: 299.99,
      imageUrl:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
      category: "Monitors",
    },
    {
      id: "6",
      name: "Gaming Mousepad XL",
      price: 19.99,
      imageUrl:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      category: "Peripherals",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
