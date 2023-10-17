import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IReply extends Document {
  _id: Types.ObjectId;
  user: IUser;
  answer: string;
  createdAt: Date;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  user: IUser;
  title?: string;
  question: string;
  questionReplies: IReply[];
  createdAt: Date;
}

export interface IReviewReply extends Document {
  _id: Types.ObjectId;
  user: IUser;
  answer: string;
  createdAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IReviewReply[];
}

export interface ILink extends Document {
  title: string;
  url: string;
}

export interface ICourseData extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IQuestion[];
}

export interface ICourse extends Document {
  name: string;
  description?: string;
  category: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    public_id: string;
    url: string;
  };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  forWho: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
}

const replySchema = new Schema<IReply>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    answer: String,
  },
  { timestamps: true }
);

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, default: 0 },
    comment: String,
    commentReplies: [replySchema],
  },
  { timestamps: true }
);

const linkSchema = new Schema<ILink>({ title: String, url: String });

const commentSchema = new Schema<IQuestion>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    question: String,
    questionReplies: [replySchema],
  },
  { timestamps: true }
);

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  // videoThumbnail: Object,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: { type: Number },
    thumbnail: {
      public_id: {
        type: String,
        //  required: true
      },
      url: {
        type: String,
        // required: true
      },
    },
    tags: { type: String, required: true },
    level: { type: String, required: true },
    demoUrl: { type: String, required: true },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    forWho: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
