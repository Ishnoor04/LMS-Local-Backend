require('dotenv').config()
import { Response, Request, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import orderModel, { IOrder } from "../models/orderModel";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notificationModel";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

//create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info }: IOrder = req.body;
      console.log(courseId, payment_info)
      if(payment_info) {
        if("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          if(paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Payment not authorised", 400))
          }
        }
      }
      const user = await userModel.findById(req.user?._id);
      const courseExists = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );
      if (courseExists) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 400));
      }
      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );
      try {
        if (user) {
          await sendMail({
            email: user?.email,
            subject: "Order confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
      user?.courses.push(course._id.toString());
      await redis.set(req.user?._id, JSON.stringify(user))
      await user?.save();
      await notificationModel.create({
        userId: user?._id.toString(),
        title: "New Order",
        message: `You have a new order for ${course.name} from ${user?.name}`,
      });
      if (!course.purchased) {
        return next(new ErrorHandler("No course purchased", 400));
      } else {
        course.purchased += 1
      }
      await course.save();
      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//get all orders
export const getAllOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//payment stripe -> send stripe publish key
export const sendStripePublishableKey = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    res.status(200).json({
      publishablekey: process.env.STRIPE_PUBLISHABLE_KEY
    })
})

export const newPayment = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
  try {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency:"usd",
      shipping: {
        name: 'Jenny Rosen',
        address: {
          line1: '510 Townsend St',
          postal_code: '98140',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
        },
      },
      metadata:{
        company:"E-Learning",
      },
      description:"Description",
      automatic_payment_methods:{
        enabled:true
      }
    })
    res.status(201).json({
      success:true,
      client_secret: myPayment.client_secret
    })
  } catch (error:any) {
    return next(new ErrorHandler(error.message,500))
  }
})