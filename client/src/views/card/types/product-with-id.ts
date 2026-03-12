import { Product } from "@/src/entities/product/model/model.types";

export type ProductWithId = Product & { _id?: string; id?: string };
