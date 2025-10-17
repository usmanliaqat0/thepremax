/**
 * Query optimization utilities for better database performance
 */

import mongoose, { PipelineStage } from "mongoose";
import Product from "./models/Product";
import Order from "./models/Order";
import User from "./models/User";

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CursorPaginationResult<T> {
  data: T[];
  hasNext: boolean;
  lastId?: string;
}

export class QueryOptimizer {
  /**
   * Optimized product query with proper indexing and aggregation
   */
  static async getProductsOptimized(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginationResult<Record<string, unknown>>> {
    const skip = (page - 1) * limit;

    // Use aggregation pipeline for better performance
    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          basePrice: 1,
          compareAtPrice: 1,
          categoryId: 1,
          images: 1,
          onSale: 1,
          inStock: 1,
          rating: 1,
          reviewCount: 1,
          totalSold: 1,
          status: 1,
          category: { _id: 1, name: 1, slug: 1 },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    // Add sorting
    const sortField = this.getSortField(sortBy);
    pipeline.push({ $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } });

    // Get total count efficiently
    const countPipeline = [...pipeline];
    const totalPipeline = [...countPipeline, { $count: "total" }];

    const [totalResult, products] = await Promise.all([
      Product.aggregate(totalPipeline),
      Product.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Cursor-based pagination for better performance with large datasets
   */
  static async getProductsCursor(
    filter: Record<string, unknown>,
    limit: number,
    lastId?: string
  ): Promise<CursorPaginationResult<Record<string, unknown>>> {
    const query: Record<string, unknown> = { ...filter };

    if (lastId) {
      query._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasNext = products.length > limit;
    if (hasNext) {
      products.pop(); // Remove extra item
    }

    return {
      data: products,
      hasNext,
      lastId: hasNext
        ? products[products.length - 1]._id.toString()
        : undefined,
    };
  }

  /**
   * Optimized order query with user population
   */
  static async getOrdersOptimized(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginationResult<Record<string, unknown>>> {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $project: {
          orderNumber: 1,
          status: 1,
          paymentStatus: 1,
          total: 1,
          items: 1,
          shippingAddress: 1,
          trackingNumber: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
        },
      },
    ];

    // Add sorting
    const sortField = this.getSortField(sortBy);
    pipeline.push({ $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } });

    // Get total count and data in parallel
    const countPipeline = [...pipeline];
    const totalPipeline = [...countPipeline, { $count: "total" }];

    const [totalResult, orders] = await Promise.all([
      Order.aggregate(totalPipeline),
      Order.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get products with statistics using aggregation
   */
  static async getProductsWithStats(
    filter: Record<string, unknown>,
    limit: number = 10
  ): Promise<Record<string, unknown>[]> {
    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "items.productId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSold: {
            $sum: {
              $map: {
                input: "$orders",
                as: "order",
                in: {
                  $sum: {
                    $map: {
                      input: "$$order.items",
                      as: "item",
                      in: {
                        $cond: [
                          { $eq: ["$$item.productId", "$_id"] },
                          "$$item.quantity",
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          orderCount: { $size: "$orders" },
        },
      },
      {
        $project: {
          orders: 0, // Remove orders array to reduce data size
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ];

    return await Product.aggregate(pipeline);
  }

  /**
   * Get dashboard statistics efficiently
   */
  static async getDashboardStats(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Record<string, unknown>[];
    topProducts: Record<string, unknown>[];
  }> {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      User.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active" }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      this.getProductsWithStats({ status: "active" }, 5),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      recentOrders,
      topProducts,
    };
  }

  /**
   * Helper method to get sort field for different models
   */
  private static getSortField(sortBy: string): string {
    const sortFieldMap: Record<string, string> = {
      price: "basePrice",
      name: "name",
      rating: "rating",
      date: "createdAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      total: "total",
      status: "status",
    };

    return sortFieldMap[sortBy] || "createdAt";
  }

  /**
   * Batch operations to avoid N+1 queries
   */
  static async batchGetUsers(
    userIds: string[]
  ): Promise<Record<string, Record<string, unknown>>> {
    const users = await User.find({
      _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    return users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {} as Record<string, Record<string, unknown>>);
  }

  /**
   * Batch get products by IDs
   */
  static async batchGetProducts(
    productIds: string[]
  ): Promise<Record<string, Record<string, unknown>>> {
    const products = await Product.find({
      _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    return products.reduce((acc, product) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {} as Record<string, Record<string, unknown>>);
  }
}
