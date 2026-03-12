'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Ruler, Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useProductStore } from '../model/product.store';
import { useProductStore as useModelStore } from '../model/model.store';
import type { Product } from '../model/model.types';

type ProductWithId = Product & { _id?: string };
type LocaleKey = keyof Product['name'];

const tabKeys = ['description', 'delivery', 'assistance'] as const;

export type ProductPageAddToCartProps = {
  onAddToCart?: (product: ProductWithId, quantity: number) => void;
};

export default function ProductPage({
  productId,
  onAddToCart,
}: {
  productId: string;
} & ProductPageAddToCartProps) {
  const t = useTranslations('productPage');
  const locale = useLocale() as LocaleKey;

  const { selectedProduct, fetchProductById, isLoading, error } = useModelStore();
  const {
    setProduct,
    wishlistedByProductId,
    toggleWishlisted,
    selectedColorIndexByProductId,
    setSelectedColorIndex,
    selectedSizeIndexByProductId,
    setSelectedSizeIndex,
    selectedImageIndex,
    setSelectedImageIndex,
    resetProductUI,
  } = useProductStore();

  const [activeTab, setActiveTab] = useState<(typeof tabKeys)[number]>('description');
  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const stockDotRef = useRef<HTMLSpanElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (productId) fetchProductById(productId);
    return () => {
      resetProductUI();
    };
  }, [productId, fetchProductById, resetProductUI]);

  useEffect(() => {
    if (selectedProduct && selectedProduct._id === productId) {
      setProduct(selectedProduct as ProductWithId);
    }
    return () => setProduct(null);
  }, [selectedProduct, productId, setProduct]);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current.querySelectorAll('.product-page-reveal'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    },
    { dependencies: [selectedProduct?._id], scope: containerRef }
  );

  const product = useProductStore((s) => s.product) as ProductWithId | null;

  useGSAP(
    () => {
      if (!stockDotRef.current) return;
      gsap.to(stockDotRef.current, {
        scale: 1.15,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { dependencies: [product?._id], scope: containerRef }
  );
  const id = product?._id ?? '';
  const wishlisted = wishlistedByProductId[id] ?? false;
  const selectedColorIndex = selectedColorIndexByProductId[id] ?? 0;
  const selectedSizeIndex = selectedSizeIndexByProductId[id] ?? 0;

  const displayName = product?.name?.[locale] ?? product?.name?.en ?? '';
  const description =
    (product?.description as Record<string, string>)?.[locale] ??
    (product?.description as Record<string, string>)?.en ??
    '';
  const colors =
    product?.colors?.length ? product.colors : ['#000000'];
  const sizes = product?.sizes?.length ? product.sizes : ['S', 'M', 'L'];
  const images = product?.images?.length
    ? product.images
    : product?.image
      ? [product.image]
      : [];
  const mainImage = images[selectedImageIndex] ?? product?.image ?? '';

  const handleThumbClick = useCallback(
    (index: number) => {
      if (index === selectedImageIndex) return;
      const prev = mainImageRef.current;
      if (prev) {
        gsap.fromTo(prev, { opacity: 0.3 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
      setSelectedImageIndex(index);
    },
    [selectedImageIndex, setSelectedImageIndex]
  );

  if (isLoading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-neutral-900 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="font-host-grotesk max-w-7xl mx-auto px-4 py-8 md:py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: gallery */}
        <div className="product-page-reveal space-y-3">
          <div
            ref={mainImageRef}
            className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={mainImage || ''}
                  alt={displayName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <motion.button
                  key={index}
                  ref={(el) => {
                    thumbRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => handleThumbClick(index)}
                  className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden bg-neutral-100 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
                  style={{
                    borderColor: index === selectedImageIndex ? '#171717' : '#e5e5e5',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover object-center"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="product-page-reveal flex flex-col">
          {/* Breadcrumb */}
          <nav className="text-sm text-neutral-500 mb-4">
            <span>{t('home')}</span>
            <span className="mx-1">/</span>
            <span>{t('newIn')}</span>
            <span className="mx-1">/</span>
            <span className="text-neutral-900">{displayName}</span>
          </nav>

          <h1 className="font-michroma text-2xl md:text-3xl font-bold uppercase tracking-wide text-neutral-900 mb-4">
            {displayName}
          </h1>

          <div className="mb-6">
            <span className="font-michroma text-xl font-medium text-neutral-900">
              {product.price} AZN
            </span>
            <p className="text-sm text-neutral-500 mt-0.5">{t('taxIncluded')}</p>
          </div>

          {/* Color */}
          <div className="mb-6">
            <p className="text-sm font-medium text-neutral-900 mb-2">
              {t('color')} - {typeof colors[selectedColorIndex] === 'string' && colors[selectedColorIndex].toLowerCase() === '#000000' ? 'Black' : colors[selectedColorIndex]}
            </p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color, index) => {
                const isBlack =
                  typeof color === 'string' &&
                  (color.toLowerCase() === '#000000' || color.toLowerCase() === 'black');
                const isSelected = index === selectedColorIndex;
                return (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColorIndex(id, index)}
                    className="relative rounded-full w-8 h-8 flex items-center justify-center border-2 border-white focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
                    style={{
                      backgroundColor: isBlack ? '#000' : color,
                      boxShadow: '0 0 0 1px #d4d4d4',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && isBlack && (
                      <span className="absolute rounded-full bg-white w-1.5 h-1.5" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <p className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-1">
              {t('size')} -{' '}
              <button
                type="button"
                className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 underline"
              >
                <Ruler className="h-3.5 w-3.5" />
                {t('sizeChart')}
              </button>
            </p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size, index) => {
                const isSelected = index === selectedSizeIndex;
                return (
                  <motion.button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSizeIndex(id, index)}
                    className="min-w-12 px-4 py-2.5 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
                    style={{
                      backgroundColor: isSelected ? '#171717' : '#fff',
                      color: isSelected ? '#fff' : '#171717',
                      borderColor: '#d4d4d4',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {size}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm text-green-700 mb-6">
            <span
              ref={stockDotRef}
              className="inline-block w-2 h-2 rounded-full bg-green-600"
            />
            {t('inStock')}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mb-8">
            <motion.button
              type="button"
              onClick={() => onAddToCart?.(product, 1)}
              disabled={!onAddToCart}
              className="w-full py-4 bg-neutral-900 text-white font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={onAddToCart ? { scale: 1.01 } : {}}
              whileTap={onAddToCart ? { scale: 0.99 } : {}}
            >
              {t('addToCart')}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => toggleWishlisted(id)}
              className="w-full py-3 border border-neutral-300 flex items-center justify-center gap-2 font-medium uppercase tracking-wide text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Heart
                className="h-4 w-4"
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {t('addToWishlist')}
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex gap-6 border-b border-neutral-200 mb-4">
              {tabKeys.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 text-sm font-medium capitalize transition-colors focus:outline-none -mb-px"
                  style={{
                    color: activeTab === tab ? '#171717' : '#737373',
                    borderBottom: activeTab === tab ? '2px solid #171717' : '2px solid transparent',
                  }}
                >
                  {t(tab)}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-neutral-600 space-y-3"
                >
                  <p>{description}</p>
                  <p className="text-neutral-900">
                    Color: {typeof colors[selectedColorIndex] === 'string' && colors[selectedColorIndex].toLowerCase() === '#000000' ? 'Black' : colors[selectedColorIndex]}
                  </p>
                </motion.div>
              )}
              {activeTab === 'delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-neutral-600"
                >
                  Delivery information and shipping options.
                </motion.div>
              )}
              {activeTab === 'assistance' && (
                <motion.div
                  key="assistance"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-neutral-600"
                >
                  Contact and assistance details.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Share */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm text-neutral-500 flex items-center gap-1">
              <Share2 className="h-4 w-4" />
            </span>
            <button type="button" className="text-sm text-neutral-600 hover:text-neutral-900">
              Facebook {t('share')}
            </button>
            <button type="button" className="text-sm text-neutral-600 hover:text-neutral-900">
              X {t('share')}
            </button>
            <button type="button" className="text-sm text-neutral-600 hover:text-neutral-900">
              Pinterest {t('pinIt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
