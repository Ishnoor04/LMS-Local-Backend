import { Schema, Model, Document } from "mongoose";
import mongoose from "mongoose";

export interface FaqItem extends Document {
  question: string;
  answer: string;
}
export interface Category extends Document {
  title: string;
}
export interface BannerImage extends Document {
  public_id: string;
  url: string;
}
export interface Layout extends Document {
  type: string;
  faq: FaqItem[];
  categories: Category[];
  banner: {
    image: BannerImage;
    title: string;
    subTitle: string;
  };
}

const faqSchema: Schema<FaqItem> = new mongoose.Schema({
  question: String,
  answer: String,
});
const categorySchema: Schema<Category> = new mongoose.Schema({
  title: String,
});
const bannerImageSchema: Schema<BannerImage> = new mongoose.Schema({
  public_id: String,
  url: String,
});
const layoutSchema: Schema<Layout> = new mongoose.Schema({
  type: String,
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: String,
    subTitle: String,
  },
});

const layoutModel: Model<Layout> =  mongoose.model("Layout", layoutSchema);
export default layoutModel;
