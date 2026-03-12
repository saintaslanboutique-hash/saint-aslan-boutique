import { useAccessoryStore } from "@/store/accessories.store";
import { useBagStore } from "@/store/bags.store";
import { useEffect, useState, useRef } from "react";
import AccessoriesCard from "../accessories/accessories-card";
import BagsCard from "../bags/bags-card";
import { useModalStore } from "@/store/modal.store";
import AccessoriesForm from "../accessories/accessories-form";
import BagsForm from "../bags/bags-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";

export default function ProductsManager() {
  const { accessories, getAccessories, searchResults: accessoriesSearchResults, isSearching: isSearchingAccessories, categoryCounts: accessoriesCategoryCounts, getCategoryCounts: getAccessoriesCategoryCounts, getAccessoriesByCategory } = useAccessoryStore();
  const { bags, getBags, searchResults: bagsSearchResults, isSearching: isSearchingBags, categoryCounts: bagsCategoryCounts, getCategoryCounts: getBagsCategoryCounts, getBagsByCategory } = useBagStore();
  const { openModal } = useModalStore();
  const accessoryStore = useAccessoryStore();
  const bagStore = useBagStore();
  const { user } = useAuthStore();
  
  const [productType, setProductType] = useState<"accessories" | "bags">("accessories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentSort = productType === "accessories" ? accessoryStore.currentSort : bagStore.currentSort;
  const setCurrentSort = productType === "accessories" ? accessoryStore.setCurrentSort : bagStore.setCurrentSort;
  const searchQuery = productType === "accessories" ? accessoryStore.searchQuery : bagStore.searchQuery;
  const setSearchQuery = productType === "accessories" ? accessoryStore.setSearchQuery : bagStore.setSearchQuery;
  const searchProducts = productType === "accessories" ? accessoryStore.searchAccessories : bagStore.searchBags;
  const clearSearch = productType === "accessories" ? accessoryStore.clearSearch : bagStore.clearSearch;
  const searchResults = productType === "accessories" ? accessoriesSearchResults : bagsSearchResults;
  const isSearching = productType === "accessories" ? isSearchingAccessories : isSearchingBags;
  const categoryCounts = productType === "accessories" ? accessoriesCategoryCounts : bagsCategoryCounts;
  const products = productType === "accessories" ? accessories : bags;

  // Check if user is admin or super_admin
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "all") return "All";
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get category counts from store
  const currentCategories = productType === "accessories" ? ACCESSORIES_CATEGORIES : BAGS_CATEGORIES;
  const categories = [
    { name: "all", count: categoryCounts?.total || 0 },
    ...currentCategories.map(category => ({
      name: category,
      count: categoryCounts?.categories.find(c => c.category === category)?.count || 0
    }))
  ];

  const handleSortBy = (sortBy: string) => {
    setCurrentSort(sortBy);
    if (productType === "accessories") {
      getAccessoriesByCategory(selectedCategory, sortBy);
    } else {
      getBagsByCategory(selectedCategory, sortBy);
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (productType === "accessories") {
      getAccessoriesByCategory(category, currentSort);
    } else {
      getBagsByCategory(category, currentSort);
    }
  }

  const handleProductTypeChange = (type: "accessories" | "bags") => {
    setProductType(type);
    setSelectedCategory("all");
    setShowSearchDropdown(false);
    clearSearch();
  }

  useEffect(() => {
    getAccessories();
    getAccessoriesCategoryCounts();
    getBags();
    getBagsCategoryCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (productType === "accessories") {
      getAccessoriesByCategory(selectedCategory, currentSort);
    } else {
      getBagsByCategory(selectedCategory, currentSort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentSort, productType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenModal = () => {
    openModal();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      searchProducts(value);
      setShowSearchDropdown(true);
    } else {
      clearSearch();
      setShowSearchDropdown(false);
    }
  }

  const handleProductClick = (productId: string) => {
    const path = productType === "accessories" ? `/accessories/${productId}` : `/bags/${productId}`;
    navigate(path);
    setShowSearchDropdown(false);
    clearSearch();
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-gray-900" />
            <h1 className="text-5xl md:text-6xl font-serif font-light text-gray-900">
              Products Manager
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">
            Manage your product catalog
          </p>
        </div>

        {/* Product Type Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
          <button
            onClick={() => handleProductTypeChange("accessories")}
            className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${
              productType === "accessories"
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 hover:text-gray-600 border-transparent"
            }`}
          >
            Accessories
          </button>
          <button
            onClick={() => handleProductTypeChange("bags")}
            className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${
              productType === "bags"
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 hover:text-gray-600 border-transparent"
            }`}
          >
            Bags
          </button>
        </div>

        {/* Controls: Sort and Search */}
        <div className="flex items-start justify-between mb-8 gap-6 flex-wrap">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-4 py-2 border-b-2 border-gray-300 hover:border-gray-900 rounded-none bg-transparent text-gray-700">
                  {currentSort === "latest" && "Sort by latest"}
                  {currentSort === "price-low" && "Price: Low to High"}
                  {currentSort === "price-high" && "Price: High to Low"}
                  {currentSort === "name" && "Name: A to Z"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem onClick={() => handleSortBy("latest")}>
                  Sort by latest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortBy("price-low")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortBy("price-high")}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortBy("name")}>
                  Name: A to Z
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery} 
                onChange={(e) => handleSearch(e)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Search Dropdown */}
              {showSearchDropdown && isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                ${product.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Product Button */}
          <Button 
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2" 
            onClick={handleOpenModal}
          >
            <Plus className="w-4 h-4" />
            Add {productType === "accessories" ? "Accessory" : "Bag"}
          </Button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-6 mb-12 overflow-x-auto pb-2 border-b border-gray-200">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`whitespace-nowrap font-light text-lg pb-3 transition-colors border-b-2 ${
                selectedCategory === category.name
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 hover:text-gray-600 border-transparent"
              }`}
            >
              {formatCategoryName(category.name)}
              <span className="ml-1">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> {productType}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productType === "accessories" ? (
                accessories.map((product) => (
                  <AccessoriesCard key={product._id} product={product} showDelete={isAdmin} />
                ))
              ) : (
                bags.map((product) => (
                  <BagsCard key={product._id} product={product} showDelete={isAdmin} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">No {productType} yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first {productType === "accessories" ? "accessory" : "bag"}</p>
            <Button 
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2" 
              onClick={handleOpenModal}
            >
              <Plus className="w-5 h-5" />
              Add Your First {productType === "accessories" ? "Accessory" : "Bag"}
            </Button>
          </div>
        )}
      </div>
      {productType === "accessories" ? <AccessoriesForm /> : <BagsForm />}
    </div>
  );
}